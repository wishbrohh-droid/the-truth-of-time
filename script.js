// ============================================================
//   WISHBOT-AI — SCRIPT.JS
// ============================================================


// ============================
// INSERT YOUR API KEY HERE
// ============================
// 1. Get a FREE key from: https://console.groq.com
//    (sign up free, no credit card needed)
// 2. Replace YOUR_KEY_HERE with your actual key
// 3. Save and upload to GitHub Pages

const API_KEY = "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";

// ============================
// AI MODEL (no need to change)
// ============================
// Using Groq's free Llama 3 model — fast and smart

const MODEL = "llama3-8b-8192";

// ============================
// AI PERSONALITY (optional)
// ============================

const SYSTEM_PROMPT = "You are WISHBot-AI, a helpful, friendly, and smart AI assistant. Answer clearly and concisely. Use markdown for code when needed.";


// ============================================================
//   MAIN CODE — DO NOT EDIT BELOW
// ============================================================

const chat    = document.getElementById('chat');
const inp     = document.getElementById('inp');
const sendBtn = document.getElementById('send-btn');
const history = [];

// Auto resize textarea as user types
inp.addEventListener('input', () => {
  inp.style.height = 'auto';
  inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
});

// Enter to send, Shift+Enter for new line
inp.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Suggestion buttons
function sug(el) {
  inp.value = el.textContent;
  sendMessage();
}

// Current time string
function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ── ADD MESSAGE TO CHAT ───────────────────────────────────────
function addMsg(role, html, isError = false) {
  const isBot = role === 'bot';
  const d = document.createElement('div');
  d.className = 'msg' + (isBot ? '' : ' user-msg');
  d.innerHTML = `
    <div class="av ${isBot ? 'av-bot' : 'av-user'}">${isBot ? 'W' : 'U'}</div>
    <div class="mb">
      <div class="mn ${isBot ? 'bot' : 'user'}">${isBot ? 'WISHBot-AI' : 'You'} · ${now()}</div>
      <div class="mt ${isError ? 'error' : ''}">${html}</div>
    </div>`;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

// ── TYPING INDICATOR ─────────────────────────────────────────
function addThinking() {
  const d = document.createElement('div');
  d.className = 'msg';
  d.innerHTML = `
    <div class="av av-bot">W</div>
    <div class="mb">
      <div class="mn bot">WISHBot-AI</div>
      <div class="mt">
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>`;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

// ── FORMAT TEXT (markdown → HTML) ────────────────────────────
function fmt(t) {
  t = t.replace(/```[\w]*\n?([\s\S]+?)```/g, '<pre>$1</pre>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.split('\n\n').map(p =>
    p.trim() ? `<p style="margin-bottom:5px">${p.replace(/\n/g, '<br>')}</p>` : ''
  ).join('');
  return t;
}

// ── SEND MESSAGE ─────────────────────────────────────────────
async function sendMessage() {
  const text = inp.value.trim();
  if (!text || sendBtn.disabled) return;

  // Remove welcome screen on first message
  const welcome = document.getElementById('welcome');
  if (welcome) welcome.remove();

  // Clear input
  inp.value = '';
  inp.style.height = 'auto';
  sendBtn.disabled = true;

  // Show user message
  addMsg('user', text);

  // Check if API key is set
  if (API_KEY === 'YOUR_KEY_HERE' || API_KEY === '') {
    addMsg('bot',
      '⚠️ <strong>No API key set!</strong><br><br>' +
      '1. Open <code>script.js</code><br>' +
      '2. Find <code>const API_KEY = "YOUR_KEY_HERE"</code><br>' +
      '3. Replace with your free Groq key from <strong>console.groq.com</strong>',
      true
    );
    sendBtn.disabled = false;
    return;
  }

  // Add to conversation history
  history.push({ role: 'user', content: text });

  // Show typing dots
  const thinking = addThinking();

  try {
    // ── FETCH REQUEST TO GROQ AI API ─────────────────────────
    // This sends the message to the AI and gets a real response
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`   // ← your key is used here
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history   // send full conversation so AI remembers context
        ]
      })
    });

    // Remove typing dots
    thinking.remove();

    // Handle API errors
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP error ${response.status}`);
    }

    // Get AI reply text
    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response received.';

    // Save reply to history for context memory
    history.push({ role: 'assistant', content: reply });

    // Keep only last 20 messages to avoid token limits
    if (history.length > 20) history.splice(0, 2);

    // Show AI reply in chat
    addMsg('bot', fmt(reply));

  } catch (err) {
    thinking.remove();
    addMsg('bot', `❌ <strong>Error:</strong> ${err.message}<br><br>Check your API key and try again.`, true);
  }

  sendBtn.disabled = false;
  inp.focus();
}
