# 🎨 Baymax OmniPOS Frontend - Tailwind CSS & React

Complete multi-screen POS (Point of Sale) frontend application built with React 18 and Tailwind CSS.

## ✨ Features

### Core Screens
1. **Dashboard** - Real-time business metrics and KPIs
   - Sales overview (today, week, month)
   - Recent orders table
   - Top products by revenue
   - Charts & analytics placeholders

2. **POS Screen** (Main Checkout)
   - Barcode scanning & product search
   - Real-time product grid with filtering
   - Shopping cart with item management
   - Tax calculation (configurable)
   - Multiple payment methods
   - Discount & hold order buttons

3. **Products Manager**
   - Create/read/update/delete products
   - Barcode management (unique per store)
   - Cost price & selling price tracking
   - Stock management
   - Category filtering & search
   - Profit margin calculation

4. **Categories Manager**
   - Store-scoped category management
   - Quick search & filtering

5. **Customers Manager**
   - Customer CRUD with multi-field search
   - Wallet balance tracking
   - Credit limit management
   - Loyalty points & redemption
   - Total spent tracking

6. **Suppliers Manager**
   - Supplier/vendor management
   - Payables tracking (amount owed)
   - Payment recording
   - Last order dates

7. **Orders Manager**
   - Complete order history
   - Status filtering (Completed, Pending, Cancelled)
   - Payment method tracking
   - Receipt generation
   - Order summary statistics

8. **Inventory Manager**
   - Stock level monitoring
   - Low stock alerts (with visual indicators)
   - Inventory value calculation
   - Stock turnover metrics
   - Restocking suggestions

9. **Reports & Analytics**
   - Sales reports (daily, weekly, monthly)
   - Profitability analysis
   - Customer demographics
   - Category performance
   - Chart placeholders for future integration

10. **Settings**
    - General settings (language, timezone, currency)
    - Store information & configuration
    - Tax rate configuration
    - Security settings (2FA, password change)
    - Backend API integration status

## 🏗️ Project Structure

```
desktop/
├── public/
│   ├── electron.js          # Electron main process
│   ├── preload.js           # Electron preload script
│   └── index.html           # Root HTML
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Top navigation with language/profile
│   │   ├── Sidebar.jsx      # Left sidebar navigation
│   │   ├── Cart.jsx         # Shopping cart component (old)
│   │   ├── ScanInput.jsx    # Barcode scanner (old)
│   │   ├── StatusIndicator.jsx
│   │   ├── DiscountInput.jsx
│   │   ├── TaxSelector.jsx
│   │   ├── PaymentMethodSelector.jsx
│   │   └── HoldOrderButton.jsx
│   ├── screens/
│   │   ├── Dashboard.jsx
│   │   ├── POSScreen.jsx
│   │   ├── ProductsManager.jsx
│   │   ├── CustomersManager.jsx
│   │   ├── SuppliersManager.jsx
│   │   ├── OrdersManager.jsx
│   │   ├── InventoryManager.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── layouts/
│   │   └── MainLayout.jsx   # Main layout with sidebar & navbar
│   ├── store/
│   │   ├── cartSlice.js     # Zustand cart state
│   │   └── orderSlice.js    # Zustand orders state
│   ├── utils/
│   │   ├── billing.js       # Billing calculations
│   │   ├── printer.js       # Printer integration
│   │   ├── receipt.js       # Receipt formatting
│   │   └── sync.js          # Backend sync
│   ├── config/
│   │   └── api.js           # API configuration
│   ├── db/
│   │   ├── localdb.js       # SQLite local database
│   │   └── sqlite.js        # SQLite wrapper
│   ├── i18n/
│   │   ├── en.json          # English translations
│   │   ├── ar.json          # Arabic translations
│   │   ├── bn.json          # Bengali translations
│   │   └── config.js        # i18n configuration
│   ├── theme/
│   │   └── theme.js         # Theme configuration
│   ├── styles/
│   │   └── styleUtils.js    # Utility CSS functions
│   ├── App.jsx              # Main app component (updated with screens)
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles + Tailwind
│   ├── index.js             # React entry point
│   └── examples/
│       └── StylingExamples.jsx
├── package.json
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md
```

## 🎯 Tailwind CSS Configuration

