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

    if (role !== 'admin') {
        hideAddTransactionForm();
    }
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

function formatCurrency(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `₹${safeValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function updateDashboard() {
    const totals = calculateTotals();
    const balanceEl = document.getElementById('totalBalance');
    const incomeEl = document.getElementById('totalIncome');
    const expensesEl = document.getElementById('totalExpenses');
    
    if (balanceEl) balanceEl.textContent = formatCurrency(totals.balance);
    if (incomeEl) incomeEl.textContent = formatCurrency(totals.income);
    if (expensesEl) expensesEl.textContent = formatCurrency(totals.expenses);

    updateInsights();
    updateCharts();
}

function updateCharts() {
    drawMonthlyChart();
    drawCategoryChart();
}

function updateInsights() {
    const bestMonthEl = document.getElementById('bestMonth');
    const bestMonthNetEl = document.getElementById('bestMonthNet');
    const topIncomeCategoryEl = document.getElementById('topIncomeCategory');
    const topIncomeAmountEl = document.getElementById('topIncomeAmount');
    const topExpenseCategoryEl = document.getElementById('topExpenseCategory');
    const topExpenseAmountEl = document.getElementById('topExpenseAmount');

    if (!bestMonthEl || !bestMonthNetEl || !topIncomeCategoryEl || !topIncomeAmountEl || !topExpenseCategoryEl || !topExpenseAmountEl) {
        return;
    }

    if (app.transactions.length === 0) {
        bestMonthEl.textContent = 'No data';
        bestMonthNetEl.textContent = '₹0';
        topIncomeCategoryEl.textContent = 'No income';
        topIncomeAmountEl.textContent = '₹0';
        topExpenseCategoryEl.textContent = 'No expense';
        topExpenseAmountEl.textContent = '₹0';
        return;
    }

    const monthly = {};
    const incomeByCategory = {};
    const expenseByCategory = {};

    app.transactions.forEach(t => {
        const date = new Date(t.date);
        if (Number.isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthly[monthKey]) {
            monthly[monthKey] = {
                income: 0,
                expense: 0,
                label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
            };
        }

        const category = (t.category || 'Uncategorized').trim() || 'Uncategorized';
        if (t.type === 'income') {
            monthly[monthKey].income += t.amount;
            incomeByCategory[category] = (incomeByCategory[category] || 0) + t.amount;
        } else {
            monthly[monthKey].expense += t.amount;
            expenseByCategory[category] = (expenseByCategory[category] || 0) + t.amount;
        }
    });

    const bestMonth = Object.values(monthly).sort((a, b) => (b.income - b.expense) - (a.income - a.expense))[0];
    if (bestMonth) {
        bestMonthEl.textContent = bestMonth.label;
        bestMonthNetEl.textContent = formatCurrency(bestMonth.income - bestMonth.expense);
    } else {
        bestMonthEl.textContent = 'No data';
        bestMonthNetEl.textContent = '₹0';
    }

    const topIncome = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topIncome) {
        topIncomeCategoryEl.textContent = topIncome[0];
        topIncomeAmountEl.textContent = formatCurrency(topIncome[1]);
    } else {
        topIncomeCategoryEl.textContent = 'No income';
        topIncomeAmountEl.textContent = '₹0';
    }

    const topExpense = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topExpense) {
        topExpenseCategoryEl.textContent = topExpense[0];
        topExpenseAmountEl.textContent = formatCurrency(topExpense[1]);
    } else {
        topExpenseCategoryEl.textContent = 'No expense';
        topExpenseAmountEl.textContent = '₹0';
    }
}

// UI Rendering
function renderTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    const search = document.getElementById('searchTransaction')?.value.toLowerCase() || '';
    const filter = document.getElementById('filterType')?.value || 'all';
    const sort = document.getElementById('sortBy')?.value || 'date';
    
    let filtered = app.transactions.filter(t => {
        const matches = t.category.toLowerCase().includes(search) || 
                     t.description?.toLowerCase().includes(search);
        return matches && (filter === 'all' || t.type === filter);
    });
    
    filtered.sort((a, b) => {
        if (sort === 'date') return new Date(b.date) - new Date(a.date);
        if (sort === 'amount') return b.amount - a.amount;
        return 0;
    });
    
    container.innerHTML = filtered.length ? 
        filtered.map(t => createTransactionHTML(t)).join('') :
        '<p style="text-align: center; color: rgba(255,255,255,0.6);">No transactions found</p>';
}

function createTransactionHTML(t) {
    const isIncome = t.type === 'income';
    return `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-category">${t.category}</div>
                <div class="transaction-description">${t.description || 'No description'}</div>
                <div class="transaction-date">${new Date(t.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
            <div class="transaction-amount">
                <div class="amount-value ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}</div>
                <div class="transaction-type ${isIncome ? 'income' : 'expense'}">${t.type}</div>
            </div>
            <div class="transaction-actions admin-only">
                <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        </div>
    `;
}

// Form Handling
function setTransactionFormMode(mode) {
    const titleEl = document.getElementById('transactionFormTitle');
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
    const formWrapper = document.getElementById('addTransactionForm');
    const form = document.getElementById('transactionForm');

    if (formWrapper) {
        formWrapper.style.display = 'block';
    }

    if (reset && form) {
        form.reset();
        resetTransactionFormState();
    }
}

function hideAddTransactionForm() {
    const formWrapper = document.getElementById('addTransactionForm');
    if (formWrapper) formWrapper.style.display = 'none';
    resetTransactionFormState();
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
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
    e.target.reset();
}

function editTransaction(id) {
    const t = app.transactions.find(tr => tr.id === id);
    if (!t) return;

    app.editing = true;
    app.editingId = id;
    showAddTransactionForm({ reset: false });

    const amountEl = document.getElementById('amount');
    const categoryEl = document.getElementById('category');
    const dateEl = document.getElementById('date');
    const typeEl = document.getElementById('type');
    const descriptionEl = document.getElementById('description');

    if (amountEl) amountEl.value = t.amount;
    if (categoryEl) categoryEl.value = t.category;
    if (dateEl) dateEl.value = t.date;
    if (typeEl) typeEl.value = t.type;
    if (descriptionEl) descriptionEl.value = t.description || '';

    setTransactionFormMode('edit');
}

function saveDashboard() {
    app.saveStorage();
    showNotification('Changes saved', 'success');
}

// Charts
function initCharts() {
    updateCharts();
}

function drawMonthlyChart() {
    const canvas = document.getElementById('monthlyChart');
    if (!canvas) return;
    
    // Set proper resolution for crisp display
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    const monthlyData = {};
    
    app.transactions.forEach(t => {
        const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
        if (t.type === 'income') monthlyData[month].income += t.amount;
        else monthlyData[month].expense += t.amount;
    });
    
    // Sort months chronologically
    const months = Object.keys(monthlyData).sort((a, b) => {
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });
    
    const data = months.map(month => ({
        month,
        income: monthlyData[month].income,
        expense: monthlyData[month].expense
    }));
    
    const width = rect.width;
    const height = rect.height;
    const padding = 50;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Enable crisp rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    if (data.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }
    
    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense)));
    const scale = maxValue > 0 ? chartHeight / maxValue : 0;
    
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length * 0.4;
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        const value = Math.round(maxValue - (maxValue / 5) * i);
        ctx.fillText('₹' + (value / 1000).toFixed(0) + 'k', padding - 10, y + 4);
    }
    
    // Draw bars
    data.forEach((d, i) => {
        const x = padding + i * (barWidth + barGap) + barGap / 2;
        
        // Income bar (green)
        if (d.income > 0) {
            const incomeHeight = d.income * scale;
            const incomeY = padding + chartHeight - incomeHeight;
            
            // Sharp gradient fill
            const gradient = ctx.createLinearGradient(0, incomeY, 0, incomeY + incomeHeight);
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.4)');
            
            ctx.fillStyle = gradient;
            // Use sharp rectangles
            ctx.fillRect(Math.round(x), Math.round(incomeY), Math.round(barWidth / 2 - 2), Math.round(incomeHeight));
            
            // Crisp value label
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('₹' + (d.income / 1000).toFixed(1) + 'k', x + barWidth / 4, incomeY - 5);
        }
        
        // Expense bar (red)
        if (d.expense > 0) {
            const expenseHeight = d.expense * scale;
            const expenseY = padding + chartHeight - expenseHeight;
            
            // Sharp gradient fill
            const gradient = ctx.createLinearGradient(0, expenseY, 0, expenseY + expenseHeight);
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.4)');
            
            ctx.fillStyle = gradient;
            // Use sharp rectangles
            ctx.fillRect(Math.round(x + barWidth / 2 + 2), Math.round(expenseY), Math.round(barWidth / 2 - 2), Math.round(expenseHeight));
            
            // Crisp value label
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('₹' + (d.expense / 1000).toFixed(1) + 'k', x + barWidth * 3/4, expenseY - 5);
        }
        
        // X-axis label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.month, x + barWidth / 2, height - padding + 20);
    });
    
    // Draw axes
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
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    // Set proper resolution for crisp display
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    const categoryData = {};
    
    app.transactions.forEach(t => {
        if (!categoryData[t.category]) categoryData[t.category] = 0;
        categoryData[t.category] += t.amount;
    });
    
    const data = Object.keys(categoryData).map(cat => ({ category: cat, amount: categoryData[cat] }));
    const total = data.reduce((sum, cat) => sum + cat.amount, 0);
    
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Enable crisp rendering
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
    
    data.forEach((cat, i) => {
        const sliceAngle = (cat.amount / total) * Math.PI * 2;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        // Draw border for crispness
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 25);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 25);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cat.category, labelX, labelY);
        
        // Draw percentage
        const percentage = ((cat.amount / total) * 100).toFixed(1);
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(percentage + '%', labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
}

// Navigation
function toggleMenu() {
    const menu = document.getElementById('menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (menu) menu.classList.toggle('active');
    if (hamburger) hamburger.classList.toggle('active');
}

function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                document.getElementById('menu')?.classList.remove('active');
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Email Form
function setupEmailForm() {
    const form = document.getElementById('form');
    const emailInput = document.getElementById('email-id');
    
    if (!form || !emailInput) return;
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    emailInput.addEventListener('input', function() {
        this.style.outline = emailRegex.test(this.value) ? '2px dotted #76a73f' : '2px dotted #7598f2';
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (emailRegex.test(emailInput.value)) {
            form.innerHTML = '<p style="font-size: 2rem; font-weight: 500; color: #76a73f;">Subscribed! 🎉</p>';
            setTimeout(() => document.getElementById('finance')?.scrollIntoView({ behavior: 'smooth' }), 1700);
        } else {
            showNotification('Enter valid email', 'error');
        }
    });
    
    // Typing animation
    let i = 0;
    const placeholder = "example@domain.com";
    function typeEmail() {
        if (i < placeholder.length) {
            emailInput.placeholder += placeholder.charAt(i);
            i++;
            setTimeout(typeEmail, 150);
        }
    }
    setTimeout(typeEmail, 1600);
}

// Event Listeners
function setupEventListeners() {
    // Role switching
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', () => switchRole(btn.dataset.role));
    });
    
    // Transaction form
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }
    
    // Add transaction button
    const addBtn = document.getElementById('addTransactionBtn');
    if (addBtn) {
        addBtn.addEventListener('click', showAddTransactionForm);
    }
    
    // Cancel transaction button
    const cancelBtn = document.getElementById('cancelTransaction');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideAddTransactionForm);
    }
    
    // Search and filters
    const searchInput = document.getElementById('searchTransaction');
    const filterSelect = document.getElementById('filterType');
    const sortSelect = document.getElementById('sortBy');
    
    if (searchInput) searchInput.addEventListener('input', renderTransactions);
    if (filterSelect) filterSelect.addEventListener('change', renderTransactions);
    if (sortSelect) sortSelect.addEventListener('change', renderTransactions);
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }

    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDashboard);
    }
}

// Export Functions
function exportToCSV() {
    if (app.transactions.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
    const headers = ['Date', 'Category', 'Description', 'Type', 'Amount'];
    const rows = app.transactions.map(t => [t.date, t.category, t.description || '', t.type, t.amount]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    downloadFile(csv, 'transactions.csv', 'text/csv');
    showNotification('Exported to CSV', 'success');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Initialize App
function initDashboard() {
    app.init();
    setupEventListeners();
    setupNavigation();
    setupEmailForm();
    updateDashboard();
    renderTransactions();
    initCharts();

    // Restore UI state
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === app.user);
    });
    document.body.classList.toggle('admin-mode', app.user === 'admin');

    // Start grid animation
    startGridAnimation();
}

// Grid Animation Sequence
function startGridAnimation() {
    // Define the exact sequence as per requirements
    const sequence = [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7];
    const delay = 250; // 0.25s delay between items
    const totalCycleTime = sequence.length * delay + 800; // Add animation duration
    const repeatDelay = 1500; // 1.5 seconds delay before repeat
    
    function runAnimationCycle() {
        // Get all items
        const items = document.querySelectorAll('.item');
        
        // Reset all items first
        items.forEach(item => {
            item.classList.remove('animate');
        });
        
        // Animate items in sequence
        sequence.forEach((itemNumber, index) => {
            setTimeout(() => {
                const item = document.querySelector(`.item:nth-child(${itemNumber})`);
                if (item) {
                    item.classList.add('animate');
                }
            }, index * delay);
        });
        
        // Schedule next cycle
        setTimeout(runAnimationCycle, totalCycleTime + repeatDelay);
    }
    
    // Start the first cycle
    runAnimationCycle();
}

// Start App
document.addEventListener('DOMContentLoaded', initDashboard);

// Global Functions for HTML onclick handlers
window.switchRole = switchRole;
window.toggleMenu = toggleMenu;
window.showAddTransactionForm = showAddTransactionForm;
window.hideAddTransactionForm = hideAddTransactionForm;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.exportToCSV = exportToCSV;