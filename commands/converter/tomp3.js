import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'tomp3', alias: ['toaudio', 'extractaudio'], kinds: ['video', 'audio'],
  description: 'Extract the audio of a video (or convert a voice note) to MP3. Usage: reply with .tomp3',
  async handler({ sock, msg, buffer, chatId }) {
    const audio = await ffmpeg(buffer, ['-vn', '-c:a', 'libmp3lame', '-q:a', '3'], 'mp3');
    await sock.sendMessage(chatId, { audio, mimetype: 'audio/mpeg', fileName: 'paxton-audio.mp3' }, { quoted: msg });
  }
});
