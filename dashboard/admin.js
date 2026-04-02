/**
 * FINANCE DASHBOARD - CLEAN & COMPACT CODE
 */

// State Management
const app = {
    user: 'viewer',
    transactions: [],
    editing: false,
    editingId: null,
    
    init() {
        this.loadStorage();
        if (this.transactions.length === 0) this.addSample();
    },
    
    loadStorage() {
        const data = localStorage.getItem('financeDashboard');
        if (data) {
            const parsed = JSON.parse(data);
            this.user = parsed.user || 'viewer';
            this.transactions = parsed.transactions || [];
        }
    },
    
    addSample() {
        this.transactions = [
            { id: 1, amount: 50000, category: 'Customer Deposits', date: '2024-01-15', type: 'income', description: 'Customer deposit transaction' },
            { id: 2, amount: 15000, category: 'Salaries', date: '2024-01-10', type: 'expense', description: 'Staff salaries' },
            { id: 3, amount: 25000, category: 'Account Fees', date: '2024-01-20', type: 'income', description: 'Account service charges' }
        ];
        this.saveStorage();
    },
    
    saveStorage() {
        localStorage.setItem('financeDashboard', JSON.stringify({ user: this.user, transactions: this.transactions }));
    }
};

// Utility Functions
function showNotification(msg, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = msg;
    Object.assign(notification.style, {
        position: 'fixed', top: '20px', right: '20px', padding: '15px 20px',
        borderRadius: '8px', color: 'white', zIndex: '10000', fontSize: '14px',
        background: { success: '#22c55e', error: '#ef4444', info: '#3b82f6' }[type] || '#3b82f6',
        animation: 'slideIn 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

// Role Management
function switchRole(role) {
    app.user = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });
    
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = role === 'admin' ? 'block' : 'none';
    });
    
    document.body.classList.toggle('admin-mode', role === 'admin');
    showNotification(`Switched to ${role} role`, 'success');
    app.saveStorage();
    renderTransactions();
}

// Transaction CRUD
function createTransaction(data) {
    const transaction = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    app.transactions.unshift(transaction);
    app.saveStorage();
    renderTransactions();
    updateDashboard();
    showNotification('Transaction added', 'success');
}

function updateTransaction(id, data) {
    const index = app.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        app.transactions[index] = { ...app.transactions[index], ...data, updatedAt: new Date().toISOString() };
        app.saveStorage();
        renderTransactions();
        updateDashboard();
        showNotification('Transaction updated', 'success');
    }
}

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        app.transactions = app.transactions.filter(t => t.id !== id);
        app.saveStorage();
        renderTransactions();
        updateDashboard();
        showNotification('Transaction deleted', 'success');
    }
}

// Dashboard Calculations
function calculateTotals() {
    const totals = { income: 0, expenses: 0, balance: 0 };
    app.transactions.forEach(t => {
        if (t.type === 'income') totals.income += t.amount;
        else totals.expenses += t.amount;
    });
    totals.balance = totals.income - totals.expenses;
    return totals;
}

function updateDashboard() {
    const totals = calculateTotals();
    const balanceEl = document.getElementById('totalBalance');
    const incomeEl = document.getElementById('totalIncome');
    const expensesEl = document.getElementById('totalExpenses');
    
    if (balanceEl) balanceEl.textContent = `₹${totals.balance.toLocaleString('en-IN')}`;
    if (incomeEl) incomeEl.textContent = `₹${totals.income.toLocaleString('en-IN')}`;
    if (expensesEl) expensesEl.textContent = `₹${totals.expenses.toLocaleString('en-IN')}`;
}

// Render Transactions
function renderTransactions(filtered = null) {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    const toRender = filtered || app.transactions;
    if (toRender.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No transactions found</p>';
        return;
    }
    
    container.innerHTML = toRender.map(t => `
        <tr>
            <td>${new Date(t.date).toLocaleDateString()}</td>
            <td>${t.category}</td>
            <td>${t.description}</td>
            <td style="color: ${t.type === 'income' ? '#22c55e' : '#ef4444'}">
                ${t.type === 'income' ? '+' : '-'} ₹${t.amount.toLocaleString('en-IN')}
            </td>
            <td>${app.user === 'admin' ? `<button onclick="deleteTransaction(${t.id})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Delete</button>` : '-'}</td>
        </tr>
    `).join('');
}

// Form Handling
function handleTransactionForm(e) {
    if (e) e.preventDefault();
    const form = document.getElementById('transactionForm');
    if (!form) return;
    
    const formData = new FormData(form);
    createTransaction({
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        date: formData.get('date'),
        type: formData.get('type'),
        description: formData.get('description')
    });
    form.reset();
}

// Search & Filter
function searchTransactions() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = app.transactions.filter(t => 
        t.category.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
    );
    renderTransactions(filtered);
}

function filterByType(type) {
    const filtered = type === 'all' ? app.transactions : app.transactions.filter(t => t.type === type);
    renderTransactions(filtered);
}

// Animation & Scroll Reveal
function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('[data-reveal]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Form Validation
function initForm() {
    const form = document.getElementById('subscriptionForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email-id')?.value;
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification(`Subscribed: ${email}`, 'success');
                form.reset();
            } else {
                showNotification('Please enter a valid email', 'error');
            }
        });
    }
}

// Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function initMenuToggle() {
    const toggle = document.querySelector('.hamburger');
    if (toggle) {
        toggle.addEventListener('click', toggleMenu);
    }
}

// Initialize Dashboard
function initDashboard() {
    app.init();
    updateDashboard();
    renderTransactions();
    initScrollReveal();
    initForm();
    initMenuToggle();
}

// Document Ready
document.addEventListener('DOMContentLoaded', initDashboard);
