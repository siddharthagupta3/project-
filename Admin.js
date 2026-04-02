// Landing Page
window.addEventListener('load', () => {
  setTimeout(() => document.querySelector('.loader')?.classList.add('hidden'), 1000);
});

window.addEventListener('scroll', () => {
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  document.querySelector('.scroll-progress').style.width = (window.scrollY / height * 100) + '%';
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 50);
  
  const hero = document.querySelector('.hero-content');
  if (hero) {
    hero.style.transform = `translateY(${window.scrollY * 0.5}px)`;
    hero.style.opacity = Math.max(1 - window.scrollY / 1000, 0.2);
  }
});

// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Counter animation
function animateCounter(el, target, duration = 2000) {
  let current = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

// Scroll reveal observer
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('stat-number')) {
        animateCounter(entry.target, parseInt(entry.target.textContent));
      }
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.stat-number, .feature-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// Card hover effects
document.querySelectorAll('.feature-card, .testimonial-card').forEach(card => {
  card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.02)');
  card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
});

// Mobile menu toggle
document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
  const nav = document.querySelector('.nav-links');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});

// Update footer year
document.querySelectorAll('.current-year').forEach(el => el.textContent = new Date().getFullYear());

// Chat toggle
document.querySelector('.chat-toggle')?.addEventListener('click', () => {
  const box = document.querySelector('.chat-box');
  if (box) box.style.display = box.style.display === 'none' ? 'flex' : 'none';
});

// Add message
function addMessage(text, isUser) {
  const msg = document.createElement('div');
  msg.className = isUser ? 'msg user' : 'msg bot';
  msg.innerHTML = `<p>${text}</p><div class="time">Just now</div>`;
  const body = document.querySelector('.chat-body');
  if (body) {
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }
}

// Send message
function sendMessage() {
  const input = document.querySelector('#chatInput');
  const text = input.value.trim();
  if (!text) return;
  
  addMessage(text, true);
  input.value = '';
  setTimeout(() => addMessage(getReply(text), false), 500);
}

function getReply(text) {
  const lowerText = text.toLowerCase();
  
  // Greetings
  if (lowerText.match(/hello|hi|hey|greetings/)) {
    return '👋 Hello! Welcome to Finance. How can I help you today?';
  }
  
  // Registration & Account
  if (lowerText.match(/register|signup|create account|new account|join/)) {
    return '📝 To create an account, click "Get Started" on the top right. You\'ll fill in your details and get instant access to our Finance platform!';
  }
  
  // Login & Access
  if (lowerText.match(/login|sign in|password|forgot password/)) {
    return '🔐 Click "Get Started" and switch to the login panel. If you forgot your password, use the "Forgot Password" link on the login form.';
  }
  
  // Features & Capabilities
  if (lowerText.match(/features|what can i do|capabilities|services|tools/)) {
    return '⚡ Finance offers: Transaction Tracking, Financial Analytics, Account Management, User Authentication, and chat support. Explore our Features section above!';
  }
  
  // Finance Dashboard
  if (lowerText.match(/finance|dashboard|transaction|payment|expense|income|budget/)) {
    return '💰 Our Finance Dashboard tracks all transactions! You can add income/expenses, filter by type, search transactions, and view real-time balance updates.';
  }
  
  // About Us
  if (lowerText.match(/about|who are you|finance|company|what is this/)) {
    return '🎓 Finance is a comprehensive Finance Management System designed to streamline financial operations, manage transactions, and enhance administrative efficiency.';
  }
  
  // Contact & Support
  if (lowerText.match(/contact|email|phone|support|help|reach out|question/)) {
    return "📞 You can reach our support team via the Contact form below, or email us at support@finance.com. We're here 24/7!";
  }
  
  // Chat capabilities
  if (lowerText.match(/what can you do|chat|help me|assistance/)) {
    return '🤖 I can help you with: Registration info, Login details, Feature explanations, Finance dashboard guidance, Contact support, and answer general questions!';
  }
  
  // Testimonials
  if (lowerText.match(/review|testimonial|feedback|rating|opinion/)) {
    return '⭐ Check our Testimonials section! See what bank managers, staff, and customers say about their Finance platform experience.';
  }
  
  // Pricing
  if (lowerText.match(/price|cost|plan|payment|subscription|free/)) {
    return '💵 Visit our Pricing section for detailed plans. We offer flexible options suitable for banks of all sizes!';
  }
  
  // Thanks & Politeness
  if (lowerText.match(/thanks|thank you|appreciate|🙏/)) {
    return '😊 You\'re welcome! Happy to help. Is there anything else you\'d like to know?';
  }
  
  // Goodbye
  if (lowerText.match(/bye|goodbye|see you|farewell|exit|close/)) {
    return '👋 Thanks for chatting with us! Feel free to reach out anytime. Have a great day!';
  }
  
  // How are you
  if (lowerText.match(/how are you|how's it going|how do you feel/)) {
    return "😄 I'm doing great, thanks for asking! Ready to help you succeed with our Finance platform!";
  }
  
  // Tech questions
  if (lowerText.match(/voice|mic|record|audio|speak/)) {
    return '🎤 Click the microphone button to use voice input! Speak clearly, and I\'ll convert it to text. It supports multiple languages!';
  }
  
  // Default response with smart suggestions
  const suggestions = [
    'Try asking about "features"',
    'Ask me about "registration"',
    'Tell me about "finance dashboard"',
    'Ask "how to login"',
    'Type "contact" for support'
  ];
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  
  return `🤔 I didn't quite understand that. ${randomSuggestion}, or feel free to ask something else!`;
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Voice recognition not supported in your browser');
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.start();
  recognition.onresult = (e) => {
    document.querySelector('.chat-input').value = e.results[0][0].transcript;
  };
}

// Handle Contact Form Submission
function handleContactForm() {
  const name = document.getElementById('contact-name')?.value;
  const email = document.getElementById('contact-email')?.value;
  const subject = document.getElementById('contact-subject')?.value;
  const message = document.getElementById('contact-message')?.value;
  
  if (name && email && subject && message) {
    // Store in localStorage for demo purposes
    const contact = {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toLocaleString()
    };
    
    let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    showToast('Thank you! We received your message. We will get back to you within 24 hours.');
    
    // Reset form
    document.querySelector('.contact-form').reset();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.querySelector('#chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
});
