```markdown
# 🔑 R4VEY-MD Pair Website

A simple, elegant web interface to generate WhatsApp pairing codes for your R4VEY-MD bot using Baileys.

![Preview](https://img.shields.io/badge/status-working-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🌐 **Web‑based pairing** – no terminal needed
- 📱 **Enter your phone number** – get an 8‑digit code instantly
- 🔄 **Auto‑refresh** – waits for connection confirmation
- 🎨 **Clean, responsive UI** – works on desktop and mobile
- 🚀 **Deployable on free platforms** (Render, Railway, etc.)

---

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **WhatsApp Library**: Baileys
- **Frontend**: HTML5 + CSS3 + Vanilla JS (all in one file)

---

## 📁 File Structure

```

pair-website/
├── package.json     # Dependencies and scripts
├── server.js        # Full Express server (frontend + API)
└── .env             # Optional environment variables

```

---

## 🚀 Deployment

### Option 1: Deploy on Render (Free)

1. **Push the project to a GitHub repository** (or upload a ZIP).
2. Go to [render.com](https://render.com) and sign up.
3. Click **"New +"** → **"Web Service"**.
4. Connect your GitHub repo or upload the ZIP.
5. Fill in:
   - **Name**: `r4vey-pair`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
6. Click **"Create Web Service"**.
7. After deployment, you'll get a URL like:  
   `https://r4vey-pair.onrender.com`

### Option 2: Deploy on Railway (Free)

1. Go to [railway.app](https://railway.app) and sign up.
2. Click **"New Project"** → **"Deploy from GitHub"** or **"Upload Files"**.
3. Upload the project files.
4. Railway auto‑detects Node.js and deploys.
5. Your URL will be like: `https://r4vey-pair.up.railway.app`

### Option 3: Local Development

```bash
# Clone or download the project
cd pair-website

# Install dependencies
npm install

# Start the server
node server.js

# Open http://localhost:3000 in your browser
```

---

🧪 Usage

1. Open the deployed URL in your browser.
2. Enter your WhatsApp number (without the + sign).
3. Click "Generate Pairing Code".
4. The page will display an 8‑digit pairing code.
5. Open WhatsApp on your phone → Linked Devices → Link a Device → Link with Phone Number.
6. Enter the code.
7. The page will automatically show "Connected!" once the session is saved.
8. Stop the server (or keep it running for future use) and start your bot – the session is now saved.

---

⚙️ Environment Variables (optional)

Create a .env file in the root directory:

```env
PORT=3000   # Optional, defaults to 3000
```

---

📦 Dependencies

```json
{
  "@whiskeysockets/baileys": "latest",
  "express": "latest",
  "pino": "latest"
}
```

---

🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

📄 License

MIT

---

🙏 Acknowledgements

· Built with Baileys – the WhatsApp Multi-Device library.
· Inspired by the need for a simple, user‑friendly pairing interface.

---

Made with ❤️ for the R4VEY‑MD community

```
