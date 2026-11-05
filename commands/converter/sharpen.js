import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'sharpen', alias: [], kinds: ['image', 'sticker'],
  description: 'Sharpen an image. Reply to an image with .sharpen',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.sharpen({ sigma: 2 })).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ sharpen' }, { quoted: msg });
  }
});
