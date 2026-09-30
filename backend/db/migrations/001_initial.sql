-- Fresh PostgreSQL schema. No MongoDB import or destructive reset.
-- Scalar columns, foreign keys, checks and unique indexes; JSONB for embedded snapshots.

CREATE TABLE "bankaccounts" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "bankName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "accountHolder" text DEFAULT '',
    "openingBalance" numeric DEFAULT 0,
    "currentBalance" numeric DEFAULT 0,
    "accountType" text DEFAULT 'business' CHECK ("accountType" IN ('checking', 'savings', 'business')),
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "banktransactions" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "accountId" varchar(24) NOT NULL,
    "type" text NOT NULL CHECK ("type" IN ('deposit', 'withdrawal', 'transfer_out', 'transfer_in')),
    "amount" numeric NOT NULL,
    "balanceAfter" numeric NOT NULL,
    "description" text DEFAULT '',
    "reference" text DEFAULT '',
    "date" timestamptz NOT NULL,
    "createdBy" varchar(24),
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "categories" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "name" text NOT NULL,
    "description" text DEFAULT '',
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "customers" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "name" text NOT NULL,
    "phone" text DEFAULT '',
    "email" text DEFAULT '',
    "loyaltyCard" text DEFAULT NULL,
    "creditLimit" numeric DEFAULT 0,
    "creditBalance" numeric DEFAULT 0,
    "walletBalance" numeric DEFAULT 0,
    "loyaltyPoints" numeric DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "expenses" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "expenseTypeId" varchar(24) NOT NULL,
    "amount" numeric NOT NULL,
    "description" text DEFAULT '',
    "date" timestamptz NOT NULL,
    "paymentMethod" text DEFAULT 'cash' CHECK ("paymentMethod" IN ('cash', 'bank', 'mobile')),
    "reference" text DEFAULT '',
    "createdBy" varchar(24),
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "expensetypes" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "name" text NOT NULL,
    "description" text DEFAULT '',
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "loyaltytransactions" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "customerId" varchar(24) NOT NULL,
    "points" numeric NOT NULL,
    "type" text NOT NULL CHECK ("type" IN ('earn', 'redeem', 'adjustment')),
    "orderId" varchar(24) DEFAULT NULL,
    "description" text DEFAULT '',
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "orders" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "profit" numeric DEFAULT 0,
    "qrExpiresAt" timestamptz,
    "orderNumber" text NOT NULL,
    "storeId" varchar(24) NOT NULL,
    "cashierId" varchar(24) NOT NULL,
    "customerId" varchar(24) DEFAULT NULL,
    "items" jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof("items") = 'array'),
    "subtotal" numeric NOT NULL,
    "discount" numeric DEFAULT 0,
    "discountType" text DEFAULT 'flat' CHECK ("discountType" IN ('flat', 'percent')),
    "tax" numeric DEFAULT 0,
    "costTotal" numeric DEFAULT 0,
    "total" numeric NOT NULL,
    "paymentMethod" text DEFAULT 'cash' CHECK ("paymentMethod" IN ('cash', 'card', 'mobile', 'credit', 'wallet', 'mixed')),
    "status" text DEFAULT 'completed' CHECK ("status" IN ('completed', 'pending', 'cancelled')),
    "qrToken" text DEFAULT NULL,
    "voucherId" varchar(24) DEFAULT NULL,
    "shiftId" varchar(24) DEFAULT NULL,
    "notes" text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "payrolls" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "userId" varchar(24) NOT NULL,
    "month" numeric NOT NULL,
    "year" numeric NOT NULL,
    "basicSalary" numeric NOT NULL,
    "bonus" numeric DEFAULT 0,
    "deductions" numeric DEFAULT 0,
    "netSalary" numeric NOT NULL,
    "paymentMethod" text DEFAULT 'cash' CHECK ("paymentMethod" IN ('cash', 'bank', 'mobile')),
    "status" text DEFAULT 'draft' CHECK ("status" IN ('draft', 'pending', 'paid')),
    "paidDate" timestamptz DEFAULT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "plans" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "name" text NOT NULL CHECK ("name" IN ('basic', 'standard', 'pro')),
    "features" jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof("features") = 'array'),
    "price" numeric DEFAULT 0,
    "trialDays" numeric DEFAULT 7,
    "limits" jsonb DEFAULT '{"users":2,"products":500,"branches":1}'::jsonb CHECK (jsonb_typeof("limits") = 'object'),
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "products" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "categoryId" varchar(24) DEFAULT NULL,
    "supplierId" varchar(24) DEFAULT NULL,
    "barcode" text NOT NULL,
    "name" text NOT NULL,
    "category" text DEFAULT 'General',
    "costPrice" numeric NOT NULL,
    "sellingPrice" numeric NOT NULL,
    "stock" numeric NOT NULL DEFAULT 0,
    "lowStockAlert" numeric DEFAULT 10,
    "unit" text DEFAULT 'pcs' CHECK ("unit" IN ('pcs', 'kg', 'liter', 'ltr', 'dozen', 'pack', 'meter', 'box', 'carton')),
    "storeId" varchar(24) NOT NULL,
    "description" text DEFAULT '',
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "purchases" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "purchaseNumber" text NOT NULL,
    "supplierId" varchar(24) NOT NULL,
    "items" jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof("items") = 'array'),
    "subtotal" numeric NOT NULL,
    "discount" numeric DEFAULT 0,
    "tax" numeric DEFAULT 0,
    "total" numeric NOT NULL,
    "balanceDue" numeric NOT NULL,
    "paidAmount" numeric DEFAULT 0,
    "status" text DEFAULT 'pending' CHECK ("status" IN ('pending', 'partial', 'paid')),
    "createdBy" varchar(24),
    "notes" text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "purchasereturns" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "returnNumber" text NOT NULL,
    "purchaseId" varchar(24) NOT NULL,
    "supplierId" varchar(24) NOT NULL,
    "items" jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof("items") = 'array'),
    "totalAmount" numeric NOT NULL,
    "reason" text DEFAULT '',
    "createdBy" varchar(24),
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "quotations" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "quotationNumber" text NOT NULL,
    "customerName" text NOT NULL,
    "customerId" varchar(24) DEFAULT NULL,
    "items" jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof("items") = 'array'),
    "subtotal" numeric NOT NULL,
    "discount" numeric DEFAULT 0,
    "tax" numeric DEFAULT 0,
    "total" numeric NOT NULL,
    "validUntil" timestamptz NOT NULL,
    "status" text DEFAULT 'draft' CHECK ("status" IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    "convertedToOrderId" varchar(24) DEFAULT NULL,
    "createdBy" varchar(24),
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "salesmen" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "name" text NOT NULL,
    "phone" text DEFAULT '',
    "email" text DEFAULT '',
    "commissionRate" numeric DEFAULT 5,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "salesreturns" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "returnNumber" text NOT NULL,
    "orderId" varchar(24) DEFAULT NULL,
    "customerId" varchar(24) DEFAULT NULL,
    "items" jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof("items") = 'array'),
    "totalAmount" numeric NOT NULL,
    "refundMethod" text DEFAULT 'cash' CHECK ("refundMethod" IN ('cash', 'wallet', 'loyalty_points')),
    "createdBy" varchar(24),
    "notes" text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "shifts" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "cashierId" varchar(24) NOT NULL,
    "openedAt" timestamptz NOT NULL,
    "closedAt" timestamptz DEFAULT NULL,
    "openingCash" numeric NOT NULL,
    "closingCash" numeric DEFAULT NULL,
    "expectedCash" numeric DEFAULT NULL,
    "cashDifference" numeric DEFAULT NULL,
    "status" text DEFAULT 'open' CHECK ("status" IN ('open', 'closed')),
    "notes" text DEFAULT '',
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "stocklogs" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "productId" varchar(24) NOT NULL,
    "delta" numeric NOT NULL,
    "reason" text NOT NULL CHECK ("reason" IN ('sale', 'restock', 'return', 'damage', 'manual_adjustment', 'transfer_out', 'transfer_in')),
    "changedBy" varchar(24) NOT NULL,
    "orderId" varchar(24) DEFAULT NULL,
    "purchaseId" varchar(24) DEFAULT NULL,
    "note" text DEFAULT '',
    "newBalance" numeric NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "stocktransfers" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "fromStoreId" varchar(24) NOT NULL,
    "toStoreId" varchar(24) NOT NULL,
    "transferNumber" text NOT NULL,
    "items" jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof("items") = 'array'),
    "status" text DEFAULT 'pending' CHECK ("status" IN ('pending', 'in_transit', 'received', 'cancelled')),
    "initiatedBy" varchar(24) NOT NULL,
    "receivedBy" varchar(24) DEFAULT NULL,
    "notes" text DEFAULT '',
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "stores" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "tenantId" varchar(24) NOT NULL,
    "name" text NOT NULL,
    "address" text DEFAULT '',
    "phone" text DEFAULT '',
    "taxRate" numeric DEFAULT 5,
    "taxLabel" text DEFAULT 'VAT',
    "currency" text DEFAULT 'USD',
    "timezone" text DEFAULT 'UTC',
    "receiptFooter" text DEFAULT 'Thank you for your purchase!',
    "logo" text DEFAULT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "subscriptionlogs" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "tenantId" varchar(24) NOT NULL,
    "plan" text NOT NULL,
    "amount" numeric NOT NULL,
    "currency" text DEFAULT 'USD',
    "paidAt" timestamptz DEFAULT now(),
    "periodStart" timestamptz NOT NULL,
    "periodEnd" timestamptz NOT NULL,
    "method" text DEFAULT 'manual' CHECK ("method" IN ('stripe', 'paypal', 'manual', 'trial')),
    "status" text DEFAULT 'paid' CHECK ("status" IN ('paid', 'failed', 'refunded')),
    "transactionId" text DEFAULT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "suppliers" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "name" text NOT NULL,
    "company" text DEFAULT '',
    "phone" text DEFAULT '',
    "email" text DEFAULT '',
    "address" text DEFAULT '',
    "openingBalance" numeric DEFAULT 0,
    "currentBalance" numeric DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

