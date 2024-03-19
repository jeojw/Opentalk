const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    '/opentalk',
    createProxyMiddleware({
      target: 'http://localhost:8081',	// 서버 URL or localhost:설정한포트번호
      changeOrigin: true,
    })
  );
};