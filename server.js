// server.js – R4VEY-MD Pairing Website with YouTube Music
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

let globalSock = null;
let pairingCode = null;
let isConnected = false;
let isGenerating = false;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>R4VEY-MD Pairing</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: radial-gradient(ellipse at center, #0a0a1a, #05050f);
            color: #fff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }
        #particles {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 0;
            pointer-events: none;
        }
        .container {
            position: relative;
            z-index: 1;
            background: rgba(10,10,30,0.7);
            backdrop-filter: blur(20px);
            border-radius: 40px;
            padding: 45px 50px;
            max-width: 550px;
            width: 100%;
            text-align: center;
            border: 1px solid rgba(255,215,0,0.2);
            box-shadow: 0 0 60px rgba(255,215,0,0.05), inset 0 0 60px rgba(255,215,0,0.02);
            animation: fadeInUp 1.2s ease-out;
        }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(60px); } to { opacity:1; transform:translateY(0); } }
        h1 {
            font-size: 2.6rem;
            font-weight: 800;
            background: linear-gradient(135deg, #f7b733, #fc4a1a, #f7b733);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 300% 300%;
            animation: shimmer 4s ease-in-out infinite, glowPulse 3s infinite alternate;
            margin-bottom: 6px;
            letter-spacing: 2px;
        }
        @keyframes shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes glowPulse { 0% { filter: drop-shadow(0 0 10px rgba(247,183,51,0.3)); } 100% { filter: drop-shadow(0 0 30px rgba(252,74,26,0.6)); } }
        .subtitle { font-size: 1rem; color: #ddd; margin: 5px 0 20px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; opacity: 0.8; }

        .welcome {
            background: linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,100,50,0.05));
            border-radius: 16px;
            padding: 20px 18px;
            margin: 10px 0 25px;
            border-left: 4px solid #f7b733;
            font-size: 1rem;
            line-height: 1.8;
            color: #eee;
            animation: fadeIn 2s ease-in;
        }
        .welcome strong { color: #f7b733; font-weight: 700; }
        .welcome .heart { color: #ff4d4d; display: inline-block; animation: heartbeat 1.2s infinite; }
        @keyframes heartbeat { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.3); } }
        .welcome .sparkle { display: inline-block; animation: sparkle 2s infinite alternate; }
        @keyframes sparkle { 0% { opacity:0.3; transform:scale(0.8) rotate(0deg); } 100% { opacity:1; transform:scale(1.2) rotate(15deg); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        .input-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; text-align: left; }
        .input-group label { font-weight: 600; font-size: 0.9rem; color: #ccc; }
        .input-group input {
            padding: 14px 18px; border-radius: 14px; border: 1px solid #333;
            background: rgba(0,0,0,0.4); color: #fff; font-size: 1rem; outline: none;
            transition: border 0.3s, box-shadow 0.3s;
        }
        .input-group input:focus { border-color: #f7b733; box-shadow: 0 0 30px rgba(247,183,51,0.15); }

        .btn {
            padding: 16px;
            background: linear-gradient(135deg, #f7b733, #fc4a1a);
            color: #fff;
            font-size: 1.1rem;
            font-weight: 700;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            width: 100%;
            letter-spacing: 1px;
            text-transform: uppercase;
            animation: pulseBtn 2.5s infinite;
        }
        @keyframes pulseBtn { 0% { box-shadow: 0 0 0 0 rgba(247,183,51,0.5); } 70% { box-shadow: 0 0 0 15px rgba(247,183,51,0); } 100% { box-shadow: 0 0 0 0 rgba(247,183,51,0); } }
        .btn:hover { transform: scale(1.03); box-shadow: 0 0 40px rgba(247,183,51,0.3); animation: none; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; animation: none; }

        .code-box { background: rgba(0,0,0,0.5); border-radius: 16px; padding: 22px; margin: 20px 0; border: 2px dashed #f7b733; animation: float 5s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        .code { font-size: 3rem; font-weight: bold; letter-spacing: 8px; color: #f7b733; font-family: 'Courier New', monospace; text-shadow: 0 0 20px rgba(247,183,51,0.3); }

        .status { margin-top: 15px; padding: 12px; border-radius: 10px; font-weight: 500; display: none; }
        .status.show { display: block; }
        .status.success { background: #1e7e34; color: #b7ffc7; }
        .status.waiting { background: #7a6a1e; color: #ffefb7; }
        .status.error { background: #7e1e1e; color: #ffb7b7; }

        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #f7b733; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; display: none; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .footer { margin-top: 20px; font-size: 0.75rem; color: #555; }
        .hidden { display: none; }

        .music-container {
            position: fixed;
            bottom: 30px;
            left: 30px;
            z-index: 10;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(10px);
            border-radius: 50px;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            border: 1px solid rgba(255,215,0,0.2);
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        }
        .music-container button {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 4px 6px;
            transition: color 0.2s;
        }
        .music-container button:hover { color: #f7b733; }
        .music-container .track-info {
            font-size: 0.75rem;
            color: #aaa;
            max-width: 150px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .music-container .track-info .current { color: #f7b733; }
        #ytPlayer { display: none; }
        @media (max-width: 600px) {
            .container { padding: 30px 20px; }
            h1 { font-size: 2rem; }
            .code { font-size: 2.2rem; letter-spacing: 4px; }
            .music-container { bottom: 15px; left: 15px; padding: 8px 14px; gap: 8px; }
            .music-container .track-info { max-width: 80px; }
        }
    </style>
</head>
<body>
    <canvas id="particles"></canvas>
    <div id="ytPlayer"></div>
    <div class="music-container">
        <button id="prevBtn" onclick="prevTrack()">⏮</button>
        <button id="playBtn" onclick="togglePlay()">⏸</button>
        <button id="nextBtn" onclick="nextTrack()">⏭</button>
        <div class="track-info">
            <span class="current" id="currentTrack">Loading...</span>
        </div>
        <button id="unmuteBtn" onclick="unmute()" style="font-size:0.9rem;">🔊</button>
    </div>
    <div class="container">
        <h1>✦ R4VEY-MD ✦</h1>
        <div class="subtitle">✨ Pairing Portal ✨</div>
        <div class="welcome">
            <span class="sparkle">🌟</span> Welcome to the <strong>R4VEY-MD Pairing Portal</strong>
            <span class="sparkle">🌟</span><br>
            Made with <span class="heart">❤️</span> by
            <strong>🅡̣̣̣🅰️♈ 🅔̣̣̣🅨̣̣̣</strong><br>
            <span style="font-size:0.9rem; color:#ccc;">
                ✦ Your ultimate WhatsApp pairing experience ✦
            </span>
            <div style="margin-top:6px; font-size:0.8rem; color:#888;">
                <span>✨ Glowing vibes • Royal essence • Boundless connection ✨</span>
            </div>
        </div>
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
            <button class="btn" style="margin-top: 12px; background:#333; animation: none;" onclick="reset()">⟳ New Code</button>
        </div>
        <div class="footer">R4VEY-MD v1.0 • Made with ❤️</div>
    </div>
    <script>
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        let w, h;
        function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
        window.addEventListener('resize', resize);
        resize();
        const particles = [];
        for (let i = 0; i < 200; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: 'rgba(255,215,0,' + (Math.random() * 0.6 + 0.2) + ')'
            });
        }
        function drawParticles() {
            ctx.clearRect(0, 0, w, h);
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > w) p.speedX *= -1;
                if (p.y < 0 || p.y > h) p.speedY *= -1;
            }
            requestAnimationFrame(drawParticles);
        }
        drawParticles();

        let player;
        let currentTrackIndex = 0;
        let isPlaying = false;
        const videoIds = ['ekjEJBHoU-0', 'WgTMeICssXY'];
        const trackTitles = ['White Keys – Dominic Fike', 'Dandelions – Ruth B.'];

        function onYouTubeIframeAPIReady() {
            player = new YT.Player('ytPlayer', {
                height: '0',
                width: '0',
                videoId: videoIds[0],
                playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: videoIds.join(',') },
                events: {
                    onReady: function(event) {
                        document.getElementById('currentTrack').textContent = trackTitles[0];
                        event.target.playVideo();
                        isPlaying = true;
                    },
                    onStateChange: function(event) {
                        if (event.data === YT.PlayerState.ENDED) nextTrack();
                        if (event.data === YT.PlayerState.PLAYING) {
                            isPlaying = true;
                            document.getElementById('playBtn').textContent = '⏸';
                        } else if (event.data === YT.PlayerState.PAUSED) {
                            isPlaying = false;
                            document.getElementById('playBtn').textContent = '▶';
                        }
                    }
                }
            });
        }

        function togglePlay() {
            if (isPlaying) player.pauseVideo();
            else player.playVideo();
        }
        function nextTrack() {
            currentTrackIndex = (currentTrackIndex + 1) % videoIds.length;
            player.loadVideoById(videoIds[currentTrackIndex]);
            document.getElementById('currentTrack').textContent = trackTitles[currentTrackIndex];
            if (!isPlaying) player.playVideo();
        }
        function prevTrack() {
            currentTrackIndex = (currentTrackIndex - 1 + videoIds.length) % videoIds.length;
            player.loadVideoById(videoIds[currentTrackIndex]);
            document.getElementById('currentTrack').textContent = trackTitles[currentTrackIndex];
            if (!isPlaying) player.playVideo();
        }
        function unmute() { player.unMute(); document.getElementById('unmuteBtn').textContent = '🔊'; }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

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
</html>`);
});

// ─── PAIR API ───
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

        globalSock = sock;
        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
                isConnected = true;
                console.log("✅ Connected!");
            }
            if (connection === "close") {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                console.log(`Connection closed: ${statusCode}`);
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

app.get('/status', (req, res) => {
    res.json({ connected: isConnected });
});

app.listen(PORT, () => {
    console.log(`\n🌐 Pairing website running at http://localhost:${PORT}`);
    console.log(`📲 Open this URL in your browser.\n`);
});