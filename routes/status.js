const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs-extra');
const path = require('path');

router.get('/stats', async (req, res) => {
    try {
        const sessionsDir = path.join(__dirname, '../sessions');
        let activeSessions = 0;

        if (await fs.pathExists(sessionsDir)) {
            const files = await fs.readdir(sessionsDir);
            activeSessions = files.length;
        }

        const uptimeSec = Math.floor(process.uptime());
        const hours = Math.floor(uptimeSec / 3600);
        const minutes = Math.floor((uptimeSec % 3600) / 60);
        const seconds = uptimeSec % 60;

        res.json({
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            ramUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            totalRam: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            activeSessions: activeSessions,
            platform: os.platform(),
            nodeVersion: process.version
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to load system metrics." });
    }
});

module.exports = router;
