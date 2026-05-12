const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api-ghn', // Đường dẫn giả lập
    createProxyMiddleware({
      target: 'https://dev-online-gateway.ghn.vn', // Server thật của GHN
      changeOrigin: true,
      pathRewrite: {
        '^/api-ghn': '', // Xóa chữ /api-ghn khi gửi request đi
      },
    })
  );
};