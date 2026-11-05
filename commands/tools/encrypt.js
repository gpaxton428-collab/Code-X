import crypto from 'crypto';
import { reply, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'encrypt',
  alias: ['enc'],
  description: 'Encrypt text with a password (AES-256-GCM). Usage: .encrypt <password> <text>  — do this in a private chat',
  async execute(sock, msg, args, prefix) {
    const password = args[0], text = args.slice(1).join(' ');
    if (!password || !text) return reply(sock, msg, usage(prefix, 'encrypt <password> <text>', 'encrypt mySecret hello world'));
    if (text.length > 2000) return reply(sock, msg, '❌ Keep the text under 2000 characters.');
    const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(password, salt, 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const blob = Buffer.concat([salt, iv, cipher.getAuthTag(), enc]).toString('base64');
    await reply(sock, msg, `🔐 *Encrypted*\n\n${blob}\n\nDecrypt with ${prefix}decrypt <password> <this code>`);
  }
};
