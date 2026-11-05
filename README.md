<div align="center">

<img src="assets/readme/banner.svg" alt="PAXTON MD — WhatsApp Multi-Device Bot by Paxton Mathebula" width="100%">

<br>

[![Star](https://img.shields.io/github/stars/gpaxton428-collab/Paxton-MD?style=for-the-badge&logo=github&color=ff1a1a&labelColor=000000)](https://github.com/gpaxton428-collab/Paxton-MD/stargazers)
[![Fork](https://img.shields.io/github/forks/gpaxton428-collab/Paxton-MD?style=for-the-badge&logo=github&color=b30000&labelColor=000000)](https://github.com/gpaxton428-collab/Paxton-MD/fork)
[![Node](https://img.shields.io/badge/Node-%E2%89%A5%2020-ff1a1a?style=for-the-badge&logo=nodedotjs&labelColor=000000)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-8b0000?style=for-the-badge&labelColor=000000)](LICENSE)

### ⭐ Star &nbsp;·&nbsp; 🍴 Fork &nbsp;·&nbsp; 🚀 Deploy

**Fast. Light. Runs on Termux, VPS, panels and every free host.**

</div>

<img src="assets/readme/divider.svg" width="100%" alt="">

## 🌑 About

**Paxton MD** is a self-hosted WhatsApp multi-device bot built on [Baileys](https://github.com/WhiskeySockets/Baileys) by **Paxton Mathebula**.
It only reads new messages (no history sync), starts quickly and keeps memory use low, so it runs fine on a phone.

<img src="assets/readme/divider.svg" width="100%" alt="">

## 🔑 1. Get your Session ID

1. Open the session generator: **https://paxton-md-session-generator.onrender.com/**
2. Enter your WhatsApp number with the country code (no `+`).
3. Open WhatsApp → **Linked devices** → **Link a device** → **Link with phone number instead**, then type the code shown on the site.
4. Copy the long string that starts with `PAXTON-MD:` (the bot also sends it to your WhatsApp).

> ⚠️ Your session ID is the key to your WhatsApp account. Never share it and never post it in a public repo.

<img src="assets/readme/divider.svg" width="100%" alt="">

## 📍 2. Where to put the Session ID

Use **one** of these:

| Where you run it | What to do |
|---|---|
| **Heroku / Render / Koyeb / Railway / Fly / Docker** | Add an environment variable named `SESSION_ID` with your string as the value |
| **Panels (Katabump, bot-hosting.net, Pterodactyl…)** | Open the file manager, edit `session_id.txt` and paste the string on one line |
| **Termux / VPS / PC** | Copy `.env.example` to `.env` and write `SESSION_ID=PAXTON-MD:...` (no quotes, no spaces) |

Starting with no session? The bot offers a **pairing code** login in the terminal instead.

**Changed or re-pasted your session?** The bot now clears the old keys automatically when it sees a new session ID, so you will not get "Bad MAC" errors after restarting. If you ever want a clean start by hand, delete the `session` folder and restart.

<img src="assets/readme/divider.svg" width="100%" alt="">

## 🚀 3. Deploy

<details>
<summary><b>📱 Termux (Android)</b></summary>

```bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts ffmpeg -y
git clone https://github.com/gpaxton428-collab/Paxton-MD
cd Paxton-MD
cp .env.example .env
nano .env            # paste SESSION_ID=PAXTON-MD:...
npm install
npm start
```
Keep it alive with `pkg install tmux`, then run `tmux` and `npm start` inside it.
</details>

<details>
<summary><b>🖥️ VPS / Linux / Windows PC</b></summary>

```bash
git clone https://github.com/gpaxton428-collab/Paxton-MD
cd Paxton-MD
cp .env.example .env     # then edit it and add SESSION_ID
npm install
npm start
```
Run it 24/7 with PM2: `npm i -g pm2 && pm2 start index.js --name paxton && pm2 save`
</details>

<details>
<summary><b>🟣 Heroku</b></summary>

1. Fork this repo, create an app, connect your fork.
2. Add buildpacks in this order: `heroku/nodejs`, then `https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git`.
3. Settings → Config Vars → add `SESSION_ID`.
4. Deploy the branch and turn the `web` dyno on.
</details>

<details>
<summary><b>🟢 Render / Koyeb / Railway / Fly.io</b></summary>

Fork the repo and create a new web service from it. The project already contains `render.yaml`, `fly.toml` and a `Dockerfile`. Add `SESSION_ID` as an environment variable, then deploy.
</details>

<details>
<summary><b>🐳 Docker</b></summary>

```bash
docker build -t paxton-md .
docker run -d --name paxton --env-file .env -v paxton-session:/app/session paxton-md
```
</details>

<img src="assets/readme/divider.svg" width="100%" alt="">

## 🎬 Optional: YouTube cookies (for music and video downloads)

Some hosts are blocked by YouTube. If music or video downloads fail, give the bot cookies from a **throw-away Google account**:

1. Sign in to YouTube in your browser and export the cookies (Cookie-Editor extension → Export → JSON, or any cookies.txt exporter).
2. **Easiest:** send the exported file to the bot in WhatsApp with the caption **`.setcookies`** (owner only). It saves the file for you, no restart needed. `.setcookies status` checks them and `.setcookies clear` removes them.
3. **Or by hand:** save the file as `cookies.json` or `cookies.txt` in the bot folder.
4. If your host has `yt-dlp` installed, the bot also uses it automatically as a backup.

`cookies.json` and `cookies.txt` are already in `.gitignore`. Keep them private.

<img src="assets/readme/divider.svg" width="100%" alt="">

## ⚙️ Other settings

Everything is configured in `.env` (see `.env.example` for the full list): bot name, prefix, owner name, menu image, API keys for the optional AI commands, and so on. Send **.menu** to the bot once it is online to see what it can do.

<img src="assets/readme/divider.svg" width="100%" alt="">

## 📦 Packages

`package.json` ships the bot's core packages plus about 100 optional helper packages (date, text, network, file and server tools) for adding your own features. They install automatically. They are optional, so one failing to install never stops the bot.

Short on space or want the fastest install (Termux, free hosts)? Skip them:

```bash
npm install --omit=optional
```
(Converters then use the ffmpeg already on your system.)

<img src="assets/readme/divider.svg" width="100%" alt="">

## ⭐ Support the project

If Paxton MD helped you, please **[⭐ star](https://github.com/gpaxton428-collab/Paxton-MD)** and **[🍴 fork](https://github.com/gpaxton428-collab/Paxton-MD/fork)** the repo. It takes two seconds and it keeps the project alive.

<div align="center">

<br>

**Made with ❤️ and a lot of ☕ by Paxton Mathebula**

`© Paxton-Tech` &nbsp;·&nbsp; MIT License

</div>
