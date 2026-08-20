import {
  IdempotencyRegistry,
  MemoryIdempotencyBackend,
} from "@hey-amanthakur/coord-box";

const backend = new MemoryIdempotencyBackend();

export const idempotencyRegistry = new IdempotencyRegistry(backend, {
  defaultTtlMs: 24 * 60 * 60 * 1000,
});
