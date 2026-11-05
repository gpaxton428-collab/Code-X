import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'grayscale', alias: ['greyscale', 'bw'], kinds: ['image', 'sticker'],
  description: 'Make an image black & white. Reply to an image with .grayscale',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.grayscale()).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ grayscale' }, { quoted: msg });
  }
});
