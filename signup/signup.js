const byId = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', initAuth);

function initAuth() {
  showLoginPanel();

  byId('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterPanel();
  });

  byId('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPanel();
  });

  byId('loginForm')?.addEventListener('submit', handleLogin);
  byId('registerForm')?.addEventListener('submit', handleRegister);
  byId('registerPassword')?.addEventListener('input', checkPasswordStrength);
  byId('confirmPassword')?.addEventListener('input', checkPasswordMatch);
  document.querySelectorAll('.social-btn').forEach(btn => btn.addEventListener('click', handleSocialLogin));

  // Restore saved login email if available
  const saved = localStorage.getItem('userEmail');
  if (saved) {
    const emailInput = byId('loginEmail');
    const remember = byId('rememberMe');
    if (emailInput) emailInput.value = saved;
    if (remember) remember.checked = true;
  }

  // Format phone input as XXX-XXX-XXXX
  const phoneInput = byId('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 6) value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
      else if (value.length > 3) value = value.slice(0, 3) + '-' + value.slice(3);
      e.target.value = value;
    });
  }
}

function showLoginPanel() {
  byId('loginPanel').style.display = 'flex';
  byId('registerPanel').style.display = 'none';
}

function showRegisterPanel() {
  byId('loginPanel').style.display = 'none';
  byId('registerPanel').style.display = 'flex';
}

function handleLogin(e) {
  e.preventDefault();
  const email = byId('loginEmail').value.trim();
  const password = byId('loginPassword').value.trim();
  
  if (!validateEmail(email)) return showError('Please enter a valid email');
  if (password.length < 6) return showError('Password must be at least 6 characters');
  
  if (byId('rememberMe').checked) {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('userEmail', email);
  }
  
  // Set user logged in flag
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', email);
  
  showSuccess('✅ Login successful! Redirecting to dashboard...');
  byId('loginForm').reset();
  
  // Redirect to dashboard after 1.5 seconds
  setTimeout(() => {
    window.location.href = '../dashboard/dash.html';
  }, 1500);
}

function handleRegister(e) {
  e.preventDefault();
  const first = byId('firstName').value.trim();
  const last = byId('lastName').value.trim();
  const email = byId('registerEmail').value.trim();
  const phone = byId('phone').value.trim();
  const pass = byId('registerPassword').value;
  const confirm = byId('confirmPassword').value;
  const agree = byId('agreeTerms').checked;
  
  if (!first || !last) return showError('Please enter your full name');
  if (!validateEmail(email)) return showError('Please enter a valid email');
  if (!validatePhone(phone)) return showError('Please enter a valid phone number');
  if (pass.length < 8) return showError('Password must be at least 8 characters');
  if (pass !== confirm) return showError('Passwords do not match');
  if (!agree) return showError('Please agree to terms');
  
  // Set user logged in flag
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', email);
  localStorage.setItem('userFirstName', first);
  
  showSuccess('✅ Account created! Redirecting to dashboard...');
  byId('registerForm').reset();
  
  // Redirect to dashboard after 1.5 seconds
  setTimeout(() => {
    window.location.href = '../dashboard/dash.html';
  }, 1500);
}

function handleSocialLogin(e) {
  e.preventDefault();
  const provider = e.target.closest('button').className.split(' ')[1];
  showSuccess(`Signing in with ${provider}...`);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.length >= 10;
}

function checkPasswordStrength() {
  const pass = byId('registerPassword').value;
  const strength = {
    weak: { text: 'Weak', color: '#ef4444', width: '33%' },
    medium: { text: 'Medium', color: '#f59e0b', width: '66%' },
    strong: { text: 'Strong', color: '#10b981', width: '100%' }
  };
  
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  
  const level = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  const info = strength[level];
  
  const fill = document.querySelector('.strength-fill');
  const text = document.querySelector('.strength-text');
  if (fill && text) {
    fill.style.width = info.width;
    fill.style.backgroundColor = info.color;
    text.textContent = info.text;
    text.style.color = info.color;
  }
}

function checkPasswordMatch() {
  const pass = byId('registerPassword').value;
  const confirm = byId('confirmPassword');
  
  if (confirm.value.length > 0) {
    confirm.style.borderColor = pass === confirm.value ? '#10b981' : '#ef4444';
  }
}

function togglePassword(fieldId) {
  const field = byId(fieldId);
  const icon = field?.nextElementSibling?.querySelector('i');
  if (field && icon) {
    field.type = field.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  }
}

function showSuccess(message) {
  const success = byId('successMessage');
  if (success) {
    byId('successText').textContent = message;
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 3000);
  }
}

function showError(message) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span><button>&times;</button>`;
  error.style.cssText = `position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; z-index: 1001;`;
  error.querySelector('button').onclick = () => error.remove();
  document.body.appendChild(error);
  setTimeout(() => error.remove(), 5000);
}

if (window.history.replaceState) window.history.replaceState(null, null, window.location.href);
