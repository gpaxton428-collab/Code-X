import { makeMediaCommand, imageToSticker } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'imgtosticker', alias: ['toimgsticker'], kinds: ['image'],
  description: 'Convert a replied image into a sticker. Usage: reply to an image with .imgtosticker',
  async handler({ sock, msg, buffer, chatId }) {
    await sock.sendMessage(chatId, { sticker: await imageToSticker(buffer, 'Paxton MD', 'Paxton MD') }, { quoted: msg });
  }
});