CREATE TABLE "tenants" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "businessName" text NOT NULL,
    "ownerEmail" text NOT NULL CHECK ("ownerEmail" = lower("ownerEmail")),
    "plan" text DEFAULT 'basic' CHECK ("plan" IN ('basic', 'standard', 'pro')),
    "subscriptionStatus" text DEFAULT 'active' CHECK ("subscriptionStatus" IN ('active', 'expired', 'suspended')),
    "expireAt" timestamptz NOT NULL,
    "isActive" boolean DEFAULT true,
    "isSetupComplete" boolean DEFAULT false,
    "language" text DEFAULT 'en' CHECK ("language" IN ('en', 'ar', 'bn')),
    "currency" text DEFAULT 'USD',
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "users" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "name" text NOT NULL,
    "email" text NOT NULL CHECK ("email" = lower("email")),
    "password" text NOT NULL,
    "role" text DEFAULT 'cashier' CHECK ("role" IN ('owner', 'manager', 'cashier')),
    "tenantId" varchar(24) NOT NULL,
    "isActive" boolean DEFAULT true,
    "lastLogin" timestamptz DEFAULT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "vouchers" (
    "_id" varchar(24) PRIMARY KEY CHECK ("_id" ~ '^[a-f0-9]{24}$'),
    "storeId" varchar(24) NOT NULL,
    "code" text NOT NULL,
    "type" text NOT NULL CHECK ("type" IN ('flat', 'percent')),
    "value" numeric NOT NULL,
    "usageLimit" numeric DEFAULT NULL,
    "usageCount" numeric DEFAULT 0,
    "validFrom" timestamptz NOT NULL,
    "validUntil" timestamptz NOT NULL,
    "minOrderValue" numeric DEFAULT 0,
    "maxDiscount" numeric DEFAULT NULL,
    "customerId" varchar(24) DEFAULT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now(),
    UNIQUE ("_id", "storeId")
);

