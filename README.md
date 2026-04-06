# 🛒 Baymax OmniPOS - MERN Stack Grocery POS System

A **desktop-based (Electron) + web-based** point-of-sale system built with **MERN Stack** for grocery and retail stores. Designed for **offline-first** operations with automatic sync to cloud when online.

## 📋 Project Overview

**Baymax OmniPOS** is an enterprise-grade POS system featuring:
- ✅ **Core POS**: Barcode scanning → Cart management → Fast checkout
- ✅ **Offline-First**: Local SQLite database with automatic cloud sync
- ✅ **Multi-Language**: English 🇬🇧 and Bengali 🇧🇩 from day 1
- ✅ **Desktop + Mobile Ready**: Built with Electron (Desktop) + React Native (Mobile - v2)
- ✅ **Battery Efficient**: Optimized for retail environments

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│              FRONTEND                       │
│  Desktop (React + Electron) -> .exe file    │
│  Mobile (React Native) -> APK [v2]          │
│  Web QR Viewer [v2]                         │
└──────────────────────────┬──────────────────┘
                           ↓ API Calls (REST)
┌─────────────────────────────────────────────┐
│              BACKEND                        │
│  Node.js + Express + JWT Auth               │
│  REST API Endpoints                         │
└──────────────────────────┬──────────────────┘
                           ↓
┌─────────────────────────────────────────────┐
│              DATABASE                       │
│  MongoDB Atlas (Cloud)                      │
│  SQLite (Local - Desktop Only)              │
└─────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
baymax/
├── backend/                          # Node.js + Express API
│   ├── config/
│   │   └── db.js                     # MongoDB connection setup
│   ├── models/
│   │   ├── Product.js                # Mongoose schema for products
│   │   ├── Order.js                  # Mongoose schema for orders
│   │   └── User.js                   # Mongoose schema for users
│   ├── routes/                       # API route handlers [TODO: Phase 5]
│   ├── controllers/                  # Business logic [TODO: Phase 5]
│   ├── middleware/
│   │   └── auth.js                   # JWT verification & role checks
│   ├── utils/
│   │   └── helpers.js                # Utility functions
│   ├── server.js                     # Express app entry point
│   ├── package.json
│   └── .env.example                  # Environment variables template
│
├── desktop/                          # Electron + React Desktop App
│   ├── public/
│   │   ├── electron.js               # Electron main process
│   │   ├── preload.js                # IPC bridge (security)
│   │   └── index.html                # HTML entry point
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScanInput.jsx         # [Phase 3] Barcode scanner
│   │   │   ├── Cart.jsx              # [Phase 3] Shopping cart display
│   │   │   └── CheckoutModal.jsx     # [Phase 4] Checkout form
│   │   ├── db/
│   │   │   └── sqlite.js             # [Phase 2] Local database
│   │   ├── store/
│   │   │   └── cartSlice.js          # Zustand state management
│   │   ├── utils/
│   │   │   ├── sync.js               # [Phase 2] Online/Offline sync
│   │   │   ├── billing.js            # [Phase 4] Discount/Tax logic
│   │   │   ├── receipt.js            # [Phase 4] Receipt formatting
│   │   │   └── printer.js            # [Phase 4] Print integration
│   │   ├── config/
│   │   │   └── api.js                # Axios client + interceptors
│   │   ├── i18n/
│   │   │   ├── config.js             # i18next configuration
│   │   │   ├── en.json               # English translations
│   │   │   └── bn.json               # Bengali translations
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ (LTS recommended)
- **MongoDB Atlas** account (free tier available at mongodb.com)
- **npm** or **yarn**

### 1️⃣ Setup Backend

```bash
cd backend
cp .env.example .env

# Edit .env with your MongoDB connection string
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/baymax

npm install
npm run dev      # Starts at http://localhost:5000
```

✅ **Verify**: Visit http://localhost:5000/health → Should see `{ "status": "Backend is running", ... }`

### 2️⃣ Setup Desktop App

```bash
cd desktop
cp .env.example .env

# Edit .env (optional - defaults to localhost:5000)
# REACT_APP_API_URL=http://localhost:5000

npm install
npm start        # Runs React dev server at http://localhost:3000
                 # Electron window opens automatically
```

