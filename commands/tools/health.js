import os from 'os';
import { reply } from '../../lib/helpers/reply.js';
import { getLimiterStats } from '../../lib/utils/limiter.js';

const mb = (n) => `${(n / 1048576).toFixed(0)} MB`;
const dur = (s) => `${Math.floor(s / 86400)}d ${Math.floor(s % 86400 / 3600)}h ${Math.floor(s % 3600 / 60)}m`;

export default {
  name: 'health',
  alias: ['sysstatus', 'botstatus', 'diag'],
  description: 'Bot health: memory, CPU load, event-loop lag, caches and uptime. Usage: .health',
  async execute(sock, msg, args, prefix, ctx) {
    const t0 = process.hrtime.bigint();
    await new Promise((r) => setImmediate(r));
    const lagMs = Number(process.hrtime.bigint() - t0) / 1e6;
    const m = process.memoryUsage();
    const caches = ctx?.cacheSizes?.() || {};
    const stats = ctx?.getCommandStats?.() || {};
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const jobs = getLimiterStats().map((l) => `┃ 🧵 ${l.name}: ${l.active}/${l.max} running, ${l.queued} waiting`).join('\n') || '┃ 🧵 Job queues idle';
    const rating = lagMs < 20 && m.rss < 400 * 1048576 ? '🟢 Excellent' : lagMs < 100 ? '🟡 OK' : '🔴 Under load';
    await reply(sock, msg, `╭━━━〔 🩺 BOT HEALTH 〕━━━┈⊷
┃ ${rating}
┃ ⏱️ Uptime: ${dur(process.uptime())}
┃ 🧠 Memory: ${mb(m.rss)} (heap ${mb(m.heapUsed)})
┃ ⚡ Loop lag: ${lagMs.toFixed(1)} ms
┃ 🖥️ CPU load: ${os.loadavg().map((x) => x.toFixed(2)).join(' / ')}
┃ 💾 Host RAM free: ${mb(os.freemem())} / ${mb(os.totalmem())}
┃ 📨 Msg cache: ${caches.sent ?? '—'} · 👥 Group cache: ${caches.groups ?? '—'}
┃ 🔢 Commands run: ${total}
${jobs}
┃ 🟩 Node ${process.version} · ${os.platform()}/${os.arch()}
╰━━━━━━━━━━━━━━━┈⊷`);
  }
};
