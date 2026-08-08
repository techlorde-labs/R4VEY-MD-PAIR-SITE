const fs = require('fs-extra');
const path = require('path');

/**
 * Encodes creds.json into a single R4VEY~ Base64 string
 */
async function generateSessionId(sessionDir) {
    try {
        const credsPath = path.join(sessionDir, 'creds.json');
        if (!fs.existsSync(credsPath)) return null;

        const credsData = await fs.readJson(credsPath);
        const jsonString = JSON.stringify(credsData);
        const base64String = Buffer.from(jsonString).toString('base64');

        return `R4VEY~${base64String}`;
    } catch (error) {
        console.error('[SESSION ERROR]', error);
        return null;
    }
}

module.exports = { generateSessionId };
