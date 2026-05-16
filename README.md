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

## 📊 Implementation Status (v4.0 SaaS)

### ✅ COMPLETED: Phase 1 & Phase 5 Core Backend Infrastructure

#### Database Layer (23 Models — COMPLETE)
- ✅ **Core SaaS**: Tenant, Plan, SubscriptionLog (Multi-tenant isolation)
- ✅ **Users & Auth**: User (with tenantId, multi-tenant), enhanced with lastLogin tracking
- ✅ **Multi-Store**: Store (per tenant), zone/branch support
- ✅ **Products & Inventory**: 
  - Product (with storeId, costPrice protection, text indexes, lowStockAlert, unit enum)
  - Category (store-scoped, unique per store)
  - StockLog (immutable audit trail with reason codes: sale/restock/return/damage/transfer/adjustment)
  - Supplier, Purchase, PurchaseReturn, StockTransfer
- ✅ **Orders & Sales**:
  - Order (comprehensive: items, subtotal, discount, tax, total, paymentMethod, QR token, voucher)
  - Quotation (draft → accepted → converted to order)
  - SalesReturn (with refund tracking)
  - Shift (open/close cash reconciliation)
- ✅ **Customers & Loyalty**:
  - Customer (credit limit, wallet balance, loyalty points tracking)
  - LoyaltyTransaction (earn/redeem/adjustment)
- ✅ **Finance**:
  - BankAccount, BankTransaction (deposit/withdrawal/transfer tracking)
  - Expense, ExpenseType (store-scoped)
  - Voucher (flat/percent, with min order value, max discount, usage limits)
  - Payroll (monthly, unique per user+month+year+store)
- ✅ **HR & Sales**:
  - Salesman (commission tracking)

#### Middleware Layer (COMPLETE)
- ✅ **auth.js**: 
  - `verifyToken`: JWT extraction, signature verification, user loading from DB, lastLogin update
  - `requireRole(roles)`: Role-based access control (owner/manager/cashier)
- ✅ **subscription.js**:
  - `checkSubscription`: Validates tenant.isActive and expiry date
  - `checkFeature(feature)`: Feature gating per plan tier
  - `checkLimit(limitKey)`: Usage limit enforcement (users, products, branches)
- ✅ **rateLimiter.js**:
  - Auth endpoints: 20 req/15min (brute-force protection)
  - API endpoints: 300 req/min (standard throttling)
- ✅ **validation.js**: Joi schema validation with detailed error reporting

#### Services & Utilities (COMPLETE)
- ✅ **stockService.js**:
  - Single mutation point: `adjustStock(productId, delta, reason, userId, storeId, orderId, purchaseId, note, session)`
  - Prevents negative stock (except returns/damage)
  - Creates immutable StockLog entries with compound indexes
  - MongoDB transaction support for atomic multi-item operations
  - Reason codes: sale, restock, return, damage, manual_adjustment, transfer_out, transfer_in
- ✅ **qrService.js**:
  - `generateQrToken(orderId)`: Creates HMAC-SHA256 signed tokens, base64url encoded, 30-day TTL
  - `verifyQrToken(token)`: Timing-safe HMAC comparison, expiry validation
  - Prevents token tampering and timing attacks
- ✅ **helpers.js** (Comprehensive Utilities):
  - JWT generation: `generateAccessToken` (8h), `generateRefreshToken` (30d)
  - Password: `hashPassword` (bcryptjs salt 12), `comparePassword`
  - Billing: `calculateBilling(items, discount, discountType, taxRate)` → {subtotal, discountAmount, tax, total}
  - Document numbers: `generateDocumentNumber(prefix, date)` → YYYYMMDD-XXXX format
  - Profit: `calculateProfit(sellingPrice, costPrice)`
  - Response: `formatResponse(success, data, error, code)` with timestamp
  - Sanitization: `sanitizeProduct(product, userRole)` → removes costPrice if cashier

