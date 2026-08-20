import { Request, Response, NextFunction } from "express";
import { MemoryStore, RateLimiter } from "@hey-amanthakur/throttle-box";

const store = new MemoryStore();

const limiter = new RateLimiter(store, {
  capacity: 100,
  refillRate: 10,
});

function applyHeaders(res: Response, result: { remaining: number; capacity: number; refillRate: number; retryAfterMs: number; resetAt: number }) {
  res.set("RateLimit-Limit", String(result.capacity));
  res.set("RateLimit-Remaining", String(result.remaining));
  res.set("RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  res.set("RateLimit-Policy", `${result.capacity};w=1`);
  if (result.retryAfterMs > 0) {
    res.set("Retry-After", String(Math.ceil(result.retryAfterMs / 1000)));
  }
}

export function globalRateLimit(req: Request, res: Response, next: NextFunction): void {
  const path = req.path;
  const isAuth = path === "/api/auth/register" || path === "/api/auth/login";
  const isWrite = req.method !== "GET";

  const override = isAuth
    ? { capacity: 5, refillRate: 1 / 15 }
    : isWrite
      ? { capacity: 30, refillRate: 2 }
      : {};

  limiter.decide({ req, config: override }).then(({ result }) => {
    applyHeaders(res, result);
    if (!result.allowed) {
      res.status(429).json({
        message: "Too many requests, please try again later",
        retryAfterMs: result.retryAfterMs,
      });
      return;
    }
    next();
  });
}

export { limiter as rateLimiter };
