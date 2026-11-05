import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'echo', alias: ['reverb'], kinds: ['audio', 'video'],
  description: 'Add an echo. Usage: reply to audio with .echo',
  async handler({ sock, msg, buffer, chatId, media }) {
    const ptt = Boolean(media.node.ptt);
    const audio = await ffmpeg(buffer, ['-vn', '-af', 'aecho=0.8:0.88:60:0.4', '-c:a', 'libmp3lame', '-q:a', '3'], 'mp3');
    await sock.sendMessage(chatId, { audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: msg });
  }
});