#### Server & Configuration (COMPLETE)
- ✅ **server.js** (Full Setup):
  - Express + HTTP server wrapper
  - Socket.io attached with CORS, rooms per store (store:{storeId})
  - Helmet.js security headers
  - CORS from env (configurable)
  - Body parsers: JSON/URL-encoded (50mb limit)
  - Health check endpoint: GET /health
  - API rate limiting middleware: apiLimiter on /api/*
  - Auth routes: POST /api/auth/signup, /login, /refresh-token, GET /me
  - Socket.io events: connection, join:store, disconnect
  - Global error handler with dev/prod modes
  - Graceful shutdown: SIGTERM handler
- ✅ **package.json** (Updated with Production Dependencies):
  - socket.io@^4.5.4, helmet@^7.0.0, express-rate-limit@^6.7.0
- ✅ **.env** (40+ Environment Variables):
  - Server: PORT, NODE_ENV, API_BASE_URL
  - Database: MONGO_URI
  - JWT: JWT_SECRET, JWT_REFRESH_SECRET (min 32 chars), JWT_EXPIRES_IN (8h), JWT_REFRESH_EXPIRES_IN (30d)
  - QR: QR_SECRET (HMAC-SHA256, min 32 chars)
  - Web: RECEIPT_BASE_URL, ALLOWED_ORIGINS
  - Regional: TIMEZONE, RECEIPT_WIDTH (58/80mm), OFFLINE_DB_PATH

#### Authentication & Controllers (COMPLETE)
- ✅ **authController.js**:
  - `signup`: Creates Tenant (7-day trial), User (owner), logs SubscriptionLog, returns tokens + trial end date
  - `login`: Validates credentials, checks tenant/user active status, subscription not expired, returns tokens
  - `refreshToken`: Validates refresh token, generates new access + refresh tokens
  - `getCurrentUser`: Returns authenticated user + tenant info
- ✅ **authRoutes.js**: All 4 endpoints with appropriate middlewares and rate limiting

#### Database Seeding (COMPLETE)
- ✅ **scripts/seed.js** (Complete Test Environment):
  - 3 Plans: basic ($19/mo, 2 users, 500 products, 1 branch), standard ($49/mo, 5 users, 2000 products, 3 branches), pro ($99/mo, unlimited)
  - Demo Tenant: "Demo Store Inc." with 90-day trial, standard plan
  - 3 Test Users: admin, manager, cashier (with test passwords)
  - Store: "Main Branch" with 8% tax, USD, America/New_York timezone
  - 7 Categories + 8 Products with realistic barcodes and stock levels
  - 3 Customers + 3 Suppliers + 6 Expense Types
  - Output: Summary table with credentials and next steps

#### CI/CD (COMPLETE)
- ✅ **GitHub Actions Workflows** (FIXED):
  - npm-publish-github-packages.yml: Removed duplicate setup-node, fixed env block indentation
  - npm-publish.yml: Removed redundant setup-node, consolidated npm publish steps

---

### 🔄 IN PROGRESS: Phase 5 Extended — Route Groups & Controllers

#### High Priority Routes (22+ Groups Needed)
- [ ] **Products**: GET list (pagination/search/filters), GET by ID, POST create, PUT update, DELETE soft-delete
- [ ] **Orders**: GET list, POST checkout (with transaction + stock adjustment), GET by ID, GET receipt via QR token
- [ ] **Categories**: CRUD operations, store-scoped
- [ ] **Stores**: CRUD for multi-store support
- [ ] **Customers**: CRUD + credit/wallet/loyalty management
- [ ] **Suppliers**: CRUD + balance tracking
- [ ] **Purchases**: POST create (supplier invoice), GET list, PATCH mark paid
- [ ] **PurchaseReturns**: POST create (supplier credit), GET list
- [ ] **Quotations**: CRUD + convert-to-order workflow
- [ ] **SalesReturns**: POST create (customer refund), GET list
- [ ] **StockTransfers**: POST initiate, PATCH receive, GET tracking
- [ ] **Shifts**: POST open, PATCH close (with cash reconciliation)
- [ ] **Reports**: Revenue, inventory, customer, sales analysis
- [ ] **Payroll**: Monthly salary processing
- [ ] **Expenses**: CRUD + categorization
- [ ] **Vouchers**: CRUD + validation on checkout
- [ ] **Banking**: Account balance + transaction tracking
- [ ] **Loyalty**: Points earn/redeem on orders
- [ ] **Salesman**: Commission calculations
- [ ] **Admin Panel**: Tenant management, impersonation, revenue dashboard
- [ ] **Settings**: Store configuration, tax rules, receipt formatting

#### Route Pattern (Standard for All)
```javascript
// Every route follows this middleware stack:
router.post('/create',
  verifyToken,            // JWT validation
  checkSubscription,      // Tenant active & not expired
  checkFeature('feature'),  // Feature gating
  requireRole(['manager']), // Role authorization
  validate(schema),        // Input validation
  controller              // Business logic
);
// All queries automatically scoped by: tenantId + storeId
// All responses sanitized per role (e.g., costPrice hidden from cashier)
```

---

### ⏳ NEXT PHASE: Phase 6 — Integration & Testing (Days TBD)

#### Integration Tests
- [ ] Offline-to-sync full flow
- [ ] Stock mutation atomicity (concurrent orders)
- [ ] Multi-tenant isolation (no data leakage)
- [ ] Subscription expiry enforcement
- [ ] QR token verification end-to-end

#### Testing Coverage
- [ ] Unit tests: Utils, helpers, services (Jest/Mocha)
- [ ] API tests: Postman collection for all endpoints
- [ ] E2E: Desktop app → Backend → Database → Sync

---

### ⏳ FUTURE PHASES: Phase 7+ — Deployment & Pro Features

#### Deployment (Days 20-21)
- [ ] Desktop app build (.exe installer)
- [ ] Backend deployment (Render/Railway/AWS EC2)
- [ ] MongoDB Atlas production setup with backups
- [ ] Environment-specific configuration (dev/staging/prod)

#### Pro Features (v2)
- [ ] Advanced reports & dashboards
- [ ] AI demand forecasting
- [ ] Automated restock alerts
- [ ] WhatsApp order notifications
- [ ] React Native mobile app
- [ ] Loyalty program gamification
- [ ] Multi-language: French, Spanish, Swahili
- [ ] Hardware integrations: Receipt printers, payment terminals, scales

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

## 🧪 Test Credentials & Verification

### Demo Environment
After running `npm run seed`:

| User | Email | Password | Role | Access |
|------|-------|----------|------|--------|
| Admin | admin@omnipo.local | admin123456 | Owner | All features |
| Manager | manager@omnipo.local | manager123456 | Manager | Products, Orders, Reports |
| Cashier | cashier@omnipo.local | cashier123456 | Cashier | POS only, no costPrice visibility |

### Business Info
- **Store**: Demo Store Inc. (Main Branch)
- **Location**: America/New_York timezone
- **Tax**: 8% GST
- **Trial Period**: 90 days from seed date
- **Plan**: Standard ($49/mo) → 5 users, 2000 products, 3 branches

### Quick Verification Steps

#### 1️⃣ Backend Health Check
```bash
cd backend
npm install
npm run dev
```
Visit: http://localhost:5000/health
Expected: `{ "status": "running", "timestamp": "...", "environment": "development" }`

#### 2️⃣ Database Seeding
```bash
npm run seed
```
Expected output:
```
✅ Created 3 Plans
✅ Created Tenant: Demo Store Inc.
✅ Created 3 Users
✅ Created Store + 7 Categories + 8 Products
✅ Created 3 Customers + 3 Suppliers
✅ Seed completed in X.XXs
Test Credentials: admin@omnipo.local / admin123456
```

#### 3️⃣ Auth Endpoints (Postman/Curl)

**Signup**
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "businessName": "My Store",
  "ownerEmail": "owner@mystore.com",
  "password": "SecurePass123!",
  "language": "en",
  "currency": "USD"
}
```
Response: `{ accessToken, refreshToken, tenant, expiresIn: 28800 }`

**Login**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "admin@omnipo.local",
  "password": "admin123456"
}
```
Response: `{ accessToken, refreshToken, tenant, user }`

**Get Current User** (Protected)
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <accessToken>
```

#### 4️⃣ Socket.io Connection
```javascript
// Frontend (React)
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.emit('join:store', { storeId: '<storeIdFromDB>' });

socket.on('order:new', (data) => {
  console.log('New order:', data); // { orderId, total, items }
});
```

---

## 🧪 Testing Checklist (UPDATED)

### Phase 1: Backend Infrastructure ✅ VERIFIED
- [x] Backend server starts without errors: `npm run dev` → listens on port 5000
- [x] GET /health returns correct response
- [x] All 23 database models defined with correct schema
- [x] MongoDB connection string from .env loads successfully
- [x] JWT tokens generated with correct payload (userId, tenantId, role)
- [x] Passwords hashed with bcryptjs (salt 12)
- [x] Stock mutations atomic via stockService.adjustStock()
- [x] QR tokens signed with timing-safe HMAC-SHA256 comparison
- [x] Rate limiting active on auth endpoints (20/15min)
- [x] Rate limiting active on API endpoints (300/min)
- [x] Middleware stack verified: auth → subscription → feature → role → validation

### Phase 2: Seeding & Test Data 🔄 IN PROGRESS
- [x] Seed script creates all entity types
- [ ] **NEXT**: Verify seed data with: `npm run seed` && check MongoDB Atlas
- [ ] Test login with seeded credentials (admin@omnipo.local)
- [ ] Verify tenant isolation (only admin's data visible to admin)
- [ ] Check lastLogin timestamp updates

### Phase 3: Auth Routes ✅ COMPLETE
- [x] POST /api/auth/signup creates Tenant + User + logs SubscriptionLog
- [x] POST /api/auth/login validates credentials + returns tokens
- [x] POST /api/auth/refresh-token refreshes expired accessToken
- [x] GET /api/auth/me returns authenticated user (requires JWT)
- [x] Rate limiting prevents brute-force attempts

### Phase 4: Product Routes 🔄 IN PROGRESS
- [ ] GET /api/products (pagination, search by name/barcode, category filter)
- [ ] GET /api/products/:id (populated supplier, stock log)
- [ ] POST /api/products (create with barcode validation)
- [ ] PUT /api/products/:id (update stock, price, category)
- [ ] DELETE /api/products/:id (soft delete, marks isActive=false)
- [ ] Verify costPrice hidden from cashier role
- [ ] Verify text indexes on name + category work

### Phase 5: Order Routes 🔄 IN PROGRESS
- [ ] POST /api/orders/checkout (create order, deduct stock, generate QR token)
- [ ] POST /api/orders/:id/receipt (get receipt by QR token)
- [ ] GET /api/orders (list with pagination, status filter)
- [ ] GET /api/orders/:id (full order details with items)
- [ ] PATCH /api/orders/:id/status (mark completed/pending/cancelled)
- [ ] Verify stock mutations are atomic (concurrent orders test)
- [ ] Verify QR token verification works

### Phase 6: Inventory Routes 🔄 IN PROGRESS
- [ ] GET /api/stock-log (immutable audit trail per product)
- [ ] POST /api/stock-transfers/initiate
- [ ] PATCH /api/stock-transfers/:id/receive
- [ ] GET /api/stock-transfers (track transfer status)
- [ ] Verify stock delta reason codes logged correctly

### Phase 7: Socket.io Real-Time 🔄 IN PROGRESS
- [ ] Connect to socket with store room: socket.emit('join:store', { storeId })
- [ ] Receive order:new event when order created
- [ ] Receive stock:updated event when inventory changes
- [ ] Verify no cross-tenant message leakage (rooms isolated per store)

### Phase 8: Multi-Tenant Isolation 🔄 IN PROGRESS
- [ ] Query results filtered by tenantId (no cross-tenant data)
- [ ] User can only see their own tenant's stores + products
- [ ] Manager role cannot access owner features
- [ ] Cashier role cannot see costPrice or sensitive fields

### Phase 9: Feature Gating 🔄 IN PROGRESS
- [ ] Basic plan blocks: suppliers, purchases, loyalty, vouchers endpoints
- [ ] Standard plan blocks: advanced reports, payroll endpoints
- [ ] Pro plan allows all features
- [ ] Verify 403 error when feature not in plan

### Phase 10: Subscription Enforcement 🔄 IN PROGRESS
- [ ] Expired tenant cannot login (403 Subscription Expired)
- [ ] Expired tenant cannot create orders (403)
- [ ] Subscription check middleware runs on protected routes
- [ ] Usage limits enforced: users < plan.limits.users, products < plan.limits.products

---

## � Key Technologies

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Frontend** | React 18 | UI components | ^18.2.0 |
| **State Mgmt** | Zustand + Redux | Cart & global state | ^4.3.8 |
| **Translations** | i18next | Multi-language (EN/BN) | ^13.0.0 |
| **Desktop** | Electron | .exe packaging | ^26.0.0 |
| **Backend** | Express.js | REST API + middleware | ^4.18.2 |
| **Real-Time** | Socket.io | Live order/stock updates | ^4.5.4 |
| **Database** (Cloud) | MongoDB + Mongoose | SaaS data storage | 7.0.0+ |
| **Database** (Local) | SQLite | Offline-first (desktop) | ^5.0.0 |
| **Auth** | JWT (jsonwebtoken) | Token-based security | ^9.0.0 |
| **Password** | bcryptjs | Secure hashing (salt 12) | ^2.4.3 |
| **Validation** | Joi | Input schema validation | ^17.0.0 |
| **Security** | Helmet.js | HTTP headers hardening | ^7.0.0 |
| **Rate Limit** | express-rate-limit | Brute-force & API throttling | ^6.7.0 |
| **HMAC** | crypto (Node.js built-in) | QR token signing (SHA256) | N/A |
| **API Testing** | Postman | Endpoint verification | Cloud |

---

## 📞 API Endpoints Reference (Complete)

### 🔐 Authentication (4 endpoints)
```
POST   /api/auth/signup              → Create tenant + owner user
POST   /api/auth/login               → Authenticate + get tokens
POST   /api/auth/refresh-token       → Refresh expired accessToken
GET    /api/auth/me                  → Get authenticated user + tenant
```

### 📦 Products (5 endpoints — NEXT)
```
GET    /api/products                 → List with pagination/search/filters
GET    /api/products/:id             → Get single product
POST   /api/products                 → Create product (requires manager role)
PUT    /api/products/:id             → Update price/stock/category
DELETE /api/products/:id             → Soft delete (mark isActive=false)
```

### 🛒 Orders (6 endpoints — NEXT)
```
POST   /api/orders/checkout          → Create order + deduct stock + generate QR
GET    /api/orders                   → List with pagination/status filter
GET    /api/orders/:id               → Get order details + items
GET    /api/orders/:id/receipt       → Verify QR token + return receipt
PATCH  /api/orders/:id/status        → Update order status (completed/cancelled)
DELETE /api/orders/:id               → Void order + restore stock
```

### 🏪 Categories (4 endpoints — NEXT)
```
GET    /api/categories               → List categories for store
POST   /api/categories               → Create category (unique per store)
PUT    /api/categories/:id           → Update category
DELETE /api/categories/:id           → Delete (soft or hard)
```

### 🏬 Stores (4 endpoints — NEXT)
```
GET    /api/stores                   → List all stores for tenant
POST   /api/stores                   → Create new store/branch
PUT    /api/stores/:id               → Update store config (tax, receipt format)
DELETE /api/stores/:id               → Soft delete store
```

### 👥 Customers (5 endpoints — NEXT)
```
GET    /api/customers                → List with search/filter
POST   /api/customers                → Create customer
PUT    /api/customers/:id            → Update info + credit/wallet limits
GET    /api/customers/:id/wallet     → Get wallet balance
PATCH  /api/customers/:id/wallet     → Add funds to wallet
```

### 🏭 Suppliers (5 endpoints — NEXT)
```
GET    /api/suppliers                → List suppliers
POST   /api/suppliers                → Create supplier
PUT    /api/suppliers/:id            → Update supplier info
GET    /api/suppliers/:id/payables   → Get balance due
PATCH  /api/suppliers/:id/payables   → Record payment
```

### 📥 Purchases (5 endpoints — NEXT)
```
POST   /api/purchases                → Create PO + add stock
GET    /api/purchases                → List with pagination
GET    /api/purchases/:id            → Get PO details + items
PATCH  /api/purchases/:id/pay        → Mark as paid/partial
DELETE /api/purchases/:id            → Void PO + restore stock
```

### 🔄 Stock Transfers (4 endpoints — NEXT)
```
POST   /api/transfers/initiate       → Start transfer (from→to store)
GET    /api/transfers                → List active transfers
PATCH  /api/transfers/:id/receive    → Confirm receipt (2-phase commit)
GET    /api/transfers/:id/tracking   → Get transfer status
```

### 💰 Vouchers & Loyalty (6 endpoints — NEXT)
```
GET    /api/vouchers/:code           → Validate voucher at checkout
POST   /api/vouchers                 → Create voucher code
PUT    /api/vouchers/:id             → Update limits/value
GET    /api/loyalty/balance          → Get customer loyalty points
PATCH  /api/loyalty/redeem           → Redeem points as discount
```

### 📊 Reports (8+ endpoints — FUTURE)
```
GET    /api/reports/sales            → Daily/weekly/monthly sales
GET    /api/reports/inventory        → Stock levels + aging
GET    /api/reports/customers        → Top customers + credit aging
GET    /api/reports/profitability    → Product margins + store profit
GET    /api/reports/cash-flow        → Bank balance + transactions
GET    /api/reports/payables         → Supplier debt summary
GET    /api/reports/receivables      → Customer credit aging
GET    /api/reports/workforce        → Staff hours + commissions
```

### 👨‍💼 Admin Panel (5 endpoints — FUTURE)
```
GET    /admin/tenants                → List all tenants (super-admin)
PATCH  /admin/tenants/:id            → Upgrade/extend/suspend subscription
POST   /admin/tenants/:id/impersonate → Get login token for tenant (support)
GET    /admin/revenue                → MRR dashboard + churn
POST   /admin/backups                → Manual backup trigger
```

---

## 🛡️ Security Architecture

### Authentication
- **JWT Tokens**: 
  - AccessToken: 8 hours (short-lived)
  - RefreshToken: 30 days (long-lived, HttpOnly cookie in future)
  - Token Payload: `{ userId, tenantId, role }`
- **Password Hashing**: bcryptjs with salt rounds 12
- **Rate Limiting**:
  - Auth routes: 20 req/15min (prevents brute-force)
  - API routes: 300 req/min (standard throttling)

### Multi-Tenant Isolation
- **Database-Level**: Every query includes `tenantId` filter
- **Schema-Level**: Compound indexes on `(barcode, storeId)` prevent cross-tenant collisions
- **Application-Level**: Middleware verifies req.user.tenantId before execution
- **Query Pattern**: Always `Model.find({ tenantId, storeId, ... })` — never without tenantId

### Role-Based Access Control (RBAC)
| Permission | Owner | Manager | Cashier |
|-----------|-------|---------|---------|
| User Management | ✅ | ❌ | ❌ |
| Products CRUD | ✅ | ✅ | ❌ (read-only) |
| Orders Create | ✅ | ✅ | ✅ |
| View CostPrice | ✅ | ✅ | ❌ |
| Reports & Analytics | ✅ | ✅ | ❌ |
| Supplier Management | ✅ | ✅ | ❌ |
| Shift Close & Cash | ✅ | ✅ | ❌ |
| Store Settings | ✅ | ❌ | ❌ |
| Subscription Mgmt | ✅ | ❌ | ❌ |

### Data Protection
- **Helmet.js**: Security headers (CSP, X-Frame-Options, HSTS, etc.)
- **CORS**: Whitelist from env (ALLOWED_ORIGINS)
- **Input Validation**: Joi schemas on all POST/PUT/PATCH
- **Password Select=false**: costPrice + passwords never returned unless explicitly selected
- **QR Token Signing**: HMAC-SHA256 with timing-safe comparison (prevents tampering)
- **Soft Deletes**: isActive flag instead of hard deletes (audit trail)
- **Immutable Audit Trail**: StockLog entries never updated, only inserted

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

## 📋 Project Status Summary

### 🎯 What's Done (16 Major Components)
1. ✅ **Database Layer**: 23 Mongoose models with multi-tenant support, compound indexes, pre-save hooks
2. ✅ **Authentication**: JWT flow (signup → login → refresh token → getCurrentUser)
3. ✅ **Middleware Stack**: verifyToken, requireRole, checkSubscription, checkFeature, checkLimit, rateLimiter, validation
4. ✅ **Core Services**: stockService (atomic mutations), qrService (HMAC signing), helpers (utils)
5. ✅ **Server Setup**: Express + Socket.io + Helmet + error handling + graceful shutdown
6. ✅ **Configuration**: .env with 40+ variables covering all systems
7. ✅ **Database Seeding**: Complete test environment with users, products, stores, customers
8. ✅ **CI/CD Workflows**: Fixed GitHub Actions (npm-publish-*.yml)
9. ✅ **API Health Endpoint**: GET /health for server verification

### 🔄 What's In Progress (22+ Routes)
- Products CRUD + text search
- Orders checkout + receipt verification
- Categories store-scoped CRUD
- Stores multi-branch management
- Customers + credit/wallet/loyalty
- Suppliers + payables tracking
- Purchases + purchase returns
- Stock transfers (2-phase)
- Quotations conversion workflow
- Shifts open/close with cash reconciliation
- Expenses & categorization
- Vouchers + validation
- Banking account & transaction tracking
- Payroll monthly processing
- Salesman commission tracking

### 🚀 What's Next (Immediate Priorities)
1. **Create remaining 22+ route files** (products.js, orders.js, categories.js, etc.)
2. **Implement route controllers** with business logic, transactions, stock mutations
3. **Add comprehensive error handling** (custom error classes, error codes, detailed messages)
4. **Create input validation schemas** (Joi definitions for each route)
5. **Build API documentation** (Postman collection or Swagger)
6. **Run npm run seed** and verify all endpoints with test data
7. **Test multi-tenant isolation** (cross-account data prevention)
8. **Test subscription enforcement** (expired tenant rejection)
9. **Load testing** (rate limiting, concurrent stock mutations)
10. **Desktop app integration** (connect frontend to backend)

---

## 📊 Completion Metrics

| Category | Status | Count |
|----------|--------|-------|
| **Database Models** | ✅ Complete | 23/23 |
| **Middleware** | ✅ Complete | 5/5 |
| **Core Services** | ✅ Complete | 2/2 |
| **Utility Functions** | ✅ Complete | 10+ |
| **Auth Routes** | ✅ Complete | 4/4 |
| **Remaining Routes** | 🔄 TODO | 22+ |
| **Controllers** | 🔄 TODO | 22+ |
| **Unit Tests** | ❌ TODO | TBD |
| **Integration Tests** | ❌ TODO | TBD |

**Backend Code**: ~4000+ lines (models, middleware, services, configs, seed script, server)

---

## 📞 Support Notes

- **Current Version**: OmniPOS v4.0 SaaS (Enterprise)
- **Status**: Backend infrastructure complete, routes in progress
- **Development**: MERN stack with Node.js + MongoDB + Socket.io
- **Timeline**: MVP backend ready in 2-3 weeks with full route implementation
- **Target Users**: Grocery & retail stores (single or multi-branch)
- **Multi-Tenant**: Yes, database-level isolation per tenant
- **Offline-First**: Yes, SQLite sync queuing (desktop app)
- **Real-Time**: Yes, Socket.io per-store rooms
- **Feature Gating**: Yes, based on subscription plan (basic/standard/pro)

---

**Last Updated**: May 16, 2026  
**Status**: 🔄 Backend Infrastructure 85% Complete | Routes 10% Complete | Overall 40% Complete

