// Tiny concurrency limiter: heavy jobs (ffmpeg, downloads) wait their turn instead of all
// running at once and starving the bot's CPU/RAM (the usual reason bots freeze on phones).
const registry = new Map();

export function createLimiter(name, max) {
  const queue = [];
  let active = 0, done = 0, peakQueue = 0;
  const next = () => {
    if (active >= max || !queue.length) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve().then(fn).then(resolve, reject).finally(() => { active--; done++; next(); });
  };
  const run = (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    peakQueue = Math.max(peakQueue, queue.length);
    next();
  });
  registry.set(name, () => ({ name, max, active, queued: queue.length, done, peakQueue }));
  return run;
}

export const getLimiterStats = () => [...registry.values()].map((f) => f());
