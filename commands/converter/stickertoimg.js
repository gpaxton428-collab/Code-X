import { makeMediaCommand, stickerToImage } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'stickertoimg', alias: ['stickertoimage', 'toimg'], kinds: ['sticker'],
  description: 'Convert a replied sticker to a picture. Usage: reply to a sticker with .stickertoimg',
  async handler({ sock, msg, buffer, chatId }) {
    await sock.sendMessage(chatId, { image: await stickerToImage(buffer), caption: '🖼️ Done' }, { quoted: msg });
  }
});
