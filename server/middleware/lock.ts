import { DistributedLock, MemoryLockBackend } from "@hey-amanthakur/lock-box";

const backend = new MemoryLockBackend();

export const lock = new DistributedLock(backend, {
  defaultTtlMs: 5000,
  wait: { maxWaitMs: 2000, intervalMs: 50 },
});
