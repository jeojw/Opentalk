import { createProxyMiddleware } from 'http-proxy-middleware';

export default (app) => {
  app.use(
    "/api",
    createProxyMiddleware({
      target: 'http://localhost:8081',	// 서버 URL or localhost:설정한포트번호
      changeOrigin: true
    })
  );
  app.use(
    "/stomp-ws",
    createProxyMiddleware({
      target: 'http://localhost:8081',	// 서버 URL or localhost:설정한포트번호
      ws: true
    })
  );
};