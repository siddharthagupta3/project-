// 1. App State / Init
// ---------- DOM HELPERS ----------
const byId = (id) => document.getElementById(id);

// ---------- CONFIG ----------
const REDIRECT_DELAY = 1500;

// 2. UI Rendering (dashboard, cards, transactions)
// ---------- Panel Rendering ----------
function showLoginPanel() {
  const loginPanel = byId('loginPanel');
  const registerPanel = byId('registerPanel');
  if (loginPanel) loginPanel.style.display = 'flex';
  if (registerPanel) registerPanel.style.display = 'none';
}

function showRegisterPanel() {
  const loginPanel = byId('loginPanel');
  const registerPanel = byId('registerPanel');
  if (loginPanel) loginPanel.style.display = 'none';
  if (registerPanel) registerPanel.style.display = 'flex';
}

// 3. Event Handlers (buttons, forms, search, filter)
// ---------- Event Handlers ----------
function bindPanelSwitching() {
  byId('showRegister')?.addEventListener('click', (event) => {
    event.preventDefault();
    showRegisterPanel();
  });

  byId('showLogin')?.addEventListener('click', (event) => {
    event.preventDefault();
    showLoginPanel();
  });
}

function bindFormEvents() {
  byId('loginForm')?.addEventListener('submit', handleLogin);
  byId('registerForm')?.addEventListener('submit', handleRegister);
  byId('registerPassword')?.addEventListener('input', checkPasswordStrength);
  byId('confirmPassword')?.addEventListener('input', checkPasswordMatch);
  document.querySelectorAll('.social-btn').forEach((button) => {
    button.addEventListener('click', handleSocialLogin);
  });

  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const fieldId = button.getAttribute('data-toggle-target');
      if (fieldId) togglePassword(fieldId);
    });
  });

  byId('closeSuccessBtn')?.addEventListener('click', closeSuccess);
}

// 4. Business Logic (calculations, insights)
// ---------- Validation Logic ----------
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.length >= 10;
}

function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 6) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
}

// ---------- FEEDBACK COMPONENTS ----------
function showSuccess(message) {
  const success = byId('successMessage');
  const text = byId('successText');
  if (!success || !text) return;

  text.textContent = message;
  success.classList.add('show');
  setTimeout(() => success.classList.remove('show'), 3000);
}

function closeSuccess() {
  const success = byId('successMessage');
  if (success) success.classList.remove('show');
}

function showError(message) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span><button>&times;</button>`;
  error.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; z-index: 1001;';
  error.querySelector('button').onclick = () => error.remove();
  document.body.appendChild(error);
  setTimeout(() => error.remove(), 5000);
}

// ---------- FORM COMPONENTS ----------
function checkPasswordStrength() {
  const pass = byId('registerPassword')?.value || '';
  const strengthMap = {
    weak: { text: 'Weak', color: '#ef4444', width: '33%' },
    medium: { text: 'Medium', color: '#f59e0b', width: '66%' },
    strong: { text: 'Strong', color: '#10b981', width: '100%' }
  };

  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  const level = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  const strength = strengthMap[level];

  const fill = document.querySelector('.strength-fill');
  const text = document.querySelector('.strength-text');
  if (!fill || !text) return;

  fill.style.width = strength.width;
  fill.style.backgroundColor = strength.color;
  text.textContent = strength.text;
  text.style.color = strength.color;
}

function checkPasswordMatch() {
  const pass = byId('registerPassword')?.value || '';
  const confirm = byId('confirmPassword');
  if (!confirm || confirm.value.length === 0) return;
  confirm.style.borderColor = pass === confirm.value ? '#10b981' : '#ef4444';
}

function togglePassword(fieldId) {
  const field = byId(fieldId);
  const icon = field?.nextElementSibling?.querySelector('i');
  if (!field || !icon) return;

  field.type = field.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
}

function restoreSavedLoginEmail() {
  const saved = localStorage.getItem('userEmail');
  if (!saved) return;

  const emailInput = byId('loginEmail');
  const rememberMe = byId('rememberMe');
  if (emailInput) emailInput.value = saved;
  if (rememberMe) rememberMe.checked = true;
}

function attachPhoneFormatter() {
  const phoneInput = byId('phone');
  if (!phoneInput) return;
  phoneInput.addEventListener('input', (event) => {
    event.target.value = formatPhone(event.target.value);
  });
}

// ---------- Form Submit Logic ----------
function saveLoggedInUser(email, firstName = '') {
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', email);
  if (firstName) {
    localStorage.setItem('userFirstName', firstName);
  }
}

function handleLogin(event) {
  event.preventDefault();

  const email = byId('loginEmail')?.value.trim() || '';
  const password = byId('loginPassword')?.value.trim() || '';
  const rememberMe = byId('rememberMe')?.checked;

  if (!validateEmail(email)) return showError('Please enter a valid email');
  if (password.length < 6) return showError('Password must be at least 6 characters');

  if (rememberMe) {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('userEmail', email);
  }

  saveLoggedInUser(email);
  showSuccess('✅ Login successful! Redirecting to dashboard...');
  byId('loginForm')?.reset();
  setTimeout(() => {
    window.location.href = '../dashboard/dash.html';
  }, REDIRECT_DELAY);
}

function handleRegister(event) {
  event.preventDefault();

  const first = byId('firstName')?.value.trim() || '';
  const last = byId('lastName')?.value.trim() || '';
  const email = byId('registerEmail')?.value.trim() || '';
  const phone = byId('phone')?.value.trim() || '';
  const password = byId('registerPassword')?.value || '';
  const confirmPassword = byId('confirmPassword')?.value || '';
  const agreedToTerms = !!byId('agreeTerms')?.checked;

  if (!first || !last) return showError('Please enter your full name');
  if (!validateEmail(email)) return showError('Please enter a valid email');
  if (!validatePhone(phone)) return showError('Please enter a valid phone number');
  if (password.length < 8) return showError('Password must be at least 8 characters');
  if (password !== confirmPassword) return showError('Passwords do not match');
  if (!agreedToTerms) return showError('Please agree to terms');

  saveLoggedInUser(email, first);
  showSuccess('✅ Account created! Redirecting to dashboard...');
  byId('registerForm')?.reset();
  setTimeout(() => {
    window.location.href = '../dashboard/dash.html';
  }, REDIRECT_DELAY);
}

function handleSocialLogin(event) {
  event.preventDefault();
  const button = event.target.closest('button');
  if (!button) return;
  const provider = button.className.split(' ')[1] || 'social';
  showSuccess(`Signing in with ${provider}...`);
}

// 5. Charts (monthly, category)
// ---------- Not used on this page ----------

// 6. Utility Functions
// ---------- Feedback Components ----------
function initAuth() {
  showLoginPanel();
  bindPanelSwitching();
  bindFormEvents();
  restoreSavedLoginEmail();
  attachPhoneFormatter();
}

// 7. Animations (last me)
// ---------- Not used on this page ----------

document.addEventListener('DOMContentLoaded', initAuth);
if (window.history.replaceState) window.history.replaceState(null, null, window.location.href);

// ---------- GLOBAL API (USED BY INLINE HTML ATTRIBUTES) ----------
window.togglePassword = togglePassword;
window.closeSuccess = closeSuccess;
