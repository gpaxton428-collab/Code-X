// Free YouTube search + audio download — no API key, no Wolvarex.
// Search: youtube-sr (scrapes YouTube's own search page, same approach
// most no-key WhatsApp bots use). Download: @distube/ytdl-core, an
// actively-maintained ytdl-core fork.
//
// Trade-off worth knowing: unlike a paid API, a scraper like this can
// break whenever YouTube changes its page markup, and there's no SLA
// or support contract behind it. It's free and key-less, not
// maintenance-free — if .play or .songs suddenly stop working, it's
// usually because one of these two packages needs a version bump.
import { TtlCache } from '../utils/ttlCache.js';
import { createLimiter } from '../utils/limiter.js';
import { AppError } from '../utils/errors.js';

const YT_ID = /(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/;
const BARE_ID = /^[\w-]{11}$/;
export function extractVideoId(input) {
  const s = String(input || '').trim();
  const m = s.match(YT_ID);
  if (m) return m[1];
  return BARE_ID.test(s) ? s : null;
}
import { formatClock } from '../utils/format.js';
import { config } from '../../config/index.js';

let YouTube, ytdl;
async function backends() {
  if (!YouTube) YouTube = (await import('youtube-sr')).default;
  if (!ytdl) ytdl = (await import('@distube/ytdl-core')).default;
  return { YouTube, ytdl };
}

function normalize(v) {
  return {
    id: v.id,
    title: v.title || 'Unknown title',
    artist: v.channel?.name,
    durationSeconds: v.duration ? Math.floor(v.duration / 1000) : undefined,
    duration: v.duration ? formatClock(Math.floor(v.duration / 1000)) : v.durationFormatted,
    thumbnail: v.thumbnail?.url,
    url: v.url || `https://www.youtube.com/watch?v=${v.id}`
  };
}

const SEARCH_CACHE = new TtlCache(600, 200);        // same search within 10 min = instant
const MEDIA_CACHE = new Map();                        // id -> { buffer, at } small byte-bounded cache
const MEDIA_CACHE_MAX = 40 * 1024 * 1024;
const limitDownload = createLimiter('downloads', 3);
function cacheMedia(key, buffer) {
  if (buffer.length > MEDIA_CACHE_MAX / 2) return;
  MEDIA_CACHE.set(key, { buffer, at: Date.now() });
  let total = 0; for (const v of MEDIA_CACHE.values()) total += v.buffer.length;
  while (total > MEDIA_CACHE_MAX && MEDIA_CACHE.size) { const k = MEDIA_CACHE.keys().next().value; total -= MEDIA_CACHE.get(k).buffer.length; MEDIA_CACHE.delete(k); }
}
const cachedMedia = (key) => { const v = MEDIA_CACHE.get(key); if (!v) return null; if (Date.now() - v.at > 10 * 60 * 1000) { MEDIA_CACHE.delete(key); return null; } return v.buffer; };

export async function searchTracks(query, { limit = 5 } = {}) {
  const q = String(query || '').trim();
  if (!q) throw new AppError('Please type a song name.', { kind: 'invalid_input' });
  if (q.length > 120) throw new AppError('That search is too long (max 120 characters).', { kind: 'invalid_input' });
  const cacheKey = `${limit}|${q.toLowerCase()}`;
  const hit = SEARCH_CACHE.get(cacheKey);
  if (hit) return hit;
  const { YouTube } = await backends();
  const results = await YouTube.search(q, { limit, type: 'video' }).catch(() => []);
  const tracks = results.map(normalize).filter((t) => t.id).slice(0, limit);
  if (!tracks.length) throw new AppError('No results', { kind: 'no_results' });
  SEARCH_CACHE.set(cacheKey, tracks);
  return tracks;
}

import { execFile } from 'child_process';
import { loadYoutubeCookies, netscapeCookieFile } from './ytCookies.js';

let agent;
export function resetYoutubeAgent() { agent = undefined; }
async function getAgent() {
  if (agent !== undefined) return agent;
  agent = null;
  const cookies = loadYoutubeCookies();
  if (cookies) {
    try { agent = (await backends()).ytdl.createAgent(cookies); } catch { agent = null; }
  }
  return agent;
}

function collect(stream, limit, tooBig) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    stream.on('data', (chunk) => {
      total += chunk.length;
      if (total > limit) { stream.destroy(); reject(new AppError(tooBig, { kind: 'too_large' })); return; }
      chunks.push(chunk);
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(new AppError(`Download failed: ${err.message}`, { kind: 'bad_response' })));
  });
}

