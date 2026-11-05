export default {
  name: 'fork',
  alias: ['star'],
  description: "Get the links to star and fork the bot's repo. Usage: .fork",
  async execute(sock, msg) {
    const text = `╭━━━〔 🍴 FORK & STAR 〕━━━┈⊷
┃ ⭐ Star: https://github.com/gpaxton428-collab/Paxton-MD
┃ 🍴 Fork: https://github.com/gpaxton428-collab/Paxton-MD/fork
┃ 🌐 Session: https://paxton-md-session-generator.onrender.com/
╰━━━━━━━━━━━━━━━┈⊷

_Don't forget to star and fork the repo!_`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
