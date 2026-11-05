import { makeMediaCommand, ffmpeg } from '../../lib/helpers/mediaTools.js';

export default makeMediaCommand({
  name: 'tovn', alias: ['toptt', 'voicenote'], kinds: ['audio', 'video'],
  description: 'Turn audio or a video into a voice note. Usage: reply with .tovn',
  async handler({ sock, msg, buffer, chatId }) {
    const audio = await ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '48k', '-ar', '48000', '-ac', '1', '-f', 'ogg'], 'ogg');
    await sock.sendMessage(chatId, { audio, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
  }
});
