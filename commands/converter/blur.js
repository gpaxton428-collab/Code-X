import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'blur', alias: [], kinds: ['image', 'sticker'],
  description: 'Blur an image. Reply to an image with .blur',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.blur(Number(args[0]) > 0 ? Math.min(Number(args[0]), 50) : 12)).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ blur' }, { quoted: msg });
  }
});
