// Library-based downloader (rahad-all-downloader-v2, no API key) shared by
// .twitter .pinterest .threads and the auto-detecting .dl command.
import { downloadBuffer } from '../utils/http.js';
import { react, reply, replyError, usage } from './reply.js';
import { brandCaption } from '../caption.js';
import { AppError } from '../utils/errors.js';
import { assertPublicHttpUrl } from '../utils/urlSafety.js';
import { config } from '../../config/index.js';
import { createLimiter } from '../utils/limiter.js';

export const PLATFORMS = {
  twitter: { hosts: ['twitter.com', 'x.com', 't.co'], icon: '🐦' },
  pinterest: { hosts: ['pinterest.com', 'pin.it'], icon: '📌' },
  threads: { hosts: ['threads.net', 'threads.com'], icon: '🧵' },
  facebook: { hosts: ['facebook.com', 'fb.watch'], icon: '📘' },
  instagram: { hosts: ['instagram.com', 'instagr.am'], icon: '📸' },
  tiktok: { hosts: ['tiktok.com'], icon: '🎵' },
  capcut: { hosts: ['capcut.com'], icon: '✂️' },
};

export const detectPlatform = (url) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return Object.entries(PLATFORMS).find(([, p]) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)))?.[0] || null;
  } catch { return null; }
};

function pickUrls(result) {
  const out = [];
  const seen = new Set();
  const walk = (n, d = 0) => {
    if (!n || d > 4) return;
    if (typeof n === 'string') { if (/^https?:\/\//i.test(n) && !seen.has(n)) { seen.add(n); out.push(n); } return; }
    if (Array.isArray(n)) return n.forEach((x) => walk(x, d + 1));
    if (typeof n === 'object') for (const k of ['url', 'hd', 'sd', 'video', 'download_url', 'download', 'image', 'media', 'data', 'result', 'links']) if (n[k]) walk(n[k], d + 1);
  };
  walk(result);
  return out;
}

const limitSocial = createLimiter('social-dl', 3);
export function runSocialDownload(sock, msg, url, opts) { return limitSocial(() => runSocialNow(sock, msg, url, opts)); }
async function runSocialNow(sock, msg, url, { label, icon, command }) {
  const chatId = msg.key.remoteJid;
  try {
    await react(sock, msg, '⬇️');
    const { alldl } = await import('rahad-all-downloader-v2');
    const result = await alldl(url);
    const urls = pickUrls(result).slice(0, 4);
    if (!urls.length) throw new AppError('No downloadable media', { kind: 'no_results' });
    let sent = 0;
    for (const u of urls) {
      try {
        const { buffer, contentType } = await downloadBuffer(u, { maxBytes: config.limits.maxMediaMb * 1024 * 1024, timeoutMs: 40000 });
        const isImage = /^image\//i.test(contentType || '') || /\.(jpe?g|png|webp)(\?|$)/i.test(u);
        const caption = brandCaption(`${icon} ${label}`);
        await sock.sendMessage(chatId, isImage ? { image: buffer, caption } : { video: buffer, caption }, { quoted: msg });
        sent++;
        if (!isImage) break; // one video is enough; albums send each photo
      } catch { /* try next candidate link */ }
    }
    if (!sent) throw new AppError('No downloadable media', { kind: 'no_results' });
    await react(sock, msg, '✅');
  } catch (err) {
    if (err.kind === 'no_results') return reply(sock, msg, '❌ Nothing downloadable at that link (it may be private or unsupported).');
    await replyError(sock, msg, err, command);
  }
}

export function makeSocialCommand({ name, alias, platform, label, example }) {
  const p = PLATFORMS[platform];
  return {
    name, alias,
    description: `Download ${label} media. Usage: .${name} <link>`,
    async execute(sock, msg, args, prefix) {
      const url = (args[0] || '').trim();
      if (!url) return reply(sock, msg, usage(prefix, `${name} <${label} link>`, `${name} ${example}`));
      try { await assertPublicHttpUrl(url, { allowedHosts: p.hosts, resolveDns: false }); }
      catch { return reply(sock, msg, `❌ That doesn't look like a ${label} link.`); }
      return runSocialDownload(sock, msg, url, { label, icon: p.icon, command: name });
    }
  };
}
