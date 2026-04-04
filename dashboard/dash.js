// App State / Init
const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NO_DATA_TEXT = {
    bestMonth: 'No data',
    currency: '₹0',
    noIncome: 'No income',
    noExpense: 'No expense'
};

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

function initDashboard() {
    app.init();
    setupEventListeners();
    setupNavigation();
    setupEmailForm();
    setupProfileOverview();
    updateDashboard();
    renderTransactions();
    initCharts();
    applyRoleUI(app.user);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        showStaticGridItems();
    } else {
        startGridAnimation();
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);

// Global Functions for HTML onclick handlers
window.switchRole = switchRole;
window.toggleMenu = toggleMenu;
window.showAddTransactionForm = showAddTransactionForm;
window.hideAddTransactionForm = hideAddTransactionForm;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.exportToCSV = exportToCSV;

// UI Rendering
function applyRoleUI(role) {
    qsa('.role-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });

    qsa('.admin-only').forEach((el) => {
        el.style.display = role === 'admin' ? 'block' : 'none';
    });

    document.body.classList.toggle('admin-mode', role === 'admin');
}

function updateDashboard() {
    const totals = calculateTotals();
    setText(byId('totalBalance'), formatCurrency(totals.balance));
    setText(byId('totalIncome'), formatCurrency(totals.income));
    setText(byId('totalExpenses'), formatCurrency(totals.expenses));

    updateInsights();
    updateCharts();
}

function updateCharts() {
    drawMonthlyChart();
    drawCategoryChart();
}

function createTransactionHTML(transaction) {
    const isIncome = transaction.type === 'income';
    return `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-category">${transaction.category}</div>
                <div class="transaction-description">${transaction.description || 'No description'}</div>
                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
            <div class="transaction-amount">
                <div class="amount-value ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : '-'}₹${transaction.amount.toLocaleString('en-IN')}</div>
                <div class="transaction-type ${isIncome ? 'income' : 'expense'}">${transaction.type}</div>
            </div>
            <div class="transaction-actions admin-only">
                <button class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        </div>
    `;
}

function renderTransactions() {
    const container = byId('transactionsList');
    if (!container) return;

    const search = byId('searchTransaction')?.value.toLowerCase() || '';
    const filter = byId('filterType')?.value || 'all';
    const sort = byId('sortBy')?.value || 'date';

    const filtered = app.transactions.filter((transaction) => {
        const matchesSearch = transaction.category.toLowerCase().includes(search)
            || transaction.description?.toLowerCase().includes(search);
        return matchesSearch && (filter === 'all' || transaction.type === filter);
    });

    filtered.sort((a, b) => {
        if (sort === 'date') return new Date(b.date) - new Date(a.date);
        if (sort === 'amount') return b.amount - a.amount;
        return 0;
    });

    container.innerHTML = filtered.length
        ? filtered.map((transaction) => createTransactionHTML(transaction)).join('')
        : '<p style="text-align: center; color: rgba(255,255,255,0.6);">No transactions found</p>';
}

function setTransactionFormMode(mode) {
    const titleEl = byId('transactionFormTitle');
    const submitBtn = document.querySelector('#transactionForm button[type="submit"]');
    const isEdit = mode === 'edit';

    if (titleEl) titleEl.textContent = isEdit ? 'Edit Transaction' : 'Add New Transaction';
    if (submitBtn) submitBtn.textContent = isEdit ? 'Update Transaction' : 'Add Transaction';
}

function resetTransactionFormState() {
    app.editing = false;
    app.editingId = null;
    setTransactionFormMode('add');
}

function showAddTransactionForm(options = {}) {
    if (app.user !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }

    const { reset = true } = options;
    const formWrapper = byId('addTransactionForm');
    const form = byId('transactionForm');

    if (formWrapper) {
        formWrapper.style.display = 'block';
    }

    if (reset && form) {
        form.reset();
        resetTransactionFormState();
    }
}

function hideAddTransactionForm() {
    const formWrapper = byId('addTransactionForm');
    if (formWrapper) formWrapper.style.display = 'none';
    resetTransactionFormState();
}

function openProfileOverview() {
    const overlay = byId('profileViewOverlay');
    if (!overlay) return;
    overlay.hidden = false;
    overlay.classList.add('active');
}

function closeProfileOverview() {
    const overlay = byId('profileViewOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.hidden = true;
}

function fillProfileOverview() {
    const meta = getProfileMeta();
    const name = safeText(meta.fullName);
    const email = safeText(meta.email);
    const phone = safeText(meta.phone);
    const organization = safeText(meta.organization);

    setText(byId('pvName'), name);
    setText(byId('pvRole'), app.user);
    setText(byId('pvEmail'), email);
    setText(byId('pvPhone'), phone);
    setText(byId('pvOrg'), organization);
    setText(byId('pvCount'), String(app.transactions.length));
}

// Event Handlers
function switchRole(role) {
    app.user = role;
    app.saveStorage();
    applyRoleUI(role);
    renderTransactions();

    if (role !== 'admin') {
        hideAddTransactionForm();
    }

    showNotification(`Switched to ${role} role`, 'success');
}

function handleTransactionSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        amount: parseFloat(formData.get('amount')),
        category: (formData.get('category') || '').trim(),
        date: formData.get('date'),
        type: formData.get('type'),
        description: (formData.get('description') || '').trim()
    };

    if (!Number.isFinite(data.amount) || data.amount <= 0 || !data.category || !data.date || !data.type) {
        showNotification('Fill all required fields', 'error');
        return;
    }

    if (app.editing && app.editingId) {
        updateTransaction(app.editingId, data);
    } else {
        createTransaction(data);
    }

    hideAddTransactionForm();
    event.target.reset();
}

