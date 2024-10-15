export function sendCommand(command, IP, server) {
  const socket = new WebSocket(`ws://${server}/ws`);

  function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  return new Promise((resolve, reject) => {
    // 监听 WebSocket 连接打开事件
    socket.addEventListener('open', () => {
      // 发送命令
      socket.send(JSON.stringify({ command, IP: IP, UUID: generateUUID() }));
    });

    // 监听消息事件F
    socket.addEventListener('message', (event) => {
      const result = event.data;
      if (result) {
        resolve(result); // 返回结果
        socket.close(); // 关闭连接
      }
    });

    // 监听错误事件
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    });

    // 监听关闭事件
    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed.');
    });
  });
}
