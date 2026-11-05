import { detectPlatform, PLATFORMS, runSocialDownload } from '../../lib/helpers/socialDownload.js';
import { reply, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'dl',
  alias: ['alldl', 'getmedia', 'download2'],
  description: 'Paste any TikTok / Instagram / Facebook / Twitter / Pinterest / Threads link and get the media. Usage: .dl <link>',
  async execute(sock, msg, args, prefix) {
    const url = (args[0] || '').trim();
    if (!url) return reply(sock, msg, usage(prefix, 'dl <link>', 'dl https://vm.tiktok.com/xxxx'));
    const platform = detectPlatform(url);
    if (!platform) return reply(sock, msg, '❌ Unsupported link. I can download TikTok, Instagram, Facebook, Twitter/X, Pinterest and Threads. For YouTube use .play or .video.');
    return runSocialDownload(sock, msg, url, { label: platform[0].toUpperCase() + platform.slice(1), icon: PLATFORMS[platform].icon, command: 'dl' });
  }
};
