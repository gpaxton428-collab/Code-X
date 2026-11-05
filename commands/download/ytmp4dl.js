import { searchTracks, getVideoBuffer, extractVideoId, maxAudioSeconds } from '../../lib/api/youtubeFree.js';
import { cleanFileName } from '../../lib/utils/format.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { brandCaption } from '../../lib/caption.js';
import { config } from '../../config/index.js';

const busy = new Set();

export default {
  name: 'ytmp4',
  alias: ['video', 'ytv', 'playvideo', 'vid'],
  description: 'Download a YouTube video by name or link. Usage: .video <name or link>',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const lock = `${chatId}|${msg.key.participant || ''}`;
    const input = args.join(' ').trim();
    if (!input) return reply(sock, msg, usage(prefix, 'video <name or youtube link>', 'video Burna Boy Last Last'));
    if (busy.has(lock)) return reply(sock, msg, '⏳ One download at a time, please wait.');
    busy.add(lock);
    try {
      await react(sock, msg, '🔍');
      let id = extractVideoId(input), title = input;
      if (!id) {
        const t = (await searchTracks(input, { limit: 1 }))[0];
        if (t.durationSeconds && t.durationSeconds > maxAudioSeconds()) return reply(sock, msg, `❌ "${t.title}" is ${t.duration}, over the ${config.limits.maxAudioMinutes} minute limit.`);
        id = t.id; title = t.title;
      }
      await react(sock, msg, '⬇️');
      const video = await getVideoBuffer(id, { maxBytes: config.limits.maxMediaMb * 1024 * 1024 });
      await sock.sendMessage(chatId, { video, mimetype: 'video/mp4', fileName: `${cleanFileName(title, 'video')}.mp4`, caption: brandCaption(`🎬 ${title.slice(0, 150)}`) }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, `🔎 Nothing found for "${input.slice(0, 60)}".`);
      await replyError(sock, msg, err, 'ytmp4');
    } finally { busy.delete(lock); }
  }
};
