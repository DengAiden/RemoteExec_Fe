<template>
  <div class="terminal">
    <div id="output">
      <pre v-for="line in outputLines" :key="line.id" :class="line.type">{{ line.text }}</pre>
    </div>
    <div id="input-line">
      <span id="prompt">{{ prompt }}</span>
      <input type="text" id="input" v-model="command" @keydown.enter="handleInput"
        @keydown.up.prevent="navigateHistory(-1)" @keydown.down.prevent="navigateHistory(1)" autofocus
        autocomplete="off">
    </div>
  </div>
</template>

<script>
import { sendCommand } from "../assets/apiUtils";

function extractFileName(command) {
  // 使用正则表达式匹配文件名，支持相对路径和绝对路径
  const regex = /file=@(?:["']?)(.+?)(?:["']?)\s/; // 捕获 file=@ 后的部分
  const match = command.match(regex);

  if (match && match[1]) {
    // 从匹配的路径中提取文件名
    const filePath = match[1];
    // 使用最后一个斜杠分隔路径，提取文件名
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    return fileName; // 返回匹配的文件名
  } else {
    return null; // 如果没有找到，返回 null
  }
}

export default {
  data() {
    return {
      command: '',
      outputLines: [{ id: Date.now(), text: "NuttShell (NSH)", type: 'command' }],
      prompt: 'nsh>',
      IP: localStorage.getItem('deviceIP'),
      server: localStorage.getItem('serverIP'),
      resObj: null,
      commandHistory: [],       // 命令历史
      historyIndex: -1,          // 当前历史索引
      workDirectory: ""
    };
  },
  methods: {
    navigateHistory(direction) {
      // 根据方向更新历史索引
      this.historyIndex = Math.min(Math.max(this.historyIndex + direction, 0), this.commandHistory.length);
      // 更新输入框内容
      if (this.historyIndex < this.commandHistory.length) {
        this.command = this.commandHistory[this.historyIndex];
      } else {
        this.command = ''; // 如果索引超出范围，清空输入
      }
    },
    //回车事件
    handleInput() {
      const commandText = this.command.trim();
      if (commandText) {
        this.outputLines.push({ id: Date.now(), text: `${this.prompt} ${commandText}`, type: 'command' });
        // 检查当前命令是否已存在于历史中
        const index = this.commandHistory.indexOf(commandText);
        if (index !== -1) {
          // 如果命令已存在，从历史中删除
          this.commandHistory.splice(index, 1);
        }
        this.commandHistory.push(commandText); // 将当前命令添加到历史中
        this.historyIndex = this.commandHistory.length; // 更新历史索引
        this.command = '';

        if (this.handleCommand(commandText)) {
          return;
        }

        sendCommand(this.workDirectory + ";" + commandText, this.IP, this.server).then((result) => {
          this.resObj = JSON.parse(result);
          this.displayResult(this.resObj.message);
          if (this.resObj.stateMap.code == 0) {
            this.postCommamd(commandText);
          }
          this.scrollToBottom();
        })
      }
    },
    //预处理指令
    handleCommand(command) {
      command = this.ltrim(command);
      if (command.startsWith("cd ")) {
        console.log(this.workDirectory);
        this.handleCdCommand(command, this.workDirectory).then(newWorkDir => {
          this.workDirectory = newWorkDir;
        });
        return true;
      } else if (command == "clear") {
        this.outputLines = [{ id: Date.now(), text: "NuttShell (NSH)", type: 'command' }];
        return true;
      }
      return false;
    },
    //后处理指令
    postCommamd(command) {
      // 获取命令的前四个字符
      if (command.substring(0, 4) == "curl") {
        // 假设要下载的文件名从命令中提取
        const filename = extractFileName(command); // 从命令的第六个字符开始到结束获取文件名

        var url = `http://62.234.26.198:3000/download/${filename}`

        // 打开新窗口
        window.open(url, '_blank'); // '_blank' 表示在新窗口或标签页中打开
      }
    },
    displayResult(result) {
      this.outputLines.push({ id: Date.now(), text: result, type: 'output' });
      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const outputElement = document.getElementById('output');
        outputElement.scrollTop = outputElement.scrollHeight;
      });
    },
    // 处理 "cd .." 和 "cd" 命令
    async handleCdCommand(cmd, workDir) {
      cmd = cmd.trim()
      if (cmd.slice(-2) === "..") {
        workDir = this.removeLastSlash(workDir) + ';';
      } else {
        const newDir = cmd.slice(3).startsWith('/') ? cmd.slice(3) : '/' + cmd.slice(3);
        workDir = workDir.length ? workDir.slice(0, -1) + newDir + ";" : cmd + ";";
      }

      // 检查 'cd' 命令是否合法
      if (workDir.length && !workDir.startsWith('cd /')) {
        workDir = 'cd /' + workDir.slice(3);
      }

      // 使用 Promise 来处理目录是否存在的检查
      const result = await this.isDirectoryExists(workDir.slice(3));

      console.log(result.stateMap.code == 0);

      const dirExists = result.stateMap.code == 0
      let lastCommand = result.lastCommand
      let lastIndex = lastCommand.lastIndexOf('/');

      // 如果找到斜杠，截取其后的字符串
      if (lastIndex !== -1) {
        lastCommand = lastCommand.substring(lastIndex + 1); // 获取斜杠后的部分
      }

      if (!dirExists) {
        console.log('No such file or directory');
        this.displayResult("cd: " + lastCommand + ": No such file or directory");
        this.scrollToBottom();
        workDir = this.removeLastSlash(workDir) + ';';
      }

      // 返回最终的 workDir
      return workDir;
    },

    // 检查目录是否存在
    async isDirectoryExists(dir) {
      dir = dir.slice(0, -1);
      const result = await sendCommand("ls " + dir, this.IP, this.server);
      this.resObj = JSON.parse(result);
      return this.resObj; // 如果存在，返回 true
    },
    // 返回上一级目录
    removeLastSlash(path) {
      const lastSlashIndex = path.lastIndexOf("/");
      if (lastSlashIndex > 0) {
        path = this.ltrim(path.slice(0, lastSlashIndex));
        if (!this.isDirectoryExists(path.slice(3))) {
          return this.removeLastSlash(path);
        }
      }
      return path;
    },
    // 去除字符串首尾以及多余空格，替换多个 '/' 为单个 '/'
    ltrim(s) {
      return s.trim().replace(/\s+/g, " ").replace(/\/+/g, "/");
    }
  }
};
</script>

