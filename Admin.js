// ================= LOADER ================= 
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
});

// ================= SCROLL PROGRESS BAR =================
window.addEventListener('scroll', () => {
  const scrollProgress = document.getElementById('scrollProgress');
  const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  scrollProgress.style.width = scrollPercent + '%';
});

// ================= NAVBAR SCROLL EFFECT =================
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ================= SMOOTH SCROLLING FOR NAVIGATION LINKS =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'auto'
      });
    }
  });
});

// ================= ANIMATED COUNTER FOR STATS =================
// Animation disabled - display values directly
const animateCounter = (element) => {
  const target = parseFloat(element.getAttribute('data-target'));
  element.textContent = target + (element.textContent.includes('%') ? '%' : '+');
};

// ================= INTERSECTION OBSERVER FOR STATS ANIMATION =================
// Animation disabled - show stats immediately
const statsSection = document.querySelector('.stats');
if (statsSection) {
  const counters = statsSection.querySelectorAll('[data-target]');
  counters.forEach(counter => animateCounter(counter));
}

// ================= TOAST NOTIFICATION =================
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ================= MOBILE MENU TOGGLE =================
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '100%';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.flexDirection = 'column';
  navLinks.style.background = 'rgba(10, 10, 15, 0.95)';
  navLinks.style.padding = '1rem';
  navLinks.style.borderTop = '1px solid var(--glass-border)';
}

// ================= PARALLAX EFFECT FOR HERO SECTION =================
// Animation disabled
// window.addEventListener('scroll', () => {
//   const scrolled = window.pageYOffset;
//   const heroContent = document.querySelector('.hero-content');
//   if (heroContent) {
//     heroContent.style.transform = 'translateY(' + scrolled * 0.5 + 'px)';
//   }
// });

// ================= ADD HOVER EFFECT TO CARDS =================
// Animation disabled
// document.querySelectorAll('.feature-card, .testimonial-card').forEach(card => {
//   card.addEventListener('mouseenter', function() {
//     this.style.transform = 'translateY(-5px) scale(1.02)';
//   });
//   
//   card.addEventListener('mouseleave', function() {
//     this.style.transform = 'translateY(0) scale(1)';
//   });
// });

// ================= DYNAMIC YEAR IN FOOTER =================
document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();
  const footerYear = document.querySelector('.footer-bottom p');
  if (footerYear) {
    footerYear.textContent = '© ' + year + ' Finance. All rights reserved.';
  }
});

// ================= FINANCE AI CHATBOT ================= 

// ================= TOGGLE ================= 
function toggleChat() {
  const box = document.getElementById("chatBox");
  box.style.display = box.style.display === "flex" ? "none" : "flex";
  if (box.style.display === "flex" && !localStorage.getItem("greeted")) {
    addBotMessage("Hello 👋 Welcome to Finance AI Assistant!");
    localStorage.setItem("greeted", "yes");
  }
}

// ================= THEME ================= 
let darkMode = true;
function toggleTheme() {
  const box = document.getElementById("chatBox");
  darkMode = !darkMode;
  if (darkMode) {
    box.style.background = "rgba(15,15,30,0.98)";
  } else {
    box.style.background = "#ffffff";
  }
}

// ================= CLEAR ================= 
function clearChat() {
  document.getElementById("chatBody").innerHTML = "";
}

// ================= TIME ================= 
function getTime() {
  const d = new Date();
  return d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
}

