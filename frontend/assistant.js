const ASSIST_API = 'http://localhost:8000/api/assistant';

document.addEventListener('DOMContentLoaded', () => {
    createAssistantUI();
});

let hasGreeted = false;

function createAssistantUI() {
    // Inject HTML
    const container = document.createElement('div');
    container.id = 'assistant-widget';
    container.innerHTML = `
        <div class="assistant-panel" id="assistPanel">
            <div class="assistant-header">
                <h3>AIP Assistant</h3>
                <button class="close-btn" onclick="toggleAssistant()">✕</button>
            </div>
            <div class="assistant-messages" id="assistMessages"></div>
            <div class="assistant-input">
                <input type="text" id="assistInput" placeholder="Type a message...">
                <button onclick="sendAssistMsg()">➤</button>
            </div>
        </div>
        <div class="assistant-btn" onclick="toggleAssistant()">💬</div>
    `;
    document.body.appendChild(container); // Append to body, not inside other containers

    // Enter key support
    document.getElementById('assistInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendAssistMsg();
    });
}

function toggleAssistant() {
    const panel = document.getElementById('assistPanel');
    panel.classList.toggle('open');

    if (panel.classList.contains('open') && !hasGreeted) {
        addAssistMsg('bot', 'Hi 👋 What can I help you with?');
        hasGreeted = true;
    }
}

async function sendAssistMsg() {
    const input = document.getElementById('assistInput');
    const text = input.value.trim();
    if (!text) return;

    addAssistMsg('user', text);
    input.value = '';

    // Send request
    try {
        const res = await fetch(`${ASSIST_API}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();

        // Add reply directly
        addAssistMsg('bot', data.reply);

    } catch (err) {
        addAssistMsg('bot', "⚠️ Error connecting.");
    }
}

function addAssistMsg(role, text) {
    const container = document.getElementById('assistMessages');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.id = `msg-${Date.now()}`;

    // Simple Markdown Parsing
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
        .replace(/\n\*/g, '<br>•') // Bullets with *
        .replace(/\n-/g, '<br>•')  // Bullets with -
        .replace(/\n/g, '<br>');   // Newlines

    msg.innerHTML = formatted;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg.id;
}