✅ **Verify**: React app loads → Scan input visible → Language toggle works

---

## 🔑 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI components |
| **State Management** | Zustand | Cart & order state |
| **Translations** | i18next | i18n (English + Bengali) |
| **Desktop** | Electron 26 | `.exe` packaging |
| **Backend** | Express.js | REST API |
| **Database** (Cloud) | MongoDB Atlas | Order & product storage |
| **Database** (Local) | SQLite | Offline-first support |
| **Auth** | JWT (jsonwebtoken) | Secure API access |
| **Validation** | Joi | Input validation |

---

## 📊 Development Phases (21 Days)

### ✅ Phase 1: Project Scaffold (Days 1-3) — **COMPLETED**
- [x] Create folder structure
- [x] Backend: Express + MongoDB models (Product, Order, User)
- [x] Desktop: React + Electron boilerplate
- [x] i18n setup (English + Bengali)
- [x] Environment files

### 🔄 Phase 2: Offline-First Data Layer (Days 4-6)
- [ ] SQLite initialization (better-sqlite3)
- [ ] Sync service (detect online/offline)
- [ ] Queue mechanism for offline orders
- [ ] MongoDB schema validation

### ⏳ Phase 3: Core POS UI (Days 7-10)
- [ ] Scan input component (barcode reader)
- [ ] Cart display (product list + remove)
- [ ] Qty adjustment
- [ ] Language toggle
- [ ] Running total calculation

### ⏳ Phase 4: Billing & Receipt (Days 11-14)
- [ ] Checkout modal
- [ ] Discount/Tax logic
- [ ] Receipt generation
- [ ] Receipt printing (silent print)
- [ ] Order persistence

### ⏳ Phase 5: Backend API (Days 15-17)
- [ ] Product endpoints (GET, POST, PUT)
- [ ] Order endpoints (POST, GET)
- [ ] User & Auth endpoints
- [ ] Stock sync endpoint
- [ ] Endpoint testing (Postman)

### ⏳ Phase 6: E2E Integration & Testing (Days 18-19)
- [ ] Full offline-to-sync flow
- [ ] Error handling
- [ ] Edge case testing

### ⏳ Phase 7: Deployment (Days 20-21)
- [ ] Desktop app build (.exe)
- [ ] Backend deployment (Render/Railway)
- [ ] Production MongoDB setup
- [ ] Database backups

---

## 🛠️ Development Workflow

### Run Backend Only (API testing)
```bash
cd backend
npm run dev       # Runs on port 5000
```

### Run Desktop Only (React dev server)
```bash
cd desktop
npm run react-start   # Runs on port 3000
```

### Run Both Together (Full dev stack)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd desktop && npm run react-start

