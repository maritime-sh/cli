import assert from "node:assert/strict";
import test from "node:test";
import { startPolling } from "./poll.js";

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

function queuedScheduler() {
  const callbacks: Array<() => void> = [];
  return {
    callbacks,
    schedule(callback: () => void) {
      callbacks.push(callback);
    },
    runNext() {
      const callback = callbacks.shift();
      assert.ok(callback, "expected a scheduled poll");
      callback();
    },
  };
}

test("keeps polling after a transient failure", async () => {
  const scheduler = queuedScheduler();
  const errors: unknown[] = [];
  const results: string[] = [];
  let calls = 0;

  startPolling({
    task: async () => {
      calls++;
      if (calls === 1) throw new Error("network down");
      return "recovered";
    },
    intervalMs: 1000,
    onError: (error) => errors.push(error),
    onResult: (result) => results.push(result),
    schedule: scheduler.schedule,
  });

  scheduler.runNext();
  await flush();
  assert.equal(calls, 1);
  assert.match(String(errors[0]), /network down/);
  assert.equal(scheduler.callbacks.length, 1);

  scheduler.runNext();
  await flush();
  assert.equal(calls, 2);
  assert.deepEqual(results, ["recovered"]);
});

test("never overlaps slow polls", async () => {
  const scheduler = queuedScheduler();
  let resolveFirst: ((value: string) => void) | undefined;
  let active = 0;
  let maxActive = 0;
  let calls = 0;

  startPolling({
    task: () => {
      calls++;
      active++;
      maxActive = Math.max(maxActive, active);
      if (calls === 1) {
        return new Promise<string>((resolve) => {
          resolveFirst = (value) => {
            active--;
            resolve(value);
          };
        });
      }
      active--;
      return Promise.resolve("next");
    },
    intervalMs: 1000,
    schedule: scheduler.schedule,
  });

  scheduler.runNext();
  await flush();
  assert.equal(calls, 1);
  assert.equal(scheduler.callbacks.length, 0);

  resolveFirst?.("first");
  await flush();
  assert.equal(scheduler.callbacks.length, 1);

  scheduler.runNext();
  await flush();
  assert.equal(calls, 2);
  assert.equal(maxActive, 1);
});
