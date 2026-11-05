import { needPkg } from '../../lib/helpers/needPkg.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'worldtime',
  alias: ['wtime', 'timein', 'worldclock'],
  description: 'Current time in any city or timezone. Usage: .worldtime Tokyo | .worldtime Africa/Johannesburg',
  async execute(sock, msg, args, prefix) {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, msg, usage(prefix, 'worldtime <city or Region/City>', 'worldtime New York'));
    try {
      const m = await needPkg('moment-timezone');
      const tz = m.default || m;
      const want = q.toLowerCase().replace(/\s+/g, '_');
      const names = tz.tz.names();
      const zone = names.find((n) => n.toLowerCase() === want)
        || names.find((n) => n.toLowerCase().endsWith(`/${want}`))
        || names.find((n) => n.toLowerCase().includes(want));
      if (!zone) return reply(sock, msg, `❌ No timezone found for "${q.slice(0, 40)}". Try a big city or Region/City.`);
      const now = tz().tz(zone);
      await reply(sock, msg, `🕐 *${zone.replace(/_/g, ' ')}*\n\n⏰ ${now.format('HH:mm:ss')}\n📅 ${now.format('dddd, D MMMM YYYY')}\n🌐 UTC${now.format('Z')} (${now.format('z')})${now.isDST() ? '\n☀️ Daylight saving time' : ''}`);
    } catch (err) { await replyError(sock, msg, err, 'worldtime'); }
  }
};