function editTransaction(id) {
    const transaction = app.transactions.find((item) => item.id === id);
    if (!transaction) return;

    app.editing = true;
    app.editingId = id;
    showAddTransactionForm({ reset: false });

    const amountEl = byId('amount');
    const categoryEl = byId('category');
    const dateEl = byId('date');
    const typeEl = byId('type');
    const descriptionEl = byId('description');

    if (amountEl) amountEl.value = transaction.amount;
    if (categoryEl) categoryEl.value = transaction.category;
    if (dateEl) dateEl.value = transaction.date;
    if (typeEl) typeEl.value = transaction.type;
    if (descriptionEl) descriptionEl.value = transaction.description || '';

    setTransactionFormMode('edit');
}

function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    app.transactions = app.transactions.filter((transaction) => transaction.id !== id);
    app.saveStorage();
    renderTransactions();
    updateDashboard();
    showNotification('Transaction deleted', 'success');
}

function saveDashboard() {
    app.saveStorage();
    showNotification('Changes saved', 'success');
}

function exportToCSV() {
    if (app.transactions.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }

    const headers = ['Date', 'Category', 'Description', 'Type', 'Amount'];
    const rows = app.transactions.map((transaction) => [
        transaction.date,
        transaction.category,
        transaction.description || '',
        transaction.type,
        transaction.amount
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    if (typeof window.downloadFile === 'function') {
        window.downloadFile(csv, 'transactions.csv', 'text/csv');
    } else {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'transactions.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    showNotification('Exported to CSV', 'success');
}

function toggleMenu() {
    const menu = byId('menu');
    const hamburger = document.querySelector('.hamburger');
    if (menu) menu.classList.toggle('active');
    if (hamburger) hamburger.classList.toggle('active');
}

function closeMenu() {
    const menu = byId('menu');
    const hamburger = document.querySelector('.hamburger');
    if (menu) menu.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
}

function setupNavigation() {
    const hamburger = byId('hamburgerMenu');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    qsa('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetSelector = link.getAttribute('href');
            const target = targetSelector ? document.querySelector(targetSelector) : null;
            if (target) {
                closeMenu();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    document.addEventListener('click', (event) => {
        const menu = byId('menu');
        const hamburger = document.querySelector('.hamburger');
        if (!menu || !hamburger) return;

        const clickedInsideMenu = menu.contains(event.target);
        const clickedHamburger = hamburger.contains(event.target);
        if (!clickedInsideMenu && !clickedHamburger) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
}

function setupEmailForm() {
    const form = byId('form');
    const emailInput = byId('email-id');
    if (!form || !emailInput) return;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    emailInput.addEventListener('input', function () {
        this.style.outline = emailRegex.test(this.value) ? '2px dotted #76a73f' : '2px dotted #7598f2';
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (emailRegex.test(emailInput.value)) {
            form.innerHTML = '<p style="font-size: 2rem; font-weight: 500; color: #76a73f;">Subscribed! 🎉</p>';
            setTimeout(() => byId('finance')?.scrollIntoView({ behavior: 'smooth' }), 1700);
        } else {
            showNotification('Enter valid email', 'error');
        }
    });

    let index = 0;
    const placeholder = 'example@domain.com';
    function typeEmail() {
        if (index < placeholder.length) {
            emailInput.placeholder += placeholder.charAt(index);
            index += 1;
            setTimeout(typeEmail, 150);
        }
    }
    setTimeout(typeEmail, 1600);
}

function setupProfileOverview() {
    const profileBtn = byId('profileButton');
    const closeBtn = byId('closeProfileView');
    const overlay = byId('profileViewOverlay');

    if (!profileBtn || !overlay) return;

    // Remove upload listener from common.js on dashboard and keep profile click read-only.
    const cleanBtn = profileBtn.cloneNode(true);
    profileBtn.parentNode.replaceChild(cleanBtn, profileBtn);

    cleanBtn.addEventListener('click', () => {
        fillProfileOverview();
        openProfileOverview();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileOverview);
    }

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeProfileOverview();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeProfileOverview();
        }
    });
}

function setupEventListeners() {
    qsa('.role-btn').forEach((btn) => {
        btn.addEventListener('click', () => switchRole(btn.dataset.role));
    });

    const transactionForm = byId('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }

    const addBtn = byId('addTransactionBtn');
    if (addBtn) addBtn.addEventListener('click', showAddTransactionForm);

    const cancelBtn = byId('cancelTransaction');
    if (cancelBtn) cancelBtn.addEventListener('click', hideAddTransactionForm);

    const searchInput = byId('searchTransaction');
    const filterSelect = byId('filterType');
    const sortSelect = byId('sortBy');
    if (searchInput) searchInput.addEventListener('input', renderTransactions);
    if (filterSelect) filterSelect.addEventListener('change', renderTransactions);
    if (sortSelect) sortSelect.addEventListener('change', renderTransactions);

    const exportBtn = byId('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);

    const saveBtn = byId('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveDashboard);
}

// Business Logic
function createTransaction(data) {
    const transaction = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    app.transactions.unshift(transaction);
    app.saveStorage();
    renderTransactions();
    updateDashboard();
    showNotification('Transaction added', 'success');
}

function updateTransaction(id, data) {
    const index = app.transactions.findIndex((transaction) => transaction.id === id);
    if (index === -1) return;

    app.transactions[index] = {
        ...app.transactions[index],
        ...data,
        updatedAt: new Date().toISOString()
    };

    app.saveStorage();
    renderTransactions();
    updateDashboard();
    showNotification('Transaction updated', 'success');
}

function calculateTotals() {
    const totals = { income: 0, expenses: 0, balance: 0 };
    app.transactions.forEach((transaction) => {
        if (transaction.type === 'income') totals.income += transaction.amount;
        else totals.expenses += transaction.amount;
    });
    totals.balance = totals.income - totals.expenses;
    return totals;
}

function updateInsights() {
    const bestMonthEl = byId('bestMonth');
    const bestMonthNetEl = byId('bestMonthNet');
    const topIncomeCategoryEl = byId('topIncomeCategory');
    const topIncomeAmountEl = byId('topIncomeAmount');
    const topExpenseCategoryEl = byId('topExpenseCategory');
    const topExpenseAmountEl = byId('topExpenseAmount');

    if (!bestMonthEl || !bestMonthNetEl || !topIncomeCategoryEl || !topIncomeAmountEl || !topExpenseCategoryEl || !topExpenseAmountEl) {
        return;
    }

    const resetInsightsToEmpty = () => {
        setText(bestMonthEl, NO_DATA_TEXT.bestMonth);
        setText(bestMonthNetEl, NO_DATA_TEXT.currency);
        setText(topIncomeCategoryEl, NO_DATA_TEXT.noIncome);
        setText(topIncomeAmountEl, NO_DATA_TEXT.currency);
        setText(topExpenseCategoryEl, NO_DATA_TEXT.noExpense);
        setText(topExpenseAmountEl, NO_DATA_TEXT.currency);
    };

    const applyTopCategory = (entry, categoryEl, amountEl, emptyLabel) => {
        if (!entry) {
            setText(categoryEl, emptyLabel);
            setText(amountEl, NO_DATA_TEXT.currency);
            return;
        }

        setText(categoryEl, entry[0]);
        setText(amountEl, formatCurrency(entry[1]));
    };

    if (app.transactions.length === 0) {
        resetInsightsToEmpty();
        return;
    }

    const monthly = {};
    const incomeByCategory = {};
    const expenseByCategory = {};

    app.transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        if (Number.isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthly[monthKey]) {
            monthly[monthKey] = {
                income: 0,
                expense: 0,
                label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
            };
        }

        const category = (transaction.category || 'Uncategorized').trim() || 'Uncategorized';
        if (transaction.type === 'income') {
            monthly[monthKey].income += transaction.amount;
            incomeByCategory[category] = (incomeByCategory[category] || 0) + transaction.amount;
        } else {
            monthly[monthKey].expense += transaction.amount;
            expenseByCategory[category] = (expenseByCategory[category] || 0) + transaction.amount;
        }
    });

    const bestMonth = Object.values(monthly).sort((a, b) => (b.income - b.expense) - (a.income - a.expense))[0];
    if (bestMonth) {
        setText(bestMonthEl, bestMonth.label);
        setText(bestMonthNetEl, formatCurrency(bestMonth.income - bestMonth.expense));
    } else {
        setText(bestMonthEl, NO_DATA_TEXT.bestMonth);
        setText(bestMonthNetEl, NO_DATA_TEXT.currency);
    }

    const topIncome = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1])[0];
    applyTopCategory(topIncome, topIncomeCategoryEl, topIncomeAmountEl, NO_DATA_TEXT.noIncome);

    const topExpense = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
    applyTopCategory(topExpense, topExpenseCategoryEl, topExpenseAmountEl, NO_DATA_TEXT.noExpense);
}

function getProfileMeta() {
    const raw = localStorage.getItem('financeProfileMeta');
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
        return {};
    }
}

// Charts
function initCharts() {
    updateCharts();
}

function drawMonthlyChart() {
    const canvas = byId('monthlyChart');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const monthlyData = {};
    app.transactions.forEach((transaction) => {
        const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
        if (transaction.type === 'income') monthlyData[month].income += transaction.amount;
        else monthlyData[month].expense += transaction.amount;
    });

    const months = Object.keys(monthlyData).sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
    const data = months.map((month) => ({
        month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense
    }));

    const width = rect.width;
    const height = rect.height;
    const padding = 50;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (data.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }

    const maxValue = Math.max(...data.map((item) => Math.max(item.income, item.expense)));
    const scale = maxValue > 0 ? chartHeight / maxValue : 0;
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length * 0.4;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i += 1) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        const value = Math.round(maxValue - (maxValue / 5) * i);
        ctx.fillText(`₹${(value / 1000).toFixed(0)}k`, padding - 10, y + 4);
    }

    data.forEach((item, index) => {
        const x = padding + index * (barWidth + barGap) + barGap / 2;

        if (item.income > 0) {
            const incomeHeight = item.income * scale;
            const incomeY = padding + chartHeight - incomeHeight;
            const gradient = ctx.createLinearGradient(0, incomeY, 0, incomeY + incomeHeight);
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.4)');

            ctx.fillStyle = gradient;
            ctx.fillRect(Math.round(x), Math.round(incomeY), Math.round(barWidth / 2 - 2), Math.round(incomeHeight));

            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`₹${(item.income / 1000).toFixed(1)}k`, x + barWidth / 4, incomeY - 5);
        }

        if (item.expense > 0) {
            const expenseHeight = item.expense * scale;
            const expenseY = padding + chartHeight - expenseHeight;
            const gradient = ctx.createLinearGradient(0, expenseY, 0, expenseY + expenseHeight);
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.4)');

            ctx.fillStyle = gradient;
            ctx.fillRect(Math.round(x + barWidth / 2 + 2), Math.round(expenseY), Math.round(barWidth / 2 - 2), Math.round(expenseHeight));

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`₹${(item.expense / 1000).toFixed(1)}k`, x + barWidth * 3 / 4, expenseY - 5);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.month, x + barWidth / 2, height - padding + 20);
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
}