ALTER TABLE "bankaccounts" ADD CONSTRAINT "bankaccounts_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "banktransactions" ADD CONSTRAINT "banktransactions_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "banktransactions" ADD CONSTRAINT "banktransactions_accountId_fk" FOREIGN KEY ("accountId", "storeId") REFERENCES "bankaccounts" ("_id", "storeId");
ALTER TABLE "banktransactions" ADD CONSTRAINT "banktransactions_createdBy_fk" FOREIGN KEY ("createdBy") REFERENCES "users" ("_id");
ALTER TABLE "categories" ADD CONSTRAINT "categories_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "customers" ADD CONSTRAINT "customers_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expenseTypeId_fk" FOREIGN KEY ("expenseTypeId", "storeId") REFERENCES "expensetypes" ("_id", "storeId");
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_createdBy_fk" FOREIGN KEY ("createdBy") REFERENCES "users" ("_id");
ALTER TABLE "expensetypes" ADD CONSTRAINT "expensetypes_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "loyaltytransactions" ADD CONSTRAINT "loyaltytransactions_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "loyaltytransactions" ADD CONSTRAINT "loyaltytransactions_customerId_fk" FOREIGN KEY ("customerId", "storeId") REFERENCES "customers" ("_id", "storeId");
ALTER TABLE "loyaltytransactions" ADD CONSTRAINT "loyaltytransactions_orderId_fk" FOREIGN KEY ("orderId", "storeId") REFERENCES "orders" ("_id", "storeId");
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "orders" ADD CONSTRAINT "orders_cashierId_fk" FOREIGN KEY ("cashierId") REFERENCES "users" ("_id");
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fk" FOREIGN KEY ("customerId", "storeId") REFERENCES "customers" ("_id", "storeId");
ALTER TABLE "orders" ADD CONSTRAINT "orders_voucherId_fk" FOREIGN KEY ("voucherId", "storeId") REFERENCES "vouchers" ("_id", "storeId");
ALTER TABLE "orders" ADD CONSTRAINT "orders_shiftId_fk" FOREIGN KEY ("shiftId", "storeId") REFERENCES "shifts" ("_id", "storeId");
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_userId_fk" FOREIGN KEY ("userId") REFERENCES "users" ("_id");
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fk" FOREIGN KEY ("categoryId", "storeId") REFERENCES "categories" ("_id", "storeId");
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fk" FOREIGN KEY ("supplierId", "storeId") REFERENCES "suppliers" ("_id", "storeId");
ALTER TABLE "products" ADD CONSTRAINT "products_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplierId_fk" FOREIGN KEY ("supplierId", "storeId") REFERENCES "suppliers" ("_id", "storeId");
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_createdBy_fk" FOREIGN KEY ("createdBy") REFERENCES "users" ("_id");
ALTER TABLE "purchasereturns" ADD CONSTRAINT "purchasereturns_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "purchasereturns" ADD CONSTRAINT "purchasereturns_purchaseId_fk" FOREIGN KEY ("purchaseId", "storeId") REFERENCES "purchases" ("_id", "storeId");
ALTER TABLE "purchasereturns" ADD CONSTRAINT "purchasereturns_supplierId_fk" FOREIGN KEY ("supplierId", "storeId") REFERENCES "suppliers" ("_id", "storeId");
ALTER TABLE "purchasereturns" ADD CONSTRAINT "purchasereturns_createdBy_fk" FOREIGN KEY ("createdBy") REFERENCES "users" ("_id");
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fk" FOREIGN KEY ("customerId", "storeId") REFERENCES "customers" ("_id", "storeId");
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_convertedToOrderId_fk" FOREIGN KEY ("convertedToOrderId", "storeId") REFERENCES "orders" ("_id", "storeId");
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_createdBy_fk" FOREIGN KEY ("createdBy") REFERENCES "users" ("_id");
ALTER TABLE "salesmen" ADD CONSTRAINT "salesmen_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "salesreturns" ADD CONSTRAINT "salesreturns_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "salesreturns" ADD CONSTRAINT "salesreturns_orderId_fk" FOREIGN KEY ("orderId", "storeId") REFERENCES "orders" ("_id", "storeId");
ALTER TABLE "salesreturns" ADD CONSTRAINT "salesreturns_customerId_fk" FOREIGN KEY ("customerId", "storeId") REFERENCES "customers" ("_id", "storeId");
ALTER TABLE "salesreturns" ADD CONSTRAINT "salesreturns_createdBy_fk" FOREIGN KEY ("createdBy") REFERENCES "users" ("_id");
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_cashierId_fk" FOREIGN KEY ("cashierId") REFERENCES "users" ("_id");
ALTER TABLE "stocklogs" ADD CONSTRAINT "stocklogs_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "stocklogs" ADD CONSTRAINT "stocklogs_productId_fk" FOREIGN KEY ("productId", "storeId") REFERENCES "products" ("_id", "storeId");
ALTER TABLE "stocklogs" ADD CONSTRAINT "stocklogs_changedBy_fk" FOREIGN KEY ("changedBy") REFERENCES "users" ("_id");
ALTER TABLE "stocklogs" ADD CONSTRAINT "stocklogs_orderId_fk" FOREIGN KEY ("orderId", "storeId") REFERENCES "orders" ("_id", "storeId");
ALTER TABLE "stocklogs" ADD CONSTRAINT "stocklogs_purchaseId_fk" FOREIGN KEY ("purchaseId", "storeId") REFERENCES "purchases" ("_id", "storeId");
ALTER TABLE "stocktransfers" ADD CONSTRAINT "stocktransfers_fromStoreId_fk" FOREIGN KEY ("fromStoreId") REFERENCES "stores" ("_id");
ALTER TABLE "stocktransfers" ADD CONSTRAINT "stocktransfers_toStoreId_fk" FOREIGN KEY ("toStoreId") REFERENCES "stores" ("_id");
ALTER TABLE "stocktransfers" ADD CONSTRAINT "stocktransfers_initiatedBy_fk" FOREIGN KEY ("initiatedBy") REFERENCES "users" ("_id");
ALTER TABLE "stocktransfers" ADD CONSTRAINT "stocktransfers_receivedBy_fk" FOREIGN KEY ("receivedBy") REFERENCES "users" ("_id");
ALTER TABLE "stores" ADD CONSTRAINT "stores_tenantId_fk" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("_id");
ALTER TABLE "subscriptionlogs" ADD CONSTRAINT "subscriptionlogs_tenantId_fk" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("_id");
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fk" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("_id");
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_storeId_fk" FOREIGN KEY ("storeId") REFERENCES "stores" ("_id");
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_customerId_fk" FOREIGN KEY ("customerId", "storeId") REFERENCES "customers" ("_id", "storeId");

