## 3.3.1 — cookies
- **`.setcookies`** (owner only): send a `cookies.json` / `cookies.txt` file (or reply to pasted cookies) and the bot validates and saves it as a file, no `.env` and no restart. `.setcookies status` / `.setcookies clear`. Pasted cookie messages are deleted when possible.

## 3.3.0 — speed
- **Job limiter**: ffmpeg runs at most 1-3 at a time (based on CPU cores) and downloads at most 3, others queue instead of freezing the bot.
- **Caching**: repeated YouTube searches (10 min) and recently downloaded songs/videos (40 MB, 10 min) are served instantly.
- **Duplicate guard**: a message WhatsApp redelivers is handled once, so no double replies.
- **Prewarm**: `sharp` and `youtube-sr` are loaded in the background 8 s after start (`PREWARM=false` to disable).
- **Event-loop lag watchdog** logs a warning when something blocks the bot; `.health` now shows the job queues.

## 3.2.0 — system + package features
- **System**: per-user flood guard (1.2 s between commands, owner exempt), "Did you mean .kick?" for mistyped commands, usage stats saved to `data/command-stats.json`, automatic cleanup of leftover temp files and a memory-pressure relief every 10 minutes, clean save on shutdown.
- **New commands**: `.health` (memory, CPU, event-loop lag, caches), `.topcmds`, `.cmdsearch` (fuzzy command finder), `.math` (mathjs, hardened), `.worldtime` (moment-timezone), `.linkpreview` (cheerio), `.readqr` (jimp + jsqr), `.figlet`, `.emojiname`, `.fakeidentity`, `.encrypt` / `.decrypt` (AES-256-GCM), and format converters `.yaml2json` `.json2yaml` `.csv2json` `.xml2json`.
- Package-based commands load their package on demand and show a clear "run npm install <pkg>" message if it is missing.

## 3.1.1 — delivery fix
- **"Waiting for this message" fix**: `getMessage` now serves the bot's own recent sends (live only, no history) so retry receipts can be answered.
- **Self-healing**: repeated Bad MAC / undecryptable messages clear only the stale encryption sessions and reconnect once (never touches creds).
- **Speed**: group metadata is cached for 5 minutes (invalidated on group changes) and passed to Baileys as `cachedGroupMetadata`, so group commands and group sends make far fewer network calls.

## 3.1.0 — stability + media
- **Fixes**: "Bad MAC" after pasting a new session (old signal keys are now wiped when the session string changes); libsignal "Closing open session…" log spam hidden; startup no longer syncs history or fetches groups (`syncFullHistory:false`, `getMessage` returns undefined); only live `notify` messages are processed and replayed old ones are skipped.
- **Admin check**: one central group-admin gate for every admin command; non-admins get a clear message.
- **Logs**: every command prints a boxed log (who, where, what).
- **Connection status** message redesigned.
- **vv2 without a prefix**: owner replies to a view-once/photo/video/voice note with any emoji, a sticker or a GIF and the media goes to the owner's inbox.
- **Converters rewritten** (shared `lib/helpers/mediaTools.js`): `.sticker`, `.toimage`, `.stickertoimg`, `.tovideo`, `.togif`, `.tomp3`, `.tovn`, `.videotosticker`, `.circle`, image effects (`blur grayscale negative mirror flipimg rotate sharpen sepia`) and audio effects (`bass nightcore slowmo speedup deepvoice reverseaudio robot echo`). Animated stickers now convert correctly (via sharp, not ffmpeg).
- **Downloads**: `.play` / `.ytmp3dl` / new `.video` support YouTube cookies (`YT_COOKIES`, `cookies.json`, `cookies.txt`) with a `yt-dlp` fallback; new `.dl`, `.twitterdl`, `.pinterestdl`, `.threadsdl`.
- **togstatus** now posts voice notes and stickers, takes a `#colour`, and works outside groups; `poststatus` handles audio/stickers; `.toprofile` alias for the bot profile picture.
- **repo / fork** show live stars, forks and the session-generator site; many new aliases (e.g. `.k` for kick).
- Optional bundled ffmpeg (`@ffmpeg-installer/ffmpeg`) so converters work on hosts without ffmpeg.
- New README with animated banner.

