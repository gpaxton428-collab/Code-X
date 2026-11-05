import { needPkg } from '../../lib/helpers/needPkg.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'figlet',
  alias: ['banner', 'asciitext', 'bigtext'],
  description: 'Turn text into big ASCII art. Usage: .figlet <text up to 16 characters>',
  async execute(sock, msg, args, prefix) {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, msg, usage(prefix, 'figlet <text>', 'figlet Paxton'));
    if (text.length > 16) return reply(sock, msg, '❌ Keep it to 16 characters so it fits on a phone screen.');
    try {
      const m = await needPkg('figlet');
      const figlet = m.default || m;
      await reply(sock, msg, '```\n' + figlet.textSync(text, { font: 'Standard', width: 40 }) + '\n```');
    } catch (err) { await replyError(sock, msg, err, 'figlet'); }
  }
};