// yt-dlp is an optional fallback: if the host has it installed it is used when ytdl-core is blocked.
function ytDlp(url, format, limit) {
  return new Promise((resolve, reject) => {
    const args = ['-f', format, '--no-playlist', '--no-warnings', '-q', '-o', '-', url];
    const cookieFile = netscapeCookieFile();
    if (cookieFile) args.unshift('--cookies', cookieFile);
    const child = execFile('yt-dlp', args, { encoding: 'buffer', maxBuffer: limit + 1024 * 1024, timeout: 180000 }, (err, stdout) => {
      if (err) return reject(err.code === 'ENOENT' ? new AppError('yt-dlp is not installed', { kind: 'config' }) : new AppError(`Download failed: ${String(err.message).slice(0, 120)}`, { kind: 'bad_response' }));
      if (stdout.length > limit) return reject(new AppError('That file is too large to send.', { kind: 'too_large' }));
      resolve(stdout);
    });
    child.on('error', () => {});
  });
}

const toUrl = (idOrUrl) => (/^https?:\/\//i.test(idOrUrl) ? idOrUrl : `https://www.youtube.com/watch?v=${idOrUrl}`);

export async function getAudioBuffer(idOrUrl, opts = {}) {
  const id = extractVideoId(String(idOrUrl)) || String(idOrUrl);
  const hit = cachedMedia(`a:${id}`);
  if (hit) return hit;
  const buf = await limitDownload(() => getAudioBufferNow(idOrUrl, opts));
  cacheMedia(`a:${id}`, buf);
  return buf;
}
async function getAudioBufferNow(idOrUrl, { maxBytes } = {}) {
  const { ytdl } = await backends();
  const url = toUrl(idOrUrl);
  if (!ytdl.validateURL(url)) throw new AppError('That is not a valid YouTube video id or link.', { kind: 'invalid_input' });
  const limit = maxBytes || config.limits.maxAudioMb * 1024 * 1024;
  try {
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25, agent: await getAgent() || undefined });
    return await collect(stream, limit, 'That audio is too large to send.');
  } catch (err) {
    if (err.kind === 'too_large' || err.kind === 'invalid_input') throw err;
    try { return await ytDlp(url, 'bestaudio[ext=m4a]/bestaudio', limit); }
    catch (e2) { throw e2.kind === 'config' ? err : e2; }
  }
}

export async function getVideoBuffer(idOrUrl, opts = {}) {
  const id = extractVideoId(String(idOrUrl)) || String(idOrUrl);
  const hit = cachedMedia(`v:${id}`);
  if (hit) return hit;
  const buf = await limitDownload(() => getVideoBufferNow(idOrUrl, opts));
  cacheMedia(`v:${id}`, buf);
  return buf;
}
async function getVideoBufferNow(idOrUrl, { maxBytes } = {}) {
  const { ytdl } = await backends();
  const url = toUrl(idOrUrl);
  if (!ytdl.validateURL(url)) throw new AppError('That is not a valid YouTube video id or link.', { kind: 'invalid_input' });
  const limit = maxBytes || config.limits.maxMediaMb * 1024 * 1024;
  try {
    const stream = ytdl(url, { quality: 'highest', filter: (f) => f.container === 'mp4' && f.hasAudio && f.hasVideo, highWaterMark: 1 << 25, agent: await getAgent() || undefined });
    return await collect(stream, limit, 'That video is too large to send.');
  } catch (err) {
    if (err.kind === 'too_large' || err.kind === 'invalid_input') throw err;
    try { return await ytDlp(url, 'best[ext=mp4][height<=720]/best[ext=mp4]/best', limit); }
    catch (e2) { throw e2.kind === 'config' ? err : e2; }
  }
}

export async function getVideoInfo(idOrUrl) {
  const { ytdl } = await backends();
  const info = await ytdl.getBasicInfo(toUrl(idOrUrl), { agent: await getAgent() || undefined });
  const d = info.videoDetails;
  return { id: d.videoId, title: d.title, artist: d.author?.name, durationSeconds: Number(d.lengthSeconds) || 0, thumbnail: d.thumbnails?.at(-1)?.url, url: d.video_url };
}

export const maxAudioSeconds = () => config.limits.maxAudioMinutes * 60;
