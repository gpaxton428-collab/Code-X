import { reply, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'cmdsearch',
  alias: ['findcmd', 'searchcmd', 'whichcmd'],
  description: 'Find a command by what it does. Usage: .cmdsearch sticker',
  async execute(sock, msg, args, prefix, ctx) {
    const q = args.join(' ').trim().toLowerCase();
    if (!q) return reply(sock, msg, usage(prefix, 'cmdsearch <word>', 'cmdsearch download'));
    const list = [...ctx.commands.values()].map((c) => ({ name: c.name, alias: (c.alias || []).join(' '), description: c.description || '' }));
    let hits;
    try {
      const { default: Fuse } = await import('fuse.js');
      hits = new Fuse(list, { keys: [{ name: 'name', weight: 3 }, { name: 'alias', weight: 2 }, { name: 'description', weight: 1 }], threshold: 0.35 }).search(q).map((r) => r.item);
    } catch {
      hits = list.filter((c) => `${c.name} ${c.alias} ${c.description}`.toLowerCase().includes(q)); // fuse.js not installed
    }
    hits = hits.slice(0, 8);
    if (!hits.length) return reply(sock, msg, `🔎 Nothing matches "${q.slice(0, 30)}".`);
    await reply(sock, msg, `🔎 *Commands for "${q.slice(0, 30)}"*\n\n${hits.map((h) => `• *${prefix}${h.name}* — ${h.description.split('. Usage')[0].slice(0, 70)}`).join('\n')}`);
  }
};
