// Where to find ffmpeg. Order: FFMPEG_PATH env -> the bundled binary from the
// optional @ffmpeg-installer/ffmpeg package (works on panels/Heroku with no apt) -> "ffmpeg" on PATH.
let cached;
export async function getFfmpegPath() {
  if (cached) return cached;
  if (process.env.FFMPEG_PATH) return (cached = process.env.FFMPEG_PATH);
  try {
    const mod = await import('@ffmpeg-installer/ffmpeg');
    const p = (mod.default || mod).path;
    if (p) return (cached = p);
  } catch { /* package not installed: use the system one */ }
  return (cached = 'ffmpeg');
}
