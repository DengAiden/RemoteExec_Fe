<template>
  <div class="home">
    <h1>请输入目标设备和服务器IP地址</h1>
    <div class="input-group">
      <input v-model="deviceIP" type="text" placeholder="目标设备 IP" />
      <input v-model="serverIP" type="text" placeholder="服务器 IP:端口" />
      <button @click="saveIPs">保存 IP</button>
    </div>
    <p>当前 目标设备 IP: {{ currentDeviceIP }}</p>
    <p>当前 服务器 IP: {{ currentServerIP }}</p>
  </div>
</template>

<script>
// 引入SweetAlert2
import Swal from 'sweetalert2'

export default {
  data() {
    return {
      deviceIP: localStorage.getItem('deviceIP') || '',  // 从localStorage或Vuex中获取初始值
      serverIP: "62.234.26.198:3000" || '',  // 从localStorage或Vuex中获取初始值
      currentDeviceIP: localStorage.getItem('deviceIP') || '',
      currentServerIP: "62.234.26.198:3000" || ''
    }
  },
  methods: {
    validateIP(ip) {
      const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipPattern.test(ip);
    },
    validateServerIP(serverIP) {
      const serverIPPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(\d{1,5})$/;
      return serverIPPattern.test(serverIP);
    },
    saveIPs() {
      if (this.deviceIP.trim() === '' || this.serverIP.trim() === '') {
        Swal.fire({
          icon: 'error',
          title: '错误',
          text: '目标设备IP和服务器IP地址都不能为空！',
          confirmButtonColor: '#42b983',
        });
        return;
      }
      if (!this.validateIP(this.deviceIP)) {
        Swal.fire({
          icon: 'error',
          title: '无效 目标设备 IP',
          text: '请输入有效的目标设备IP地址！',
          confirmButtonColor: '#42b983',
        });
        return;
      }
      if (!this.validateServerIP(this.serverIP)) {
        Swal.fire({
          icon: 'error',
          title: '无效 服务器 IP:端口',
          text: '请输入有效的服务器IP地址和端口！格式应为: IP:端口，例如 192.168.1.1:3000',
          confirmButtonColor: '#42b983',
        });
        return;
      }

      // 保存到localStorage
      localStorage.setItem('deviceIP', this.deviceIP);
      localStorage.setItem('serverIP', this.serverIP);

      // 更新当前显示的IP
      this.currentDeviceIP = this.deviceIP;
      this.currentServerIP = this.serverIP;
      this.deviceIP = '';
      this.serverIP = '';

      Swal.fire({
        icon: 'success',
        title: '成功！',
        text: 'IP地址已保存！',
        confirmButtonColor: '#42b983',
      });
    }
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-align: center;
  color: #ecf0f1;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #ecf0f1;
  /* 标题浅色 */
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  /* 输入框和按钮与下方内容之间的间距 */
}

input {
  padding: 12px;
  font-size: 16px;
  background-color: #3a3a3c;
  /* 深色输入框背景 */
  color: #ecf0f1;
  /* 浅色输入框字体 */
  border: 1px solid #42b983;
  border-radius: 10px;
  /* 圆角输入框 */
  outline: none;
  margin: 5px 0;
  /* 输入框之间的间距 */
  transition: box-shadow 0.3s ease;
  width: 300px;
  /* 设置输入框宽度 */
}

input:focus {
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.7);
  /* 聚焦发光效果 */
}

button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 10px;
  /* 圆角按钮 */
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  /* 轻盈阴影 */
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  margin-top: 10px;
}

button:hover {
  background-color: #3a9c73;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  /* 悬浮效果 */
}

p {
  margin-top: 10px;
  font-size: 18px;
  color: #ecf0f1;
}
</style>
