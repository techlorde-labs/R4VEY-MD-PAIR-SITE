// Theme Toggle Logic
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Request Pairing Code
async function requestPairCode() {
    const phoneInput = document.getElementById('phone');
    const codeBox = document.getElementById('codeBox');
    const submitBtn = document.getElementById('submitBtn');

    const phone = phoneInput.value.trim();

    if (!phone) {
        codeBox.innerText = "Enter Number!";
        codeBox.style.color = "#ff4d4d";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Connecting...";
    codeBox.innerText = "GENERATING...";
    codeBox.style.color = "var(--accent)";

    try {
        const response = await fetch(`/pair?phone=${phone}`);
        const data = await response.json();

        if (data.code) {
            codeBox.innerText = data.code;
            submitBtn.innerText = "Code Received!";
        } else {
            codeBox.innerText = data.error || "Failed!";
            codeBox.style.color = "#ff4d4d";
            submitBtn.innerText = "Try Again";
        }
    } catch (err) {
        codeBox.innerText = "Server Error";
        codeBox.style.color = "#ff4d4d";
        submitBtn.innerText = "Try Again";
    } finally {
        submitBtn.disabled = false;
    }
}

// Copy Code to Clipboard
function copyCode() {
    const codeBox = document.getElementById('codeBox');
    const text = codeBox.innerText;

    if (text && text !== "--- ---" && text !== "GENERATING...") {
        navigator.clipboard.writeText(text);
        alert("Pairing Code copied to clipboard!");
    }
}

// Admin Modal Logic
const adminModal = document.getElementById('adminModal');
const modalOverlay = document.getElementById('modalOverlay');

document.getElementById('adminBtn').addEventListener('click', async () => {
    adminModal.style.display = 'block';
    modalOverlay.style.display = 'block';

    try {
        const res = await fetch('/api/stats');
        const data = await res.json();

        document.getElementById('sysUptime').innerText = data.uptime;
        document.getElementById('sysRam').innerText = `${data.ramUsage} / ${data.totalRam}`;
        document.getElementById('sysSessions').innerText = data.activeSessions;
        document.getElementById('sysPlatform').innerText = `${data.platform} (${data.nodeVersion})`;
    } catch (e) {
        console.error("Failed to load admin stats");
    }
});

function closeAdmin() {
    adminModal.style.display = 'none';
    modalOverlay.style.display = 'none';
}
