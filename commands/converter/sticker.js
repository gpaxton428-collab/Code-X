import { makeMediaCommand, imageToSticker, videoToSticker } from '../../lib/helpers/mediaTools.js';
import { brandSticker } from '../../lib/stickerBrand.js';

export default makeMediaCommand({
  name: 'sticker', alias: ['s', 'stk', 'stiker'], kinds: ['image', 'video', 'sticker'],
  description: 'Make a sticker from an image, short video/GIF, or re-brand a sticker. Usage: reply with .sticker [pack | author]',
  async handler({ sock, msg, args, kind, buffer, chatId }) {
    const [pack, author] = args.join(' ').split('|').map((x) => x.trim());
    const packname = pack || 'Paxton MD', by = author || 'Paxton MD';
    let out;
    if (kind === 'image') out = await imageToSticker(buffer, packname, by);
    else if (kind === 'video') out = await videoToSticker(buffer, packname, by);
    else out = await brandSticker(buffer, packname, by);
    await sock.sendMessage(chatId, { sticker: out }, { quoted: msg });
  }
});
