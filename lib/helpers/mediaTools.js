// One small toolkit behind every converter / effect command: pull the media out
// of the message (or the message it replies to), run it through ffmpeg or sharp,
// send the result. sharp and ffmpeg are only loaded when a command actually needs them.
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { getFfmpegPath } from './ffmpegPath.js';
import { react, reply, replyError } from './reply.js';
import { brandSticker } from '../stickerBrand.js';
import { AppError } from '../utils/errors.js';
import { createLimiter } from '../utils/limiter.js';

const run = promisify(execFile);
const limitFfmpeg = createLimiter('ffmpeg', Math.max(1, Math.min(3, Math.floor(os.cpus().length / 2) || 1)));
const MAX_INPUT = 40 * 1024 * 1024;

/** Find the first media node of one of `kinds` in the message itself or in the message it replies to. */
export function findMedia(msg, kinds) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    || msg.message?.imageMessage?.contextInfo?.quotedMessage
    || msg.message?.videoMessage?.contextInfo?.quotedMessage;
  for (const src of [msg.message, quoted]) {
    if (!src) continue;
    for (const kind of kinds) {
      const node = src[`${kind}Message`];
      if (node) return { kind, node };
    }
    // a document that is really an image/video/audio
    const doc = src.documentMessage;
    if (doc?.mimetype) {
      const k = doc.mimetype.split('/')[0];
      if (kinds.includes(k)) return { kind: k, node: doc, isDocument: true };
    }
  }
  return null;
}

export async function downloadMedia({ kind, node, isDocument }) {
  if (Number(node.fileLength) > MAX_INPUT) throw new AppError('That file is too big to convert (max 40 MB).', { kind: 'too_large' });
  const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
  const stream = await downloadContentFromMessage(node, isDocument ? 'document' : kind);
  const chunks = [];
  let total = 0;
  for await (const chunk of stream) {
    total += chunk.length;
    if (total > MAX_INPUT) throw new AppError('That file is too big to convert (max 40 MB).', { kind: 'too_large' });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** Run ffmpeg on a buffer and return the output buffer. */
export function ffmpeg(buffer, args, outExt, opts = {}) { return limitFfmpeg(() => ffmpegNow(buffer, args, outExt, opts)); }
async function ffmpegNow(buffer, args, outExt, { timeout = 90000, inputArgs = [] } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `mt-${crypto.randomBytes(4).toString('hex')}-`));
  try {
    const inFile = path.join(dir, 'in');
    const outFile = path.join(dir, `out.${outExt}`);
    await fs.writeFile(inFile, buffer);
    await run(await getFfmpegPath(), ['-y', '-loglevel', 'error', ...inputArgs, '-i', inFile, ...args, outFile], { timeout });
    return await fs.readFile(outFile);
  } finally { fs.rm(dir, { recursive: true, force: true }).catch(() => {}); }
}

let sharpMod;
export async function sharp() { return (sharpMod ||= (await import('sharp')).default); }

// ---------- stickers ----------
export async function imageToSticker(buffer, packname, author) {
  const s = await sharp();
  const webp = await s(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 85 }).toBuffer();
  return brandSticker(webp, packname, author);
}

export async function videoToSticker(buffer, packname, author) {
  const attempts = [
    { fps: 15, q: 50, t: 8 },
    { fps: 12, q: 35, t: 6 },
    { fps: 10, q: 20, t: 5 }
  ];
  let out;
  for (const a of attempts) {
    out = await ffmpeg(buffer, [
      '-vf', `fps=${a.fps},scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000`,
      '-t', String(a.t), '-an', '-loop', '0', '-c:v', 'libwebp', '-lossless', '0', '-q:v', String(a.q), '-preset', 'default'
    ], 'webp');
    if (out.length <= 900 * 1024) break; // WhatsApp rejects heavy animated stickers
  }
  return brandSticker(out, packname, author);
}

// ---------- sticker -> image / video ----------
export async function stickerToImage(buffer) {
  const s = await sharp();
  return s(buffer).png().toBuffer(); // first frame of animated stickers
}

export async function stickerToVideo(buffer) {
  const s = await sharp();
  let gif;
  try { gif = await s(buffer, { animated: true }).gif().toBuffer(); }
  catch { throw new AppError('Could not read that sticker. Is it animated?', { kind: 'invalid_input' }); }
  return ffmpeg(gif, ['-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'], 'mp4');
}

// ---------- command factory ----------
const NEED = {
  image: 'an image', video: 'a video or GIF', audio: 'an audio / voice note', sticker: 'a sticker',
  'image,video': 'an image or video', 'video,audio': 'a video or audio', 'image,video,sticker': 'an image, video or sticker',
  'audio,video': 'a video or audio'
};

/**
 * makeMediaCommand({ name, alias, description, kinds, handler })
 * handler({ sock, msg, args, media, buffer, kind, chatId }) must send its own result.
 */
export function makeMediaCommand({ name, alias, description, kinds, handler }) {
  return {
    name, alias, description,
    async execute(sock, msg, args, prefix) {
      const chatId = msg.key.remoteJid;
      const media = findMedia(msg, kinds);
      if (!media) return reply(sock, msg, `❌ Reply to ${NEED[kinds.join(',')] || kinds.join('/')} with ${prefix}${name}`);
      try {
        await react(sock, msg, '🔄');
        const buffer = await downloadMedia(media);
        await handler({ sock, msg, args, media, buffer, kind: media.kind, chatId, prefix });
        await react(sock, msg, '✅');
      } catch (err) {
        if (err.code === 'ENOENT' || /ffmpeg/i.test(err.message || '') && /not found|ENOENT/i.test(err.message || '')) {
          return replyError(sock, msg, new AppError('ffmpeg is not installed on this host.', { kind: 'config', userMessage: '📦 *ffmpeg missing*\n\nInstall it: pkg install ffmpeg (Termux) or apt install ffmpeg (Linux), or run npm install to get the bundled one.' }), name);
        }
        if (err.code === 'ERR_MODULE_NOT_FOUND') {
          return replyError(sock, msg, new AppError('A required package is missing. Run: npm install', { kind: 'config', userMessage: '📦 *Package missing*\n\nA required package is not installed. Run: npm install' }), name);
        }
        await replyError(sock, msg, err, name);
      }
    }
  };
}
