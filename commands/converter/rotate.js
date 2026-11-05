import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'rotate', alias: ['rotateimg'], kinds: ['image', 'sticker'],
  description: 'Rotate an image. Usage: .rotate [degrees] Reply to an image with .rotate',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.rotate(Number(args[0]) || 90)).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ rotate' }, { quoted: msg });
  }
});
