import { needPkg } from '../../lib/helpers/needPkg.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'emojiname',
  alias: ['emojisearch', 'findemoji'],
  description: 'Find an emoji by name, or get the name of an emoji. Usage: .emojiname coffee | .emojiname 🔥',
  async execute(sock, msg, args, prefix) {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, msg, usage(prefix, 'emojiname <word or emoji>', 'emojiname rocket'));
    try {
      const mod = await needPkg('node-emoji');
      const e = mod.default?.search ? mod.default : mod;
      const named = /\p{Extended_Pictographic}/u.test(q) ? e.find?.(q) : null;
      if (named) return reply(sock, msg, `${named.emoji}  =  :${named.key}:`);
      const hits = (e.search(q.toLowerCase()) || []).slice(0, 10);
      if (!hits.length) return reply(sock, msg, `❌ No emoji found for "${q.slice(0, 30)}".`);
      await reply(sock, msg, hits.map((h) => `${h.emoji}  :${h.name || h.key}:`).join('\n'));
    } catch (err) { await replyError(sock, msg, err, 'emojiname'); }
  }
};