// ================= 40+ REPLIES - FINANCE SYSTEM ================= 
const replies = {
  "hello": "Hello 👋 Finance Management System mein aapka welcome hai!",
  "hi": "Hi 🚀 How can I help with your finances?",
  "portfolio": "Portfolio management dashboard se manage karein.",
  "investment": "Investment tracking tools available hain.",
  "returns": "Returns analytics real-time dikhega.",
  "risk": "Risk analysis aapke liye calculate karega.",
  "finance": "Ye Finance Management System hai.",
  "account": "Account details dashboard mein visible hain.",
  "balance": "Balance check account section se karein.",
  "transaction": "Transaction history available hai.",
  "transfer": "Transfer option banking section mein hai.",
  "payment": "Payment options available hain.",
  "loan": "Loan details finance section mein milenge.",
  "credit": "Credit score profile mein dikhega.",
  "debit": "Debit details transaction history mein hai.",
  "savings": "Savings goals set karein dashboard se.",
  "investment plan": "Investment planning tools available hain.",
  "analytics": "Analytics reports real-time generate hote hain.",
  "report": "Reports download ke liye ready hain.",
  "budget": "Budget planning feature available hai.",
  "expense": "Expense tracking automated hai.",
  "income": "Income management easy hai.",
  "tax": "Tax calculation automatic hota hai.",
  "support": "Support team 24/7 available hai.",
  "help": "Help section mein guidance milegi.",
  "contact": "Contact us page se reach out karein.",
  "thanks": "Welcome! 😊",
  "bye": "Bye! 👋 Good luck with finances!",
  "what is finance": "Finance management system for portfolio handling.",
  "your name": "I'm Finance AI Assistant 🤖",
  "who made you": "Developed by Siddhartha Gupta 👨‍💻",
  "how to start": "Dashboard se start karein.",
  "features": "Analytics, Reports, Tracking - sab available hai.",
  "security": "256-bit encryption secure hai.",
  "privacy": "Privacy policy available hai.",
  "terms": "Terms & conditions accept karein.",
  "cost": "Pricing page check karein details ke liye.",
  "free trial": "Free trial 30 days available hai.",
  "subscription": "Subscription plans ke liye pricing dekhen.",
  "mobile app": "Mobile app soon launch hoga.",
  "api": "API documentation available hai.",
  "integration": "Third-party integration support hai.",
  "export": "Export reports in PDF/Excel format.",
  "dashboard": "Dashboard ke through sab kuch manage karein.",
  "widget": "Widgets customize karke use karein.",
  "notification": "Notifications real-time milenge.",
  "alert": "Alerts important updates ke liye hain.",
  "default": [
    "Aap mujhse finance related kuch bhi puch sakte hain 😊",
    "Portfolio, investment ya transaction ke baare mein poochiye.",
    "Finance management ke features puchiye.",
    "Main aapki financial planning mein madad kar sakta hoon.",
    "Dashboard explore karke dekhiye features.",
    "Kya aapko analytics report chahiye?",
    "Investment tracking mein help chahiye?",
    "Budget planning start karna chahte hain?",
    "Main humesha aapki madad ke liye ready hoon 🚀"
  ]
};

let lastTopic = null;

function getReply(text) {
  text = text.toLowerCase();
  
  for (let key in replies) {
    if (key !== "default" && text.includes(key)) {
      lastTopic = key;
      return replies[key];
    }
  }

  const arr = replies.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ================= MESSAGE ================= 
function addUserMessage(text) {
  const msg = document.createElement("div");
  msg.className = "msg user";
  msg.innerHTML = text +
    "<div class='time'>" + getTime() +
    "<span class='tick' id='tick'>✔✔</span></div>";
  document.getElementById("chatBody").appendChild(msg);
  scrollBottom();

  setTimeout(() => {
    document.getElementById("tick").style.color = "skyblue";
  }, 1000);
}

function addBotMessage(text) {
  const msg = document.createElement("div");
  msg.className = "msg bot";
  msg.innerHTML = text + "<div class='time'>" + getTime() + "</div>";
  document.getElementById("chatBody").appendChild(msg);
  scrollBottom();
}

// ================= SCROLL ================= 
function scrollBottom() {
  const body = document.getElementById("chatBody");
  body.scrollTop = body.scrollHeight;
}

// ================= SEND ================= 
function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  addUserMessage(text);
  input.value = "";
  setTimeout(() => {
    addBotMessage(getReply(text));
  }, 800);
}

// ================= ENTER KEY ================= 
document.getElementById("chatInput")
  .addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
  });

// ================= VOICE ================= 
function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice not supported in this browser");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.start();
  recognition.onresult = function(event) {
    document.getElementById("chatInput").value =
      event.results[0][0].transcript;
    sendMessage();
  };
}

// ================= TYPING EFFECT ================= 
const text = "Finance Management System";
let i = 0;
let deleting = false;

function type() {
  let el = document.getElementById("typing-text");

  if (!el) return;

  if (!deleting) {
    el.innerHTML = text.substring(0, i);
    i++;

    if (i > text.length) {
      deleting = true;
      setTimeout(type, 1200);
      return;
    }
  } else {
    el.innerHTML = text.substring(0, i);
    i--;

    if (i < 0) {
      deleting = false;
    }
  }

  setTimeout(type, 70);
}

type();