function drawCategoryChart() {
    const canvas = byId('categoryChart');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const categoryData = {};
    app.transactions.forEach((transaction) => {
        if (!categoryData[transaction.category]) categoryData[transaction.category] = 0;
        categoryData[transaction.category] += transaction.amount;
    });

    const data = Object.keys(categoryData).map((category) => ({ category, amount: categoryData[category] }));
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (data.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }

    const colors = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];
    let currentAngle = -Math.PI / 2;

    data.forEach((item, index) => {
        const sliceAngle = (item.amount / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 25);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 25);

        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.category, labelX, labelY);

        const percentage = ((item.amount / total) * 100).toFixed(1);
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`${percentage}%`, labelX, labelY + 15);

        currentAngle += sliceAngle;
    });
}

// Utility Functions
function showNotification(msg, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = msg;
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        zIndex: '10000',
        fontSize: '14px',
        background: { success: '#22c55e', error: '#ef4444', info: '#3b82f6' }[type] || '#3b82f6',
        animation: 'slideIn 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function setText(el, value) {
    if (el) el.textContent = value;
}

function formatCurrency(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `₹${safeValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function safeText(value) {
    return (value && String(value).trim()) ? String(value).trim() : 'Not set';
}

// Animations
function showStaticGridItems() {
    qsa('.users-color-container .item').forEach((item) => {
        item.classList.add('animate');
    });
}

function startGridAnimation() {
    const sequence = [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7];
    const delay = 250;
    const totalCycleTime = sequence.length * delay + 800;
    const repeatDelay = 1500;

    function runAnimationCycle() {
        const items = qsa('.item');
        items.forEach((item) => {
            item.classList.remove('animate');
        });

        sequence.forEach((itemNumber, index) => {
            setTimeout(() => {
                const item = document.querySelector(`.item:nth-child(${itemNumber})`);
                if (item) item.classList.add('animate');
            }, index * delay);
        });

        setTimeout(runAnimationCycle, totalCycleTime + repeatDelay);
    }

    runAnimationCycle();
}