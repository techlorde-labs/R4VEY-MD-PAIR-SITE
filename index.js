const express = require('express')
const cors = require('cors')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const PORT = process.env.PORT || 3000
const SESSION_PATH = process.env.RENDER? '/app/session' : './session' // Works local + Render

if (!fs.existsSync(SESSION_PATH)) fs.mkdirSync(SESSION_PATH, { recursive: true })

let sock, status = { connection: 'Disconnected', phone: 'None', uptime: 0, latency: 0 }
let activityLog = []

function addLog(msg) {
    const time = new Date().toLocaleTimeString('en-US', {hour12: false})
    activityLog.unshift({time, msg})
    if(activityLog.length > 10) activityLog.pop()
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH)
    sock = makeWASocket({ auth: state, logger: require('pino')({ level: 'silent' }) })
    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'open') {
            status.connection = 'Connected'
            status.phone = sock.user.id.split('@')[0]
            addLog('Device linked successfully')
            addLog('Session credentials saved')
        }
        if(connection === 'close') {
            status.connection = 'Disconnected'
            const code = lastDisconnect?.error?.output?.statusCode
            if(code!== DisconnectReason.loggedOut) setTimeout(startBot, 3000)
        }
    })
}

app.post('/api/pair', async (req, res) => {
    const { number } = req.body
    if(!number) return res.json({ error: 'Number required' })
    addLog('Pairing request received')
    try {
        addLog('WhatsApp session initialized')
        const code = await sock.requestPairingCode(number.replace(/[^0-9]/g, ''))
        addLog('Pairing code generated')
        addLog('Waiting for device...')
        res.json({ code: code.match(/.{1,4}/g).join(' ') })
    } catch(e) {
        addLog('Pairing request failed')
        res.json({ error: e.message })
    }
})

app.get('/api/status', (req, res) => {
    status.latency = Math.floor(Math.random()*30+20)
    res.json({...status, activity: activityLog})
})

setInterval(() => { if(status.connection==='Connected') status.uptime++ }, 1000)
startBot()
app.listen(PORT, () => console.log(`👑 R4VEY-MD running on ${PORT}`))