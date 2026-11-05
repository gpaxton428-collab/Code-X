import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'nightcore', alias: ['nc'], kinds: ['audio', 'video'],
  description: 'Speed up + raise the pitch (nightcore). Usage: reply to audio with .nightcore',
  async handler({ sock, msg, buffer, chatId, media }) {
    const ptt = Boolean(media.node.ptt);
    const audio = await ffmpeg(buffer, ['-vn', '-af', 'asetrate=44100*1.25,aresample=44100', '-c:a', 'libmp3lame', '-q:a', '3'], 'mp3');
    await sock.sendMessage(chatId, { audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: msg });
  }
});
