import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'topcmds',
  alias: ['cmdstats', 'usagestats', 'popular'],
  description: 'Most used commands since stats began. Usage: .topcmds',
  async execute(sock, msg, args, prefix, ctx) {
    const entries = Object.entries(ctx?.getCommandStats?.() || {}).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (!entries.length) return reply(sock, msg, '📊 No command usage recorded yet.');
    const medals = ['🥇', '🥈', '🥉'];
    await reply(sock, msg, `📊 *Top commands*\n\n${entries.map(([n, c], i) => `${medals[i] || `${i + 1}.`} ${prefix}${n} — ${c}`).join('\n')}`);
  }
};