# Terminal 3
cd desktop && npm run electron-start
```

### Production Build
```bash
cd desktop
npm run electron-build    # Creates .exe installer
```

---

## 🔐 Security (MVP)

### Authentication
- JWT tokens (7-day expiry)
- Role-based access control (Cashier, Manager, Admin)
- Password hashing with bcryptjs

### Protected Endpoints
```
POST /api/orders        → Requires JWT + Cashier role
PUT /api/products/:id   → Requires JWT + Manager role
```

---

## 📱 Translations (i18n)

The app automatically detects language preference from browser storage. Users can toggle between:

- **English** (`en`)
- **Bengali** (`bn`)

To add more languages:
1. Create `src/i18n/{language-code}.json`
2. Add translations for all keys
3. Import in `src/i18n/config.js`

---

## 🗄️ Database Schemas (MVP)

### Product Collection
```javascript
{
  _id: ObjectId,
  barcode: "1234567890",           // Unique, indexed
  name: "Rice 5kg",
  category: "Grains",
  costPrice: 150,
  sellingPrice: 200,
  stock: 50,
  unit: "pcs",
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Order Collection
```javascript
{
  _id: ObjectId,
  orderNumber: "ORD-1712234567890-1",
  items: [
    {
      productId: ObjectId,
      productName: "Rice 5kg",
      quantity: 2,
      unitPrice: 200,
      total: 400
    }
  ],
  subtotal: 400,
  discount: 0,
  tax: 40,
  total: 440,
  paymentMethod: "cash",
  cashier: ObjectId,
  status: "completed",
  createdAt: Timestamp
}
```

---

## 🧪 Testing Checklist

### Phase 1 (Current)
- [ ] Backend server starts: `npm run dev` → No errors, listens on port 5000
- [ ] Desktop React app loads: `npm start` → App visible at localhost:3000
- [ ] Folder structure matches documentation
- [ ] `.env` files created

### Phase 2
- [ ] SQLite database creates local file
- [ ] Products can be saved/retrieved by barcode
- [ ] Online/offline detection works
- [ ] Orders queue locally when offline

### Phase 3
- [ ] Scan input accepts barcode
- [ ] Product appears in cart
- [ ] Cart live updates
- [ ] Language toggle switches English ↔ Bengali

### Phase 4
- [ ] Checkout Modal opens
- [ ] Discount/Tax calculated correctly
- [ ] Receipt prints (or preview shows)
- [ ] Order saved to SQLite

### Phase 5
- [ ] `GET /api/products/barcode/123` returns product
- [ ] `POST /api/orders` saves to MongoDB
- [ ] Stock updates correctly
- [ ] JWT auth works

### Phase 6
- [ ] Full offline flow works
- [ ] Orders sync when going online
- [ ] No data loss
- [ ] App resilient to network errors

### Phase 7
- [ ] `.exe` builds and runs standalone
- [ ] Backend deployed reachable
- [ ] Orders sync to production

---

## 📞 API Endpoints (Phase 5+)

### Products
```
GET  /api/products              → List all products
GET  /api/products/barcode/:code → Get by barcode
POST /api/products              → Create product
PUT  /api/products/:id          → Update product
```

### Orders
```
POST /api/orders                → Create order
GET  /api/orders/:id            → Get order by ID
```

### Auth
```
POST /api/auth/login            → Login user
POST /api/auth/logout           → Logout user
```

---

## 🎯 MVP Feature Set

**In Scope (v1 - This Sprint)**
- Barcode scanning
- Add/remove products from cart
- Offline-first architecture
- Basic checkout & receipt printing
- i18n (English + Bengali)
- Role-based user system (structure only, no UI)

**Out of Scope (v2+)**
- Admin/Manager dashboards
- Advanced reports & analytics
- QR code receipts
- Product images
- Loyalty system
- WhatsApp integration
- AI demand prediction
- Mobile app (React Native)
- Multi-language beyond English/Bengali

---

## 📝 Environment Setup

### Backend (.env)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/baymax
JWT_SECRET=your-super-secret-key
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
```

### Desktop (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
REACT_APP_DEFAULT_LANGUAGE=en
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
# Verify MONGO_URI in .env
# Check if port 5000 is in use

npm run dev -- --port 5001  # Use different port
```

### Desktop app blank/won't load
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check if backend is running
curl http://localhost:5000/health

# Update React app URL
# Verify REACT_APP_API_URL in .env
```

### SQLite errors
```bash
# SQLite installed?
npm list better-sqlite3

# If missing:
npm install better-sqlite3
```

---

## 📚 References & Tools

- **MongoDB**: https://www.mongodb.com/cloud/atlas (free tier)
- **Electron**: https://www.electronjs.org/docs
- **React**: https://react.dev
- **i18next**: https://www.i18next.com
- **Zustand**: https://github.com/pmndrs/zustand
- **Postman**: https://www.postman.com (API testing)

---

## 📄 License

MIT License - Build and improve freely!

---

## 🎯 Next Steps

1. ✅ **Phase 1 Complete** → Folder structure + boilerplate ready
2. 🔄 **Phase 2 Next** → SQLite + Sync service implementation
3. Then → Core POS UI (Phase 3)
4. Then → Backend API endpoints (Phase 5)

---

## 📞 Support Notes

- **Current Phase**: Phase 1 (Project Scaffold) ✅ COMPLETE
- **Timeline**: 2-4 weeks for MVP
- **Target**: Solo developer, 8 hours/day
- **CI/CD**: Not included in MVP (add in v2)

---

**Last Updated**: April 7, 2026  
**Status**: Phase 1 Scaffold ✅ Complete | Ready for Phase 2
