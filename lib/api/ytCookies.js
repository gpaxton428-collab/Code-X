// YouTube cookies — lets .play / .ytmp4 work on hosts YouTube flags as "bots".
// Provide cookies ONE of these ways (first one found wins):
//   1. env  YT_COOKIES   = JSON array exported from a browser (EditThisCookie / Cookie-Editor)
//                          or a raw header string:  name=value; name2=value2
//   2. file cookies.json  (same JSON array)
//   3. file cookies.txt   (Netscape format, as used by yt-dlp)
// Use a throw-away Google account: cookies give access to that account.
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ROOT_DIR } from '../../config/index.js';

let cache;

function fromHeader(str) {
  return str.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf('=');
    return i > 0 ? { name: p.slice(0, i), value: p.slice(i + 1), domain: '.youtube.com', path: '/', secure: true } : null;
  }).filter(Boolean);
}

function fromNetscape(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^#HttpOnly_/, '');
    if (!line.trim() || line.startsWith('#')) continue;
    const f = line.split('\t');
    if (f.length < 7) continue;
    out.push({ domain: f[0], path: f[2], secure: f[3] === 'TRUE', expirationDate: Number(f[4]) || undefined, name: f[5], value: f[6].trim() });
  }
  return out;
}

export function loadYoutubeCookies() {
  if (cache !== undefined) return cache;
  cache = null;
  try {
    const env = (process.env.YT_COOKIES || '').trim();
    if (env) {
      cache = env.startsWith('[') ? JSON.parse(env) : env.startsWith('{') ? [JSON.parse(env)] : fromHeader(env);
    } else if (fs.existsSync(path.join(ROOT_DIR, 'cookies.json'))) {
      cache = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'cookies.json'), 'utf8'));
    } else if (fs.existsSync(path.join(ROOT_DIR, 'cookies.txt'))) {
      cache = fromNetscape(fs.readFileSync(path.join(ROOT_DIR, 'cookies.txt'), 'utf8'));
    }
    if (!Array.isArray(cache) || !cache.length) cache = null;
  } catch { cache = null; }
  return cache;
}

export const hasCookies = () => Boolean(loadYoutubeCookies());

/** Cookies in Netscape format on disk, for yt-dlp. Returns a path or null. */
export function netscapeCookieFile() {
  const cookies = loadYoutubeCookies();
  if (!cookies) return null;
  const direct = path.join(ROOT_DIR, 'cookies.txt');
  if (!process.env.YT_COOKIES && fs.existsSync(direct)) return direct;
  const file = path.join(os.tmpdir(), 'paxton-yt-cookies.txt');
  const lines = ['# Netscape HTTP Cookie File'];
  for (const c of cookies) {
    const domain = c.domain || '.youtube.com';
    lines.push([domain, domain.startsWith('.') ? 'TRUE' : 'FALSE', c.path || '/', c.secure ? 'TRUE' : 'FALSE', Math.floor(c.expirationDate || c.expires || 0) || 0, c.name, c.value].join('\t'));
  }
  try { fs.writeFileSync(file, lines.join('\n'), { mode: 0o600 }); return file; } catch { return null; }
}

// ---- saving / status (used by the owner commands) --------------------------------------------
const AUTH_NAMES = ['SID', '__Secure-3PSID', '__Secure-1PSID', 'LOGIN_INFO', 'SAPISID', '__Secure-3PAPISID'];

/** Turn pasted/uploaded text into a cookie array. Accepts a JSON export or Netscape cookies.txt. */
export function parseCookieText(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  try {
    if (t.startsWith('[') || t.startsWith('{')) {
      const j = JSON.parse(t);
      const arr = Array.isArray(j) ? j : Array.isArray(j.cookies) ? j.cookies : [j];
      const ok = arr.filter((c) => c && c.name && typeof c.value === 'string');
      return ok.length ? { cookies: ok, format: 'json' } : null;
    }
  } catch { return null; }
  const net = fromNetscape(t);
  return net.length ? { cookies: net, format: 'txt' } : null;
}

/** Validate and store cookies as a FILE next to index.js (never in .env). */
export function saveYoutubeCookies(text) {
  const parsed = parseCookieText(text);
  if (!parsed) throw new Error('That does not look like a cookie export (JSON or Netscape cookies.txt).');
  const google = parsed.cookies.filter((c) => /(youtube|google)\.com$/i.test(String(c.domain || '').replace(/^\./, '')));
  if (!google.length) throw new Error('No youtube.com / google.com cookies found in that export.');
  const jsonFile = path.join(ROOT_DIR, 'cookies.json'), txtFile = path.join(ROOT_DIR, 'cookies.txt');
  if (parsed.format === 'json') { fs.writeFileSync(jsonFile, JSON.stringify(parsed.cookies, null, 2), { mode: 0o600 }); try { fs.rmSync(txtFile); } catch {} }
  else { fs.writeFileSync(txtFile, String(text).trim() + '\n', { mode: 0o600 }); try { fs.rmSync(jsonFile); } catch {} }
  cache = undefined;
  return { count: parsed.cookies.length, format: parsed.format };
}

export function clearYoutubeCookies() {
  let removed = false;
  for (const f of ['cookies.json', 'cookies.txt']) { try { fs.rmSync(path.join(ROOT_DIR, f)); removed = true; } catch {} }
  cache = undefined;
  return removed;
}

export function cookieStatus() {
  cache = undefined;
  const c = loadYoutubeCookies();
  if (!c) return { present: false };
  const names = new Set(c.map((x) => x.name));
  const expiries = c.map((x) => Number(x.expirationDate || x.expires || 0)).filter((n) => n > 1e9);
  const soonest = expiries.length ? new Date(Math.min(...expiries) * 1000) : null;
  return { present: true, count: c.length, loggedIn: AUTH_NAMES.some((n) => names.has(n)), expires: soonest };
}
