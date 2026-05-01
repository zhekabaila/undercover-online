const timers = new Map<string, NodeJS.Timeout>();

export function startTimer(roomId: string, durationMs: number, onExpire: () => void): void {
  clearTimer(roomId);
  const timer = setTimeout(onExpire, durationMs);
  timers.set(roomId, timer);
}

export function clearTimer(roomId: string): void {
  const existing = timers.get(roomId);
  if (existing) {
    clearTimeout(existing);
    timers.delete(roomId);
  }
}
