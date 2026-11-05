import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'reverseaudio', alias: ['areverse'], kinds: ['audio', 'video'],
  description: 'Play audio backwards. Usage: reply to audio with .reverseaudio',
  async handler({ sock, msg, buffer, chatId, media }) {
    const ptt = Boolean(media.node.ptt);
    const audio = await ffmpeg(buffer, ['-vn', '-af', 'areverse', '-c:a', 'libmp3lame', '-q:a', '3'], 'mp3');
    await sock.sendMessage(chatId, { audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: msg });
  }
});
