const { createProxyMiddleware } = require('http-proxy-middleware');//저얼대 바꾸지 말것

module.exports = (app) => {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://34.105.70.66:8081',	// 서버 URL or localhost:설정한포트번호
      changeOrigin: true,
    })
  );
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://34.105.70.66:8081',	// 서버 URL or localhost:설정한포트번호
      ws: true
    })
  );
};