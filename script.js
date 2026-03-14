// ============================================================
//   WISHBOT-AI — JAVASCRIPT
//   Simple AI chatbot using fetch to call an AI API
// ============================================================


// ============================
// INSERT YOUR AI API KEY HERE
// ============================
// Steps:
//   1. Get a free API key from https://console.groq.com
//      (or OpenAI: https://platform.openai.com)
//   2. Replace "YOUR_KEY_HERE" below with your actual key
//   3. Save the file and upload to GitHub Pages

const API_KEY = "YOUR_KEY_HERE";

// ============================
// CHOOSE YOUR AI PROVIDER
// ============================
// "groq"   → Free, fast, no credit card (recommended)
// "openai" → Requires OpenAI account

const PROVIDER = "groq";

// ============================
// CHOOSE YOUR AI MODEL
// ============================
// Groq models  : "llama3-8b-8192" or "mixtral-8x7b-32768"
// OpenAI models: "gpt-4o-mini" or "gpt-3.5-turbo"

const MODEL = "llama3-8b-8192";

// ============================
// AI PERSONALITY (optional)
// ============================
// Change this to give WISHBot a different personality

const SYSTEM_PROMPT = "You are WISHBot-AI, a helpful, friendly, and smart AI assistant. Answer clearly and concisely. Use markdown for code when needed.";


// ============================================================
//   DO NOT EDIT BELOW THIS LINE (unless you know what you're doing)
// ============================================================

// API endpoint URLs
const API_URLS = {
  groq:   "https://api.groq.com/openai/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions"
};

// Conversation history (so the AI remembers context)
const history = [];

// Grab DOM elements
const chatWindow = document.getElementById("chat-window");
const userInput  = document.getElementById("user-input");
const sendBtn    = document.getElementById("send-btn");
const statusEl   = document.getElementById("header-status");

// ── AUTO RESIZE TEXTAREA ─────────────────────────────────────────
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

// ── ENTER KEY SENDS MESSAGE ──────────────────────────────────────
userInput.addEventListener("keydown", function (e) {
  // Enter sends, Shift+Enter makes a new line
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── SEND MESSAGE ─────────────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();

  // Do nothing if input is empty
  if (!text) return;

  // Check if API key has been set
  if (API_KEY === "YOUR_KEY_HERE" || API_KEY === "") {
    addMessage("ai", "⚠️ **No API key found!**\n\nOpen `script.js` and replace `YOUR_KEY_HERE` with your actual API key.\n\nGet a free key at **console.groq.com** — no credit card needed!", true);
    return;
  }

  // Clear input and disable button while waiting
  userInput.value = "";
  userInput.style.height = "auto";
  sendBtn.disabled = true;
  setStatus("Thinking...");

  // Show user message in chat
  addMessage("user", text);

  // Add user message to conversation history
  history.push({ role: "user", content: text });

  // Show typing animation
  const typingEl = addTypingIndicator();

  try {
    // ── FETCH REQUEST TO AI API ───────────────────────────────
    // This sends the conversation to the AI and gets a response back
    const response = await fetch(API_URLS[PROVIDER], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This is where your API key is sent for authentication
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          // System message sets the AI personality
          { role: "system", content: SYSTEM_PROMPT },
          // All previous messages for context memory
          ...history
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    // Remove typing animation
    typingEl.remove();

    // Check if the API returned an error
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.error?.message || `Error ${response.status}`;
      throw new Error(msg);
    }

    // Parse the AI response
    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response received.";

    // Add AI reply to conversation history
    history.push({ role: "assistant", content: reply });

    // Keep history to last 20 messages to avoid hitting token limits
    if (history.length > 20) history.splice(0, 2);

    // Show AI reply in chat
    addMessage("ai", reply);
    setStatus("Ready");

  } catch (error) {
    // Remove typing animation on error
    typingEl.remove();

    // Show error message in chat
    addMessage("ai", `❌ **Error:** ${error.message}\n\nCheck your API key and try again.`, true);
    setStatus("Error");
    setTimeout(() => setStatus("Ready"), 3000);
  }

  // Re-enable send button
  sendBtn.disabled = false;
  userInput.focus();
}

// ── ADD MESSAGE TO CHAT ───────────────────────────────────────────
function addMessage(role, text, isError = false) {
  const isAI  = role === "ai";

  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${isAI ? "ai-msg" : "user-msg"}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = isAI ? "W" : "U";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble" + (isError ? " error-bubble" : "");
  bubble.innerHTML = formatText(text);

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatWindow.appendChild(msgDiv);

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return msgDiv;
}

// ── TYPING INDICATOR ─────────────────────────────────────────────
function addTypingIndicator() {
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg ai-msg";

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = "W";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble typing-bubble";
  bubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return msgDiv;
}

// ── FORMAT TEXT (markdown-like) ───────────────────────────────────
function formatText(text) {
  // Code blocks
  text = text.replace(/```[\w]*\n?([\s\S]+?)```/g, "<pre>$1</pre>");
  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Line breaks
  text = text.replace(/\n/g, "<br>");
  return text;
}

// ── UPDATE HEADER STATUS ──────────────────────────────────────────
function setStatus(text) {
  statusEl.innerHTML = `<span class="status-dot"></span> ${text}`;
}
