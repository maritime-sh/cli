export interface PollOptions<T> {
  task: () => Promise<T>;
  intervalMs: number;
  onResult?: (result: T) => void;
  onError?: (error: unknown) => void;
  schedule?: (callback: () => void, delay: number) => unknown;
}

/**
 * Poll a task sequentially. The next run is scheduled only after the current
 * one settles, so slow requests never overlap. Transient failures are reported
 * and the loop continues on the normal interval.
 */
export function startPolling<T>({
  task,
  intervalMs,
  onResult = () => {},
  onError = () => {},
  schedule = setTimeout,
}: PollOptions<T>): void {
  const poll = async () => {
    try {
      onResult(await task());
    } catch (error) {
      onError(error);
    } finally {
      schedule(poll, intervalMs);
    }
  };

  schedule(poll, intervalMs);
}
