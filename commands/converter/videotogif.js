import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'videotogif', alias: ['togif'], kinds: ['video'],
  description: 'Convert a replied video to a looping GIF clip. Usage: reply to a video with .togif',
  async handler({ sock, msg, buffer, chatId }) {
    // WhatsApp plays a muted looping MP4 flagged gifPlayback as a GIF (real .gif files are not sent as video).
    const video = await ffmpeg(buffer, ['-t', '12', '-an', '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'fps=15,scale=trunc(min(iw\\,480)/2)*2:-2'], 'mp4');
    await sock.sendMessage(chatId, { video, gifPlayback: true }, { quoted: msg });
  }
});
