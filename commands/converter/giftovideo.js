import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'giftovideo', alias: ['gif2mp4'], kinds: ['video'],
  description: 'Convert a replied GIF to an MP4 video. Usage: reply to a GIF with .giftovideo',
  async handler({ sock, msg, buffer, chatId }) {
    const video = await ffmpeg(buffer, ['-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'], 'mp4');
    await sock.sendMessage(chatId, { video }, { quoted: msg });
  }
});
