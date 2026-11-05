import { safeErrorMessage } from '../../lib/utils/errors.js';
import { recordStatusPost } from '../../lib/statusViews.js';

export default {
  name: 'togstatus',
  alias: ['setstatus', 'poststatus2', 'statuspost', 'tostatus'],
  ownerOnly: true,
  description: "Post a replied message (image/video/voice note/sticker/text) — or text you type after the command — to the bot's own WhatsApp Status. Usage: reply with .togstatus, or .togstatus [#colour] <text>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let typedText = args.join(' ');
    // optional first argument: a #RRGGBB background colour for text statuses
    let bgColor = '#000000';
    if (/^#[0-9a-f]{6}$/i.test(args[0] || '')) { bgColor = args[0]; typedText = args.slice(1).join(' '); }

    // WhatsApp status privacy hides a status update from anyone who isn't
    // explicitly listed as a viewer via statusJidList — this is why status
    // posted from a group never showed up for that group's members. When
    // the command is run inside a group, pull the participant list and
    // pass it along so they're included as viewers.
    let statusJidList;
    if (chatId.endsWith('@g.us')) {
      try {
        const metadata = await sock.groupMetadata(chatId);
        statusJidList = metadata.participants.map((p) => p.id).filter((jid) => jid !== sock.user?.id);
      } catch {
        statusJidList = undefined;
      }
    } else {
      // Outside a group WhatsApp still needs to know who may see the status, and the bot keeps no
      // contact store. Use everyone from the groups it is in (looked up now, once, on demand).
      try {
        const all = await sock.groupFetchAllParticipating();
        const set = new Set();
        for (const g of Object.values(all)) for (const p of g.participants) set.add(p.id);
        set.delete(sock.user?.id);
        statusJidList = [...set].slice(0, 1000);
      } catch { statusJidList = undefined; }
    }
    const statusOptions = statusJidList && statusJidList.length ? { statusJidList, backgroundColor: bgColor } : { backgroundColor: bgColor };

    try {
      let sentStatusMsg;
      if (quoted?.imageMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        sentStatusMsg = await sock.sendMessage('status@broadcast', { image: Buffer.concat(chunks), caption: quoted.imageMessage.caption || typedText || '' }, statusOptions);
      } else if (quoted?.videoMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        sentStatusMsg = await sock.sendMessage('status@broadcast', { video: Buffer.concat(chunks), caption: quoted.videoMessage.caption || typedText || '' }, statusOptions);
      } else if (quoted?.audioMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        sentStatusMsg = await sock.sendMessage('status@broadcast', { audio: Buffer.concat(chunks), mimetype: 'audio/ogg; codecs=opus', ptt: true }, statusOptions);
      } else if (quoted?.stickerMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const { default: sharp } = await import('sharp');
        sentStatusMsg = await sock.sendMessage('status@broadcast', { image: await sharp(Buffer.concat(chunks)).png().toBuffer(), caption: typedText || '' }, statusOptions);
      } else {
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text;
        const content = quotedText || typedText;
        if (!content) return sock.sendMessage(chatId, { text: '❌ Reply to text/image/video with .togstatus, or use .togstatus <text>' }, { quoted: msg });
        sentStatusMsg = await sock.sendMessage('status@broadcast', { text: content }, statusOptions);
      }
      // Quoting the actual status message we just sent (rather than just
      // describing it in plain text) is what makes WhatsApp render the
      // real green "Status" card in the chat, instead of a plain bubble.
      if (sentStatusMsg?.key?.id) recordStatusPost(sentStatusMsg.key.id);
      if (chatId.endsWith('@g.us') && sentStatusMsg) {
        try {
          await sock.sendMessage(chatId, { text: '📸 New status posted — tap above to view.' }, { quoted: sentStatusMsg });
        } catch {}
      }
      await sock.sendMessage(chatId, { text: '✅ Posted to status.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
