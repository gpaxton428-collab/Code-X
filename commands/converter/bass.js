import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'bass', alias: ['bassboost'], kinds: ['audio', 'video'],
  description: 'Boost the bass of audio. Usage: reply to audio with .bass',
  async handler({ sock, msg, buffer, chatId, media }) {
    const ptt = Boolean(media.node.ptt);
    const audio = await ffmpeg(buffer, ['-vn', '-af', 'bass=g=18,acompressor', '-c:a', 'libmp3lame', '-q:a', '3'], 'mp3');
    await sock.sendMessage(chatId, { audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: msg });
  }
});
