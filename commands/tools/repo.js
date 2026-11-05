import { fetchWithTimeout } from '../../lib/utils/http.js';

const REPO = 'gpaxton428-collab/Paxton-MD';
const REPO_URL = `https://github.com/${REPO}`;
const SESSION_SITE = 'https://paxton-md-session-generator.onrender.com/';

export default {
  name: 'repo',
  alias: ['sc', 'source', 'script', 'git', 'github', 'botrepo'],
  description: "Bot repository, live stars/forks and the session generator website. Usage: .repo",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    let stars = '—', forks = '—', watchers = '—', updated = '—';
    try {
      const res = await fetchWithTimeout(`https://api.github.com/repos/${REPO}`, { headers: { 'User-Agent': 'PaxtonMD', Accept: 'application/vnd.github+json' } }, 10000);
      const d = await res.json();
      if (d && !d.message) {
        stars = d.stargazers_count ?? '—'; forks = d.forks_count ?? '—'; watchers = d.subscribers_count ?? d.watchers_count ?? '—';
        updated = d.pushed_at ? new Date(d.pushed_at).toDateString() : '—';
      }
    } catch { /* offline or rate limited: still show the links */ }
    const text = `╭━━━〔 📦 PAXTON MD REPO 〕━━━┈⊷
┃ 👑 Owner: Paxton
┃ ⭐ Stars: ${stars}
┃ 🍴 Forks: ${forks}
┃ 👁️ Watchers: ${watchers}
┃ 🕐 Updated: ${updated}
╰━━━━━━━━━━━━━━━┈⊷

🔗 *Repo:* ${REPO_URL}
🍴 *Fork:* ${REPO_URL}/fork
🌐 *Get your session ID:* ${SESSION_SITE}

⭐ _Don't forget to star and fork the repo!_

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