CREATE INDEX "bankaccounts_idx_1" ON "bankaccounts" ("storeId");
CREATE INDEX "banktransactions_idx_1" ON "banktransactions" ("storeId");
CREATE INDEX "banktransactions_idx_2" ON "banktransactions" ("accountId");
CREATE INDEX "banktransactions_idx_3" ON "banktransactions" ("accountId", "date");
CREATE INDEX "categories_idx_1" ON "categories" ("storeId");
CREATE UNIQUE INDEX "categories_idx_2" ON "categories" ("name", "storeId");
CREATE INDEX "customers_idx_1" ON "customers" ("storeId");
CREATE INDEX "customers_idx_2" ON "customers" ("phone", "storeId");
CREATE INDEX "customers_idx_3" ON "customers" ("loyaltyCard");
CREATE INDEX "expenses_idx_1" ON "expenses" ("storeId");
CREATE INDEX "expenses_idx_2" ON "expenses" ("storeId", "date");
CREATE INDEX "expenses_idx_3" ON "expenses" ("expenseTypeId");
CREATE INDEX "expensetypes_idx_1" ON "expensetypes" ("storeId");
CREATE UNIQUE INDEX "expensetypes_idx_2" ON "expensetypes" ("name", "storeId");
CREATE INDEX "loyaltytransactions_idx_1" ON "loyaltytransactions" ("storeId");
CREATE INDEX "loyaltytransactions_idx_2" ON "loyaltytransactions" ("customerId");
CREATE INDEX "loyaltytransactions_idx_3" ON "loyaltytransactions" ("customerId", "createdAt");
CREATE INDEX "orders_idx_1" ON "orders" ("orderNumber");
CREATE INDEX "orders_idx_2" ON "orders" ("storeId");
CREATE INDEX "orders_idx_3" ON "orders" ("createdAt", "storeId");
CREATE INDEX "orders_idx_4" ON "orders" ("cashierId", "createdAt");
CREATE UNIQUE INDEX "orders_idx_5" ON "orders" ("orderNumber");
CREATE INDEX "payrolls_idx_1" ON "payrolls" ("storeId");
CREATE UNIQUE INDEX "payrolls_idx_2" ON "payrolls" ("userId", "month", "year", "storeId");
CREATE UNIQUE INDEX "plans_idx_1" ON "plans" ("name");
CREATE INDEX "products_idx_1" ON "products" ("barcode");
CREATE INDEX "products_idx_2" ON "products" ("storeId");
CREATE UNIQUE INDEX "products_idx_3" ON "products" ("barcode", "storeId");
CREATE INDEX "purchases_idx_1" ON "purchases" ("storeId");
CREATE INDEX "purchases_idx_2" ON "purchases" ("purchaseNumber");
CREATE INDEX "purchases_idx_3" ON "purchases" ("storeId", "createdAt");
CREATE INDEX "purchases_idx_4" ON "purchases" ("supplierId", "status");
CREATE UNIQUE INDEX "purchases_idx_5" ON "purchases" ("purchaseNumber");
CREATE INDEX "purchasereturns_idx_1" ON "purchasereturns" ("storeId");
CREATE INDEX "purchasereturns_idx_2" ON "purchasereturns" ("returnNumber");
CREATE INDEX "purchasereturns_idx_3" ON "purchasereturns" ("storeId", "createdAt");
CREATE UNIQUE INDEX "purchasereturns_idx_4" ON "purchasereturns" ("returnNumber");
CREATE INDEX "quotations_idx_1" ON "quotations" ("storeId");
CREATE INDEX "quotations_idx_2" ON "quotations" ("quotationNumber");
CREATE INDEX "quotations_idx_3" ON "quotations" ("storeId", "status");
CREATE UNIQUE INDEX "quotations_idx_4" ON "quotations" ("quotationNumber");
CREATE INDEX "salesmen_idx_1" ON "salesmen" ("storeId");
CREATE INDEX "salesreturns_idx_1" ON "salesreturns" ("storeId");
CREATE INDEX "salesreturns_idx_2" ON "salesreturns" ("returnNumber");
CREATE INDEX "salesreturns_idx_3" ON "salesreturns" ("storeId", "createdAt");
CREATE UNIQUE INDEX "salesreturns_idx_4" ON "salesreturns" ("returnNumber");
CREATE INDEX "shifts_idx_1" ON "shifts" ("storeId");
CREATE INDEX "shifts_idx_2" ON "shifts" ("cashierId", "status");
CREATE INDEX "shifts_idx_3" ON "shifts" ("createdAt", "storeId");
CREATE INDEX "stocklogs_idx_1" ON "stocklogs" ("storeId");
CREATE INDEX "stocklogs_idx_2" ON "stocklogs" ("productId");
CREATE INDEX "stocklogs_idx_3" ON "stocklogs" ("createdAt", "storeId");
CREATE INDEX "stocklogs_idx_4" ON "stocklogs" ("productId", "storeId");
CREATE INDEX "stocktransfers_idx_1" ON "stocktransfers" ("fromStoreId");
CREATE INDEX "stocktransfers_idx_2" ON "stocktransfers" ("toStoreId");
CREATE INDEX "stocktransfers_idx_3" ON "stocktransfers" ("transferNumber");
CREATE INDEX "stocktransfers_idx_4" ON "stocktransfers" ("fromStoreId", "status");
CREATE INDEX "stocktransfers_idx_5" ON "stocktransfers" ("toStoreId", "status");
CREATE UNIQUE INDEX "stocktransfers_idx_6" ON "stocktransfers" ("transferNumber");
CREATE INDEX "stores_idx_1" ON "stores" ("tenantId");
CREATE INDEX "subscriptionlogs_idx_1" ON "subscriptionlogs" ("tenantId");
CREATE INDEX "subscriptionlogs_idx_2" ON "subscriptionlogs" ("tenantId", "createdAt");
CREATE INDEX "suppliers_idx_1" ON "suppliers" ("storeId");
CREATE INDEX "suppliers_idx_2" ON "suppliers" ("phone", "storeId");
CREATE UNIQUE INDEX "tenants_idx_1" ON "tenants" ("ownerEmail");
CREATE INDEX "tenants_idx_2" ON "tenants" ("ownerEmail");
CREATE INDEX "tenants_idx_3" ON "tenants" ("subscriptionStatus");
CREATE INDEX "users_idx_1" ON "users" ("email");
CREATE INDEX "users_idx_2" ON "users" ("tenantId");
CREATE UNIQUE INDEX "users_idx_3" ON "users" ("email", "tenantId");
CREATE INDEX "vouchers_idx_1" ON "vouchers" ("storeId");
CREATE UNIQUE INDEX "vouchers_idx_2" ON "vouchers" ("code");
CREATE INDEX "vouchers_idx_3" ON "vouchers" ("storeId", "code");
