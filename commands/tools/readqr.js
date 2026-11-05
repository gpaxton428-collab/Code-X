import { makeMediaCommand } from '../../lib/helpers/mediaTools.js';
import { needPkg } from '../../lib/helpers/needPkg.js';
import { reply } from '../../lib/helpers/reply.js';

export default makeMediaCommand({
  name: 'readqr', alias: ['scanqr', 'qrscan', 'decodeqr'], kinds: ['image', 'sticker'],
  description: 'Read the text/link inside a QR code image. Usage: reply to a QR picture with .readqr',
  async handler({ sock, msg, buffer }) {
    const jimpMod = await needPkg('jimp');
    const jsqrMod = await needPkg('jsqr');
    const Jimp = jimpMod.Jimp || jimpMod.default;
    const jsQR = jsqrMod.default || jsqrMod;
    const img = await Jimp.read(buffer);
    if (img.bitmap.width > 1200) { try { img.resize({ w: 1200 }); } catch { img.resize(1200, Jimp.AUTO); } }
    const { data, width, height } = img.bitmap;
    const code = jsQR(new Uint8ClampedArray(data), width, height);
    if (!code?.data) return reply(sock, msg, '❌ No QR code found. Send a clear, well-lit picture of just the code.');
    await reply(sock, msg, `🔳 *QR content*\n\n${code.data.slice(0, 1500)}`);
  }
});
