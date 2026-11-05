import { needPkg } from './needPkg.js';
import { react, reply, replyError, usage } from './reply.js';

const quotedText = (msg) => {
  const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  return q?.conversation || q?.extendedTextMessage?.text || '';
};

/** Build a "paste text (or reply to text) -> converted text" command. */
export function makeFormatCommand({ name, alias, description, example, convert }) {
  return {
    name, alias, description,
    async execute(sock, msg, args, prefix) {
      const input = (args.join(' ') || quotedText(msg)).trim();
      if (!input) return reply(sock, msg, usage(prefix, `${name} <text>  (or reply to text)`, `${name} ${example}`));
      if (input.length > 60000) return reply(sock, msg, '❌ That input is too long.');
      try {
        await react(sock, msg, '🔄');
        const out = String(await convert(input)).trim();
        if (!out) return reply(sock, msg, '❌ The result was empty.');
        const chatId = msg.key.remoteJid;
        if (out.length <= 3500) await reply(sock, msg, '```\n' + out + '\n```');
        else await sock.sendMessage(chatId, { document: Buffer.from(out), mimetype: 'text/plain', fileName: `${name}.txt`, caption: '📄 Result (too long for a message)' }, { quoted: msg });
        await react(sock, msg, '✅');
      } catch (err) {
        if (err.kind === 'config') return replyError(sock, msg, err, name);
        await reply(sock, msg, `❌ Could not convert that: ${String(err.message || err).slice(0, 160)}`);
      }
    }
  };
}
export { needPkg };
