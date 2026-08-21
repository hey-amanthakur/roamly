import { createProxyMiddleware, Options, RequestHandler } from "http-proxy-middleware";

interface ProxyApp {
  use: (path: string, handler: RequestHandler) => void;
}

module.exports = function (app: ProxyApp): void {
  const proxy = (pathFilter: string): RequestHandler =>
    createProxyMiddleware({
      pathFilter,
      target: "http://localhost:5001",
      changeOrigin: true,
    } as Options);

  app.use("/api", proxy("/api"));
  app.use("/images", proxy("/images"));
};