## 3.1.0
- **Menu**: `.menu` now sends ONE message — the menu picture with the full command list as its caption (header, every category one command per line, footer). Falls back to plain text if the picture can't be sent. Style 1 header matches the new layout (no blank line under the panel title).
- **New commands ported from Silva MD** (rewritten for Paxton, no new dependencies, no API keys): `.ip`, `.country`, `.crypto`, `.news`, `.bible`, `.wiki`, `.paste`, `.device`, `.react`, `.imdb`, `.anime`, `.manga`, `.meme`, `.numberfact`, `.hangman` (`.hm`), `.emojimix`, `.notes`, and owner-only `.edit`.
- **From Atlas-MD**: 26 anime reaction GIF commands (`.hug .pat .slap .kiss .bonk .cuddle ...`, tag or reply to someone; `.reactions` lists them), `.couplepp`, `.gethtml`. `.kick` stays the admin command, so the kick reaction is `.reactions kick`.
- `tests/menu.test.mjs` updated for the single image+caption menu.

## 2.8.0
- Paxton MD cleanup build.
- Pinned Baileys to 6.7.24.
- Removed optional Jimp dependency.
- Developer contact updated to +27797352930.
- 371 unique command modules retained and verified by the command loader/tests.
- Group protection includes 10+ anti-* commands.

# Changelog

## 2.9.0
- Menu header image now rotates through bundled pictures in `assets/menu/` (on by default).
- Session generator page redesigned: responsive layout with an image showcase, deploy guide tab.
- Heroku: `Procfile` runs a web dyno, `app.json` added (Node.js + FFmpeg buildpacks).
- Panels: `SERVER_PORT` is used when `PORT` is unset; `session_id.txt` template; saved sessions are no longer overwritten on every restart; web server errors no longer affect the bot.

## 2.6.1

**Menus**: every command is listed on its own line under its category (Tools → .ping / .runtime / …) in all eight styles. New `.adstag` sets the label above the menu ad (`MENU_ADS_TAG`); `.setmenuads` and `.reloadconfig` show it. The menu message also carries a WhatsApp-style "Ad" badge (`.adstag badge on|off`).
**Status replies**: `.ping`, `.runtime`, `.alive`, `.botinfo`, `.version`, `.stats`, `.sysinfo`, `.botcore` carry a cosmetic "Forwarded many times" label (`BOT_FORWARDED_TAG=off` to hide). `.ping` now sends the result as a new message and removes the "Pinging…" placeholder, because an edit cannot carry the label.
**Dev commands**: `uptime2.js` renamed to `processinfo.js`; all dev commands are `strictOwner` (hidden from sudo users who cannot run them); `.fixsettings` keeps a `.bak` copy; `.npm` only accepts package names and `--depth/--json/--long`; `.devcheck`/`.errorlog` cope with errors that have no scope; `.botcore` uses the same runtime format as `.ping`; wrong "$-prefix" wording removed.

## 2.6.0 — Paxton MD V2 clean release

**API layer**: single Wolvarex client (`lib/api/`) with timeouts, retry, redaction and tolerant response parsing; music, AI, fun, upload, search, screenshot, weather, Instagram and converter endpoints all use it. Fun commands fall back to their offline lists.
**Fixed**: `.play` rewritten on `/music/ytmp3-search` → `/music/ytmp3-download` with audio validation; `.setbotpp` no longer depends on Baileys' image library (also fixes `.groupicon`); API key was read before `.env` was loaded (empty key when supplied via `.env`); `watermark` imported an undeclared `jimp`; duplicate/dead code in ping/runtime.
**Menus**: text-only, six views × eight styles, ads block (`.setmenuads`), new USER / DOWNLOAD / SEARCH / UTILITY categories. Button menus and the `gifted-btns` / `my-md-btns` dependencies were removed.
**New commands**: `userinfo profile avatar afk reminder usermenu songs plugins reloadplugins setmenuads` and menu shortcuts per category.
**Security**: no secrets in the repo, SSRF guard, sandboxed file commands, strict-owner tier, `.eval`/`.update`/auto-join opt-in, hard-coded developer-number shortcut replaced by `DEV_NUMBERS`, global output redaction.
**Ops**: Dockerfile, compose, Fly.io, Koyeb, graceful SIGTERM, `/health` + `/healthz`, unit tests.
**Removed**: `.buttonmenu`, `.buttontest`, `.video` (guessed endpoints), `wouldyourather2`, unused deps (`pino`, `dotenv`).
