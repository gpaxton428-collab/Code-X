import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'sepia', alias: [], kinds: ['image', 'sticker'],
  description: 'Sepia tone an image. Reply to an image with .sepia',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.tint({ r: 112, g: 66, b: 20 }).modulate({ saturation: 0.9 })).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ sepia' }, { quoted: msg });
  }
});
