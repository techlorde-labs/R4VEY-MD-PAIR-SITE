// server.js – Complete Pair Website (Frontend + Backend)
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

let pairingCode = null;
let isConnected = false;
let isGenerating = false;

app.use(express.json());
app.use(express.static('public'));

// ─── HTML PAGE (served at /) ───
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>R4VEY-MD Pairing</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0d0d2b, #1a1a3e);
            color: #fff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(12px);
            border-radius: 30px;
            padding: 40px 50px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        h1 { font-size: 2rem; margin-bottom: 8px; }
        .subtitle { color: #aaa; margin-bottom: 25px; font-size: 0.95rem; }
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
            text-align: left;
        }
        .input-group label { font-weight: 600; font-size: 0.9rem; color: #ccc; }
        .input-group input {
            padding: 14px 18px;
            border-radius: 12px;
            border: 1px solid #333;
            background: #0a0a1a;
            color: #fff;
            font-size: 1rem;
            outline: none;
            transition: border 0.3s;
        }
        .input-group input:focus { border-color: #4a6cf7; }
        .btn {
            padding: 16px;
            background: #4a6cf7;
            color: #fff;
            font-size: 1.1rem;
            font-weight: 600;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
            width: 100%;
        }
        .btn:hover { background: #3a5cd7; transform: scale(1.02); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .code-box {
            background: #0a0a1a;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
            border: 2px dashed #4a6cf7;
        }
        .code { font-size: 2.8rem; font-weight: bold; letter-spacing: 6px; color: #4a6cf7; font-family: 'Courier New', monospace; }
        .status {
            margin-top: 15px;
            padding: 12px;
            border-radius: 10px;
            font-weight: 500;
            display: none;
        }
        .status.show { display: block; }
        .status.success { background: #1e7e34; color: #b7ffc7; }
        .status.waiting { background: #7a6a1e; color: #ffefb7; }
        .status.error { background: #7e1e1e; color: #ffb7b7; }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4a6cf7;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
            display: none;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .footer { margin-top: 20px; font-size: 0.8rem; color: #555; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 R4VEY-MD</h1>
        <p class="subtitle">WhatsApp Pairing Generator</p>

        <div id="step1">
            <div class="input-group">
                <label>📱 Your WhatsApp Number</label>
                <input type="text" id="phoneInput" placeholder="e.g. 256701956058" value="">
            </div>
            <button class="btn" id="generateBtn" onclick="generatePair()">🚀 Generate Pairing Code</button>
        </div>

        <div id="loader" class="loader"></div>

        <div id="result" class="hidden">
            <div class="code-box">
                <div class="code" id="pairingCode">──────</div>
            </div>
            <p style="color:#aaa; font-size:0.9rem;">
                Open WhatsApp → <strong>Linked Devices</strong> → <strong>Link with Phone Number</strong>
            </p>
            <div class="status waiting show" id="statusMsg">⏳ Waiting for connection...</div>
            <button class="btn" style="margin-top: 12px; background:#333;" onclick="reset()">⟳ New Code</button>
        </div>

        <div class="footer">R4VEY-MD v1.0</div>
    </div>

    <script>
        async function generatePair() {
            const phone = document.getElementById('phoneInput').value.trim();
            if (!phone || phone.length < 10) {
                alert('Please enter a valid phone number (without +).');
                return;
            }

            const btn = document.getElementById('generateBtn');
            const loader = document.getElementById('loader');
            btn.disabled = true;
            loader.style.display = 'block';

            try {
                const resp = await fetch('/pair', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone })
                });
                const data = await resp.json();

                if (data.success) {
                    document.getElementById('step1').style.display = 'none';
                    document.getElementById('result').classList.remove('hidden');
                    document.getElementById('pairingCode').textContent = data.code;
                    document.getElementById('statusMsg').textContent = '⏳ Waiting for connection...';
                    document.getElementById('statusMsg').className = 'status waiting show';
                    checkStatus();
                } else {
                    alert('❌ ' + data.error);
                }
            } catch (err) {
                alert('❌ Failed to connect: ' + err.message);
            }

            btn.disabled = false;
            loader.style.display = 'none';
        }

        async function checkStatus() {
            try {
                const resp = await fetch('/status');
                const data = await resp.json();
                if (data.connected) {
                    document.getElementById('statusMsg').textContent = '✅ Connected! Session saved.';
                    document.getElementById('statusMsg').className = 'status success show';
                } else {
                    setTimeout(checkStatus, 3000);
                }
            } catch (e) {
                setTimeout(checkStatus, 5000);
            }
        }

        function reset() {
            document.getElementById('step1').style.display = 'block';
            document.getElementById('result').classList.add('hidden');
            document.getElementById('pairingCode').textContent = '──────';
            document.getElementById('statusMsg').className = 'status';
        }
    </script>
</body>
</html>
    `);
});

// ─── API: Generate pairing code ───
app.post('/pair', async (req, res) => {
    if (isGenerating) {
        return res.json({ success: false, error: 'Already generating' });
    }
    if (pairingCode && !isConnected) {
        return res.json({ success: true, code: pairingCode });
    }

    const { phone } = req.body || {};
    if (!phone || phone.length < 10) {
        return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }

    isGenerating = true;
    pairingCode = null;
    isConnected = false;

    try {
        const authFolder = "./sessions";
        if (fs.existsSync(authFolder)) {
            fs.rmSync(authFolder, { recursive: true, force: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        const sock = makeWASocket({
            auth: state,
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            browser: ["R4VEY-MD", "Chrome", "1.0.0"]
        });

        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
                isConnected = true;
                console.log("✅ Connected!");
            }
            if (connection === "close") {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === 401) console.error("Auth failed.");
            }
        });

        const phoneNumber = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        console.log(`Requesting pairing for ${phoneNumber}...`);
        await new Promise(r => setTimeout(r, 2000));
        const code = await sock.requestPairingCode(phoneNumber);
        pairingCode = code;
        console.log(`Pairing code: ${code}`);
        res.json({ success: true, code });
    } catch (err) {
        console.error("Pairing error:", err);
        res.json({ success: false, error: err.message });
    } finally {
        isGenerating = false;
    }
});

// ─── Status endpoint ───
app.get('/status', (req, res) => {
    res.json({ connected: isConnected });
});

app.listen(PORT, () => {
    console.log(`\n🌐 Pairing website running at http://localhost:${PORT}`);
    console.log(`📲 Open this URL in your browser.\n`);
});
