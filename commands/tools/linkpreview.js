import { needPkg } from '../../lib/helpers/needPkg.js';
import { downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'linkpreview',
  alias: ['preview', 'unfurl', 'urlinfo'],
  description: 'Show the title, description and image of a web page. Usage: .linkpreview <url>',
  async execute(sock, msg, args, prefix) {
    let url = (args[0] || '').trim();
    if (!url) return reply(sock, msg, usage(prefix, 'linkpreview <url>', 'linkpreview github.com'));
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      await react(sock, msg, '🔗');
      const cheerio = await needPkg('cheerio');
      const { buffer, finalUrl } = await downloadBuffer(url, { maxBytes: 1.5 * 1024 * 1024, timeoutMs: 15000, rejectTypes: null });
      const $ = (cheerio.load || cheerio.default.load)(buffer.toString('utf8'));
      const meta = (n) => $(`meta[property="${n}"]`).attr('content') || $(`meta[name="${n}"]`).attr('content') || '';
      const title = meta('og:title') || $('title').first().text().trim() || 'No title';
      const desc = (meta('og:description') || meta('description') || 'No description').slice(0, 300);
      const site = meta('og:site_name') || new URL(finalUrl).hostname;
      const text = `🔗 *${title.slice(0, 150)}*\n🌐 ${site}\n\n${desc}\n\n${finalUrl.slice(0, 200)}`;
      const img = meta('og:image');
      if (img) {
        try {
          const abs = new URL(img, finalUrl).href;
          const pic = await downloadBuffer(abs, { maxBytes: 5 * 1024 * 1024, timeoutMs: 15000 });
          return void await sock.sendMessage(msg.key.remoteJid, { image: pic.buffer, caption: text }, { quoted: msg });
        } catch { /* fall back to text */ }
      }
      await reply(sock, msg, text);
    } catch (err) { await replyError(sock, msg, err, 'linkpreview'); }
  }
};
