# Finance Dashboard - Feature Documentation

## 📊 Overview
A professional Finance Dashboard with role-based access, transaction management, and visual analytics.

---

## ✨ Features Implemented

### 1. **Dashboard Overview**
- **Total Balance**: Shows income - expense
- **Total Income**: Sum of all income transactions
- **Total Expense**: Sum of all expense transactions
- Color-coded cards with hover effects

### 2. **Charts & Analytics**
- **Monthly Trend Chart**: Line chart showing balance trend over 6 months
- **Category Distribution**: Doughnut chart showing expense breakdown by category
- Uses Chart.js library for rendering

### 3. **Transaction Management**
Form fields:
- Amount (numeric)
- Category (6 options: Salary, Food, Transport, Utilities, Entertainment, Other)
- Date picker
- Type (Income/Expense)
- Submit & Cancel buttons

### 4. **Search & Filter**
- **Search**: Real-time search by category, date, or amount
- **Filter by Type**: Show all, income only, or expense only
- **Sort Options**:
  - Newest First (default)
  - Oldest First
  - Highest Amount
  - Lowest Amount

### 5. **Transactions Table**
Displays:
- Date
- Category
- Type (with color coding)
- Amount
- Action buttons (Edit/Delete - admin only)

### 6. **Role-Based Access Control**
- **Admin Role**:
  - Can add transactions
  - Can edit transactions
  - Can delete transactions
  - Sees action buttons
  
- **Viewer Role**:
  - Can only view data
  - Cannot add/edit/delete
  - Cannot see action buttons

Role selector dropdown to switch between Admin and Viewer.

### 7. **LocalStorage Persistence**
- All transactions saved to browser localStorage
- Data persists across page refreshes
- Sample data loads if no data exists

---

## 🎨 UI/UX Features
- Glassmorphism design with semi-transparent cards
- Gradient backgrounds and borders
- Smooth animations and transitions
- Hover effects on cards and buttons
- Color-coded transaction types (Green=Income, Red=Expense)
- Responsive grid layouts (mobile, tablet, desktop)
- Professional typography with gradient text

---

## 📱 Responsive Design
- **1024px+**: Full layout with 2-column charts
- **768px-1024px**: Single column layout
- **Mobile**: Optimized for touch, stacked elements

---

## 🔧 Technical Stack
- **Vanilla JavaScript** (no frameworks)
- **Chart.js** (for charts)
- **CSS Grid & Flexbox** (responsive layout)
- **LocalStorage API** (data persistence)
- **HTML5 Semantic** (structure)

---

## 📝 Code Structure

### HTML (`dash.html`)
- Finance dashboard section with:
  - Role selector
  - Stat cards
  - Chart containers
  - Add transaction form
  - Search/filter controls
  - Transactions table

### CSS (`dash.css`)
- Dashboard overview cards
- Chart containers
- Form styling
- Table styling
- Responsive breakpoints
- Animations and transitions

### JavaScript (`dash.js`)
- `initFinanceDashboard()`: Main initialization
- `handleAddTransaction()`: Form submission
- `updateStats()`: Calculate totals
- `updateCharts()`: Render Chart.js
- `filterTransactions()`: Search & filter logic
- `sortTransactions()`: Sort by date/amount
- `editTransaction()`: Load transaction for edit
- `deleteTransaction()`: Remove transaction
- `saveTransactionsToStorage()`: Save to localStorage
- `loadTransactionsFromStorage()`: Load from localStorage

---

## 🚀 Usage

1. **Add Transaction**:
   - Click "+ Add Transaction" button
   - Fill in form fields
   - Click "Add"
   - Form auto-hides and dashboard updates

2. **Search/Filter**:
   - Type in search box for instant results
   - Use filter dropdown for type
   - Use sort dropdown for ordering

3. **Edit Transaction**:
   - Click "Edit" button (admin only)
   - Form populates with data
   - Edit and click "Add" to save
   - Original transaction is replaced

4. **Delete Transaction**:
   - Click "Delete" button (admin only)
   - Confirm deletion
   - Transaction removed and dashboard updates

5. **Switch Role**:
   - Use role selector dropdown
   - UI updates to show/hide admin features
   - Viewer can't perform modifications

---

## 💾 Sample Data
Default transactions loaded on first visit:
- 3000 (Salary - Income)
- 50 (Food - Expense)
- 100 (Transport - Expense)
- 2500 (Salary - Income)
- 75 (Utilities - Expense)

---

## 🎯 Interview-Ready Highlights
✅ Clean, readable code  
✅ Proper separation of concerns  
✅ Role-based access control  
✅ LocalStorage for persistence  
✅ Responsive design  
✅ Chart.js integration  
✅ Form validation  
✅ Real-time updates  
✅ Professional UI/UX  
✅ No external framework dependencies  

---

## 📌 Future Enhancements
- Dark/Light mode toggle
- Export to CSV/JSON
- Budget planning
- Recurring transactions
- Receipt uploads
- Multi-currency support
- Data analytics & insights

---

Made with ❤️ for Interview Excellence
