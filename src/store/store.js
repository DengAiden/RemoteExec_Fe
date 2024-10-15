// src/store.js
import { createStore } from 'vuex' // Vue 3 使用 createStore

export default createStore({
  state: {
    deviceIP: '', // 全局存储IP地址
    serverIP: ''
  },
  mutations: {
    setDeviceIP(state, newIP) {
      state.deviceIP = newIP; // 修改IP地址
    },
    setServerIP(state, newIP) {
      state.serverIP = newIP;
    }
  },
  actions: {
    updateDeviceIP({ commit }, newIP) {
      commit('setDeviceIP', newIP); // 触发mutations更新IP地址
    },
    updateServerIP({ commit }, newIP) {
      commit('setServerIP', newIP); // 触发mutations更新IP地址
    }
  },
  getters: {
    getDeviceIP: (state) => state.deviceIP, // 获取IP地址
    getServerIP: (state) => state.serverIP
  }
})
