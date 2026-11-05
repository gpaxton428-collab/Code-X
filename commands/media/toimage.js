import { makeMediaCommand, stickerToImage } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'toimage', alias: ['sticker2img', 'unsticker', 'topng'], kinds: ['sticker'],
  description: 'Convert a replied sticker back into an image. Usage: reply to a sticker with .toimage',
  async handler({ sock, msg, buffer, chatId }) {
    await sock.sendMessage(chatId, { image: await stickerToImage(buffer), caption: '🖼️ Converted back to image' }, { quoted: msg });
  }
});
