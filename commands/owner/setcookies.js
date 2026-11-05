import { downloadMedia, findMedia } from '../../lib/helpers/mediaTools.js';
import { saveYoutubeCookies, clearYoutubeCookies, cookieStatus } from '../../lib/api/ytCookies.js';
import { resetYoutubeAgent } from '../../lib/api/youtubeFree.js';
import { reply } from '../../lib/helpers/reply.js';

const quotedText = (msg) => {
  const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  return q?.conversation || q?.extendedTextMessage?.text || '';
};

export default {
  name: 'setcookies',
  alias: ['addcookies', 'ytcookies', 'cookies'],
  strictOwner: true,
  description: 'Save YouTube cookies for .play/.video (stored in a file, not .env). Usage: send/reply to cookies.json or cookies.txt with .setcookies | .setcookies status | .setcookies clear',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'clear' || sub === 'remove') {
      resetYoutubeAgent();
      return reply(sock, msg, clearYoutubeCookies() ? '🗑️ YouTube cookies removed.' : 'ℹ️ There were no cookies saved.');
    }
    if (sub === 'status') {
      const s = cookieStatus();
      if (!s.present) return reply(sock, msg, `🍪 *No cookies saved.*\n\nSend a cookies.json or cookies.txt file with the caption ${prefix}setcookies`);
      return reply(sock, msg, `🍪 *Cookies saved*\n\n📦 ${s.count} cookies\n🔑 Logged-in session: ${s.loggedIn ? 'yes ✅' : 'no ⚠️ (export while signed in to YouTube)'}${s.expires ? `\n⏳ First expiry: ${s.expires.toDateString()}` : ''}`);
    }

    try {
      let text = '';
      const doc = findMedia(msg, ['document']);
      if (doc) text = (await downloadMedia(doc)).toString('utf8');
      else text = args.join(' ').trim() || quotedText(msg);
      if (!text) {
        return reply(sock, msg, `🍪 *Set YouTube cookies*\n\n1. In your browser, sign in to YouTube with a throw-away Google account.\n2. Export cookies (Cookie-Editor extension → Export → JSON, or a cookies.txt exporter).\n3. Send the file here with the caption *${prefix}setcookies*\n   (or reply to the file / pasted text with ${prefix}setcookies).\n\n${prefix}setcookies status · ${prefix}setcookies clear`);
      }
      const { count, format } = saveYoutubeCookies(text);
      resetYoutubeAgent();
      // pasted cookies are secrets: remove the message that contained them if we can
      if (!doc) { try { await sock.sendMessage(chatId, { delete: msg.key }); } catch { /* not allowed here */ } }
      await sock.sendMessage(chatId, { text: `✅ Saved ${count} cookies (${format === 'json' ? 'cookies.json' : 'cookies.txt'}).\n.play and .video will use them from now on, no restart needed.\n\n🔒 Delete the cookie file from this chat if you sent one.` });
    } catch (err) {
      await reply(sock, msg, `❌ ${String(err.message || err).slice(0, 200)}`);
    }
  }
};
