const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const { generateSessionId } = require('../utils/sessionId');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

router.get('/', async (req, res) => {
    let num = req.query.phone;

    if (!num) {
        return res.status(400).json({ error: "Phone number is required." });
    }

    // Clean phone number input (digits only)
    num = num.replace(/[^0-9]/g, '');
    if (num.length < 10) {
        return res.status(400).json({ error: "Invalid phone number format." });
    }

    const sessionFolder = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const sessionDir = path.join(__dirname, `../sessions/${sessionFolder}`);

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const socket = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: Browsers.ubuntu("Chrome")
        });

        // Request 8-digit pairing code
        if (!socket.authState.creds.registered) {
            await delay(1500);
            const code = await socket.requestPairingCode(num);
            
            // Format code into 4-character chunks (e.g. ABCD-1234)
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;

            if (!res.headersSent) {
                res.json({ code: formattedCode });
            }
        }

        socket.ev.on('creds.update', saveCreds);

        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                await delay(3000);

                // Generate Base64 Session ID
                const sessionId = await generateSessionId(sessionDir);

                if (sessionId) {
                    const userJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';

                    // Send session message directly to user's chat
                    const successMessage = `✨ *R4VEY-MD PAIRING SUCCESSFUL* ✨\n\n` +
                        `🔑 *Your Session ID:* \n\`\`\`${sessionId}\`\`\`\n\n` +
                        `⚠️ *Note:* Keep this key safe and do not share it with anyone!`;

                    await socket.sendMessage(userJid, { text: successMessage });
                }

                await delay(2000);
                await socket.logout();
                await fs.remove(sessionDir);

            } else if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode === 401) {
                    await fs.remove(sessionDir);
                }
            }
        });

    } catch (err) {
        console.error("Pairing Error:", err);
        await fs.remove(sessionDir);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate pairing code." });
        }
    }
});

module.exports = router;
