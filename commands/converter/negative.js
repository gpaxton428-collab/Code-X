import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'negative', alias: ['invert'], kinds: ['image', 'sticker'],
  description: 'Invert the colours of an image. Reply to an image with .negative',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.negate({ alpha: false })).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ negative' }, { quoted: msg });
  }
});
