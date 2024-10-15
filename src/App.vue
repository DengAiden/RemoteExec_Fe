<template>
  <div id="app">
    <nav>
      <router-link to="/">主页</router-link> |
      <router-link to="/terminal">终端</router-link> |
      <router-link to="/fileManager">文件管理器</router-link>
    </nav>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #1c1c1e; /* 深色背景 */
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #ecf0f1; /* 浅色字体 */
  overflow: hidden; /* 页面整体不滚动 */
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
nav {
  background: #2c2c2e; /* 深色导航栏背景 */
  color: #ecf0f1; /* 导航栏字体颜色 */
  padding: 15px;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  border-radius: 0 0 10px 10px; /* 圆角边缘 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* 轻微阴影 */
  z-index: 1000;
}

nav a {
  font-weight: bold;
  color: #ecf0f1;
  margin: 0 15px;
  text-decoration: none;
  font-size: 18px;
}

nav a.router-link-exact-active {
  color: #42b983;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  margin-top: 70px; /* 避开导航栏高度 */
  padding: 20px;
  background-color: #2c2c2e; /* 主内容深色背景 */
  overflow-y: auto; /* 内容区域内部滚动 */
  border-radius: 10px; /* 圆润的边角 */
  max-height: calc(100vh - 70px); /* 确保内容区域不会溢出页面高度 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  nav {
    padding: 10px;
  }

  nav a {
    font-size: 16px;
    margin: 0 10px;
  }

  .main-content {
    padding: 15px;
  }
}
</style>