<style scoped>
body {
  font-family: "Courier New", Courier, monospace;
  background-color: #1e1e1e;
  color: #00ff00;
  margin: 0;
  padding: 0;
}

.terminal {
  width: 100%;
  height: 88vh;
  /* 调整终端高度 */
  display: flex;
  flex-direction: column;
  padding: 15px;
  /* 圆润设计，适当内边距 */
  box-sizing: border-box;
  overflow: hidden;
  background-color: #1c1c1e;
  /* 深色背景 */
  border-radius: 10px;
  /* 圆角终端容器 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  /* 轻盈阴影 */
}

#output {
  flex: 1;
  overflow-y: auto;
  background-color: #2c2c2e;
  /* 输出区域背景稍浅 */
  border-radius: 10px;
  /* 输出区域圆角 */
  padding: 10px;
  /* 增加内边距 */
  margin-bottom: 10px;
  /* 与输入区域间距 */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  /* 内阴影 */
}

#input-line {
  display: flex;
  align-items: center;
}

#prompt {
  padding-right: 5px;
  color: #42b983;
  /* 提示符颜色 */
}

#input {
  flex: 1;
  background-color: #1e1e1e;
  border: none;
  color: #00ff00;
  outline: none;
  font-size: 1rem;
  border-radius: 8px;
  /* 输入框圆角 */
  padding: 10px;
  /* 输入框内边距 */
  margin-left: 5px;
  /* 提示符与输入框的间距 */
  transition: box-shadow 0.3s ease;
}

#input:focus {
  box-shadow: 0 0 5px #42b983;
  /* 聚焦时轻微发光 */
}

.command {
  color: #00ff00;
  font-weight: bold;
  font-size: large;
  margin: 5px 0;
}

pre.output {
  white-space: pre-wrap;
  /* 保留空格和换行符 */
  color: #00ff00;
  /* 输出内容颜色 */
  margin: 0;
  /* 保持输出的垂直间距 */
  font-size: medium;
}
</style>
