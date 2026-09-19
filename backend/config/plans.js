// Default tiers from the v4 SaaS app map. Existing configured plans are never overwritten.
module.exports = [
    { name: 'basic', features: ['pos', 'products', 'categories', 'barcodes'], limits: { users: 2, products: 500, branches: 1 }, price: 19, trialDays: 7 },
    { name: 'standard', features: ['pos', 'products', 'categories', 'barcodes', 'reports', 'shifts', 'suppliers', 'purchases', 'customers', 'loyalty', 'wallet', 'vouchers'], limits: { users: 5, products: 2000, branches: 3 }, price: 49, trialDays: 14 },
    { name: 'pro', features: ['pos', 'products', 'categories', 'barcodes', 'reports', 'shifts', 'suppliers', 'purchases', 'customers', 'loyalty', 'wallet', 'vouchers', 'accounting', 'payroll', 'banking', 'multilingual', 'multicurrency'], limits: { users: -1, products: -1, branches: -1 }, price: 99, trialDays: 30 },
];
