<template>
  <div class="file-manager">
    <!-- 顶部按钮栏 -->
    <div class="toolbar">
      <button @click="selectAllFiles">全选</button>
      <button @click="clearSelection">取消选择</button>
      <button @click="sortFiles('name')">按名称排序</button>
      <button @click="sortFiles('type')">按类型排序</button>
      <input v-model="searchQuery" type="text" placeholder="搜索文件" />
    </div>

    <!-- 文件展示区域 -->
    <div class="file-container" @click="clearSelection">
      <div v-for="file in filteredFiles" :key="file.id" class="file-item"
        :class="{ 'selected': selectedFiles.includes(file.id) }" @click.stop="fileClicked(file)"
        @contextmenu.prevent="fileRightClicked(file, $event)" @mousedown="startLongPress(file)" @mouseup="endLongPress"
        @touchstart="startLongPress(file)" @touchend="endLongPress" @mouseleave="cancelLongPress">

        <!-- 根据文件类型显示不同的图标 -->
        <div v-if="file.type === 'file'">
          <!-- 文件图标 -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="file-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>

        <div v-else-if="file.type === 'folder'">
          <!-- 文件夹图标 -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="folder-icon">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>

        <p class="file-name">{{ file.name }}</p>
        <div class="file-menu">
          <button @click.stop="toggleMenu(file)">⋮</button>
          <div v-if="file.showMenu" class="menu">
            <p @click.stop="openFile(file)">打开</p>
            <p @click.stop="deleteFile(file)">删除</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      files: [
        { id: 1, name: '文件1.txt', icon: '../assets/file.png', type: 'file', showMenu: false },
        { id: 2, name: '文件夹1', icon: '../assets/folder.png', type: 'folder', showMenu: false },
        { id: 3, name: '文件2.txt', icon: '../assets/file.png', type: 'file', showMenu: false }
        // 更多文件或文件夹
      ],
      selectedFiles: [],
      longPressTimer: null,
      isSelecting: false,
      isFirstSelect: -1,
      searchQuery: '',
      sortKey: 'name' // 默认按名称排序
    };
  },
  computed: {
    // 根据搜索查询和排序结果返回过滤后的文件列表
    filteredFiles() {
      let result = this.files.filter(file =>
        file.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      if (this.sortKey === 'name') {
        result = result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortKey === 'type') {
        result = result.sort((a, b) => a.type.localeCompare(b.type));
      }
      return result;
    }
  },
  methods: {
    fileClicked(file) {
      this.isFirstSelect += 1
      if (this.isFirstSelect) {
        if (this.isSelecting) {
          this.toggleSelectFile(file.id);
        } else {
          if (file.type === 'folder') {
            this.enterFolder(file);
          } else {
            this.openFile(file);
          }
        }
      }
    },
    fileRightClicked(file) {
      this.toggleMenu(file);
    },
    toggleMenu(file) {
      file.showMenu = !file.showMenu;
    },
    openFile(file) {
      alert(`打开文件: ${file.name}`);
    },
    deleteFile(file) {
      this.files = this.files.filter(f => f.id !== file.id);
      alert(`删除文件: ${file.name}`);
    },
    startLongPress(file) {
      this.longPressTimer = setTimeout(() => {
        this.isSelecting = true;
        // 确保长按文件被选中
        if (!this.selectedFiles.includes(file.id)) {
          this.toggleSelectFile(file.id);
        }
      }, 800);
    },
    endLongPress() {
      clearTimeout(this.longPressTimer);
    },
    cancelLongPress() {
      clearTimeout(this.longPressTimer);
    },
    toggleSelectFile(fileId) {
      if (this.selectedFiles.includes(fileId)) {
        // 取消选择文件
        this.selectedFiles = this.selectedFiles.filter(id => id !== fileId);
      } else {
        // 选择文件
        this.selectedFiles.push(fileId);
      }

      // 如果没有选中的文件，退出多选模式
      if (this.selectedFiles.length === 0) {
        this.isSelecting = false;
        this.isFirstSelect = -1
      }
    },
    clearSelection() {
      this.isSelecting = false;
      this.selectedFiles = [];
      this.isFirstSelect = -1
    },
    enterFolder(file) {
      alert(`进入文件夹: ${file.name}`);
    },
    selectAllFiles() {
      this.isSelecting = true;
      this.selectedFiles = this.files.map(file => file.id);
    },
    sortFiles(key) {
      this.sortKey = key;
    }
  }
};
</script>

<style scoped>
/* 深色主题设计 */
.file-manager {
  padding: 20px;
  background-color: #1e1e1e;
  color: #ecf0f1;
  height: 100vh;
}

.toolbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar button {
  background-color: #3a3a3c;
  color: #ecf0f1;
  border: 1px solid #42b983;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toolbar button:hover {
  background-color: #42b983;
}

.toolbar input {
  padding: 10px;
  border: 1px solid #42b983;
  background-color: #3a3a3c;
  color: #ecf0f1;
  border-radius: 5px;
  outline: none;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.file-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.file-item {
  position: relative;
  width: 100px;
  padding: 10px;
  margin: 10px;
  background-color: #3a3a3c;
  border: 1px solid #42b983;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.file-item.selected {
  box-shadow: 0 0 10px #42b983;
  border-color: #42b983;
}

.file-icon,
.folder-icon {
  width: 50px;
  height: 50px;
}

.file-name {
  margin-top: 10px;
  font-size: 14px;
  color: #ecf0f1;
}

.file-menu {
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.file-menu button {
  background: none;
  border: none;
  font-size: 18px;
  color: #ecf0f1;
  cursor: pointer;
}

.menu {
  position: absolute;
  right: 0;
  bottom: 25px;
  background-color: #3a3a3c;
  border: 1px solid #42b983;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.menu p {
  margin: 0;
  padding: 8px 16px;
  font-size: 14px;
  color: #ecf0f1;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu p:hover {
  background-color: #42b983;
}
</style>
