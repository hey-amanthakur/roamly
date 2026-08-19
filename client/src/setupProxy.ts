import { createProxyMiddleware, Filter, Options, RequestHandler } from "http-proxy-middleware";

module.exports = function (app: any): void {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: true,
    } as Options)
  );
  app.use(
    "/images",
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: true,
    } as Options)
  );
};
