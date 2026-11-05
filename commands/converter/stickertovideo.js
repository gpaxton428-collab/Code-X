import { makeMediaCommand, stickerToVideo, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'stickertovideo', alias: ['tovideo', 'tomp4', 'stickertomp4'], kinds: ['sticker', 'video'],
  description: 'Animated sticker or GIF to an MP4 video. Usage: reply to it with .tovideo',
  async handler({ sock, msg, kind, buffer, chatId }) {
    const video = kind === 'sticker'
      ? await stickerToVideo(buffer)
      : await ffmpeg(buffer, ['-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'], 'mp4');
    await sock.sendMessage(chatId, { video, caption: '🎬 Done' }, { quoted: msg });
  }
});
