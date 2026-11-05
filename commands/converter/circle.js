import { makeMediaCommand, sharp } from '../../lib/helpers/mediaTools.js';
import { brandSticker } from '../../lib/stickerBrand.js';

export default makeMediaCommand({
  name: 'circle', alias: ['round', 'circlesticker'], kinds: ['image'],
  description: 'Turn an image into a round sticker. Usage: reply to an image with .circle',
  async handler({ sock, msg, buffer, chatId }) {
    const s = await sharp();
    const size = 512;
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
    const webp = await s(buffer).resize(size, size, { fit: 'cover' }).composite([{ input: mask, blend: 'dest-in' }]).webp({ quality: 85 }).toBuffer();
    await sock.sendMessage(chatId, { sticker: await brandSticker(webp, 'Paxton MD', 'Paxton MD') }, { quoted: msg });
  }
});
