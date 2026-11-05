import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'mirror', alias: [], kinds: ['image', 'sticker'],
  description: 'Mirror an image left-to-right. Reply to an image with .mirror',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.flop()).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ mirror' }, { quoted: msg });
  }
});