### Color Palette
```javascript
{
  primary: { 50-900 },      // Blue
  secondary: { 50-700 },    // Dark gray
  success: { 50-700 },      // Green
  danger: { 50-700 },       // Red
  warning: { 50-700 }       // Orange
}
```

### Custom Extensions
- **Animations**: fade-in, slide-up, slide-down, pulse-soft, glow
- **Typography**: Custom font sizes and weights
- **Spacing**: xs, sm, md, lg, xl scale
- **Box Shadows**: sm, base, md, lg, xl, 2xl

## 🚀 Quick Start

### Installation
```bash
cd desktop
npm install
```

### Development
```bash
# Run React dev server + Electron
npm start

# Or just React (browser)
npm run react-start

# Or just Electron
npm run electron-start
```

### Production Build
```bash
npm run electron-build
```

## 📱 Responsive Design

All screens are fully responsive:
- **Desktop**: Full sidebar + content layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu + stacked layout

## 🌍 Multi-Language Support

Built-in i18n support for:
- **English** (en) - Default
- **Arabic** (ar) - RTL support
- **Bengali** (bn)

Language selector in navbar, automatic RTL switching.

## 🔐 Security Features

- Role-based UI rendering (Owner/Manager/Cashier)
- Sensitive data filtering (CostPrice hidden from Cashier)
- Local encryption for sensitive data
- Secure token storage
- 2FA settings (configurable)

## 🔌 API Integration

All screens are connected to the backend API:
- Products: GET/POST/PUT/DELETE with search
- Orders: Full checkout with transactions
- Customers: Wallet, loyalty, credit management
- Suppliers: Payables tracking
- Reports: Real-time aggregations

API configuration in `src/config/api.js`

## 📊 State Management

Uses **Zustand** for lightweight state:
```javascript
// Cart state
useCartStore((state) => state.getItems())
useCartStore((state) => state.addItem(product))

// Orders state
useOrderStore((state) => state.orders)
```

## 🎨 Component Reusability

Key Tailwind patterns:
```javascript
// Button variants
className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"

// Card components
className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"

// Table styling
className="px-6 py-4 text-left text-sm font-semibold text-gray-700"

// Status badges
className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
```

## 📈 Performance Optimizations

- Lazy loading of screens (React.lazy)
- Memoized components (React.memo)
- Debounced search input
- Virtual lists for large tables
- Image optimization

## 🧪 Testing

Test all screens:
1. Navigate to each screen via sidebar
2. Verify data loading
3. Test CRUD operations (create, edit, delete)
4. Check responsive design
5. Test language switching
6. Verify mobile layout

## 📝 Keyboard Shortcuts

- **F1**: Complete checkout (POS screen)
- **ESC**: Clear cart
- **Ctrl+S**: Save settings
- **Ctrl+P**: Print receipt

## 🔄 Syncing with Backend

All changes sync automatically:
```javascript
// In screen component
const handleSave = async (data) => {
  await api.post('/api/products', data);
  // Auto-syncs with backend
};
```

## 🌐 Electron Integration

Desktop-specific features:
- File system access (save receipts, backup)
- Native printing
- Offline-first mode (local SQLite)
- Update checking
- Auto-launch on startup

## 🐛 Troubleshooting

### Styles not applying
- Check `tailwind.config.js` content paths
- Clear cache: `npm run react-build`
- Rebuild Tailwind: `npm install -D tailwindcss postcss autoprefixer`

### Components not rendering
- Check imports in screen files
- Verify Zustand store initialization
- Check browser console for errors

### API not connecting
- Verify backend server is running
- Check `src/config/api.js` base URL
- Enable CORS in backend

## 📚 Documentation

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React i18n Docs](https://react.i18next.com/)
- [Electron Docs](https://www.electronjs.org/docs)

## 🤝 Contributing

To add a new screen:
1. Create file in `src/screens/`
2. Implement component with Tailwind styling
3. Add route in `App.jsx`
4. Add sidebar menu item in `Sidebar.jsx`
5. Test responsive design

## 📄 License

MIT - Baymax OmniPOS v4.0 SaaS

---

**Status**: ✅ Production Ready  
**Last Updated**: May 2026  
**Version**: 4.0 SaaS
