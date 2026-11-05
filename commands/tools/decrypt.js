import crypto from 'crypto';
import { reply, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'decrypt',
  alias: ['dec'],
  description: 'Decrypt text made by .encrypt. Usage: .decrypt <password> <code>',
  async execute(sock, msg, args, prefix) {
    const password = args[0], code = args.slice(1).join('').trim();
    if (!password || !code) return reply(sock, msg, usage(prefix, 'decrypt <password> <code>', 'decrypt mySecret AbC...'));
    try {
      const raw = Buffer.from(code, 'base64');
      if (raw.length < 45) throw new Error('short');
      const salt = raw.subarray(0, 16), iv = raw.subarray(16, 28), tag = raw.subarray(28, 44), data = raw.subarray(44);
      const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(password, salt, 32), iv);
      decipher.setAuthTag(tag);
      const out = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
      await reply(sock, msg, `🔓 *Decrypted*\n\n${out}`);
    } catch { await reply(sock, msg, '❌ Wrong password or the code is damaged.'); }
  }
};
