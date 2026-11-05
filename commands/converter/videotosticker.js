import { makeMediaCommand, videoToSticker } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'videotosticker', alias: ['gifsticker', 'togifsticker'], kinds: ['video'],
  description: 'Convert a replied short video/GIF into an animated sticker. Usage: reply to a video with .videotosticker',
  async handler({ sock, msg, buffer, chatId }) {
    await sock.sendMessage(chatId, { sticker: await videoToSticker(buffer, 'Paxton MD', 'Paxton MD') }, { quoted: msg });
  }
});
