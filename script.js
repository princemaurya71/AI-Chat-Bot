const chatMessages = document.querySelector("#chatMessages");
const chatForm = document.querySelector("#chatForm");
const messageInput = document.querySelector("#messageInput");
const clearChat = document.querySelector("#clearChat");
const themeToggle = document.querySelector("#themeToggle");

const starterMessages = [
  {
    role: "bot",
    text: "Hello! How can I help you today?",
  },
  // {
  //   role: "user",
  //   text: "Give me information of this platform?",
  // },
  // {
  //   role: "bot",
  //   text: "Aichatter is a polished chatbot landing interface with a responsive layout, animated replies, theme switching, auto-scrolling conversations, and a ready API integration point for your own bot service.",
  // },
  // {
  //   role: "user",
  //   text: "How does it work?",
  // },
];

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("aichatter-theme", theme);

  const icon = theme === "light" ? "moon" : "sun";
  themeToggle.innerHTML = `<i data-lucide="${icon}"></i>`;
  initIcons();
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem("aichatter-theme");
  if (savedTheme) return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  });
}

function createAvatar(role) {
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerHTML = `<i data-lucide="${
    role === "user" ? "user" : "bot"
  }"></i>`;
  return avatar;
}

function appendMessage(role, text) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const avatar = createAvatar(role);
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.append(avatar, bubble);
  chatMessages.appendChild(row);
  initIcons();
  scrollToBottom();
  return row;
}

function appendTyping() {
  const row = document.createElement("div");
  row.className = "message-row bot";
  row.dataset.typing = "true";
  row.appendChild(createAvatar("bot"));

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML =
    '<span class="typing"><span></span><span></span><span></span></span>';
  row.appendChild(bubble);

  chatMessages.appendChild(row);
  initIcons();
  scrollToBottom();
  return row;
}

function typeReply(text) {
  const row = document.createElement("div");
  row.className = "message-row bot";
  row.appendChild(createAvatar("bot"));

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  initIcons();

  let index = 0;
  const speed = Math.max(8, Math.min(26, 900 / text.length));

  const interval = window.setInterval(() => {
    bubble.textContent = text.slice(0, index + 1);
    index += 1;
    scrollToBottom();

    if (index >= text.length) {
      window.clearInterval(interval);
    }
  }, speed);
}

// async function getBotReply(userMessage) {

//     // Add your chatbot API here.

//     Example:
//     const response = await fetch("YOUR_CHATBOT_API_URL", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": "Bearer YOUR_API_KEY"
//       },
//       body: JSON.stringify({ message: userMessage })
//     });
//     const data = await response.json();
//     return data.reply;
  

//   await new Promise((resolve) => window.setTimeout(resolve, 900));
//   return `I received: "${userMessage}". Connect your bot API inside getBotReply() and this area will show the live assistant response with the same animation.`;
// }

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual API key
const GEMINI_MODEL = "gemini-2.5-flash";

async function getBotReply(userMessage) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    return "Gemini API error. Please check your API key, model name, or billing/settings.";
  }

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Gemini did not return a text reply."
  );
}

async function handleSubmit(event) {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  messageInput.value = "";
  messageInput.focus();

  const typingRow = appendTyping();

  try {
    const reply = await getBotReply(message);
    typingRow.remove();
    typeReply(reply || "I could not find a reply from the chatbot API.");
  } catch (error) {
    typingRow.remove();
    typeReply(
      "The chatbot API did not respond. Please check your endpoint, API key, and response format."
    );
    console.error(error);
  }
}

function resetChat() {
  chatMessages.innerHTML = "";
  starterMessages.forEach((message) =>
    appendMessage(message.role, message.text)
  );
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme || "dark";
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

chatForm.addEventListener("submit", handleSubmit);
clearChat.addEventListener("click", resetChat);

setTheme(getInitialTheme());
resetChat();
initIcons();

// Footer

const backToTopBtn = document.querySelector("#backToTop");
const footerNewsletter = document.querySelector(".footer-newsletter");

if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

if (footerNewsletter) {
  footerNewsletter.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = footerNewsletter.querySelector("input");
    const email = input.value.trim();

    if (!email) return;

    input.value = "";
    input.placeholder = "Subscribed successfully";
  });
}

if (window.lucide) {
  window.lucide.createIcons();
}