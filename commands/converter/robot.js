import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'robot', alias: ['robotvoice'], kinds: ['audio', 'video'],
  description: 'Robot voice effect. Usage: reply to audio with .robot',
  async handler({ sock, msg, buffer, chatId, media }) {
    const ptt = Boolean(media.node.ptt);
    const audio = await ffmpeg(buffer, ['-vn', '-af', 'asetrate=44100*0.9,aresample=44100,tremolo=f=40:d=0.8', '-c:a', 'libmp3lame', '-q:a', '3'], 'mp3');
    await sock.sendMessage(chatId, { audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: msg });
  }
});
