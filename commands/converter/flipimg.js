import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'flipimg', alias: ['flipvertical'], kinds: ['image', 'sticker'],
  description: 'Flip an image upside-down. Reply to an image with .flipimg',
  async handler({ sock, msg, args, buffer, chatId }) {
    const s = await sharp();
    const img = s(buffer);
    const out = await (img.flip()).jpeg({ quality: 90 }).toBuffer();
    await sock.sendMessage(chatId, { image: out, caption: '✨ flipimg' }, { quoted: msg });
  }
});
