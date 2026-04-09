import React, { useEffect } from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';
import ScanInput from './components/ScanInput';
import Cart from './components/Cart';
import StatusIndicator from './components/StatusIndicator';
import DiscountInput from './components/DiscountInput';
import TaxSelector from './components/TaxSelector';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import HoldOrderButton from './components/HoldOrderButton';
import useCartStore from './store/cartSlice';
import localDB from './db/localdb';
import syncService from './utils/sync';

function App() {
    const { t } = useTranslation();
    const itemCount = useCartStore((state) => state.getItemCount());
    const items = useCartStore((state) => state.getItems());
    const clearCart = useCartStore((state) => state.clearCart);
    const total = useCartStore((state) => state.getTotal());

    useEffect(() => {
        // Initialize local database and load sample products
        const initApp = async () => {
            try {
                // Check if we need to seed products
                const existingProducts = await localDB.getAllProducts();

                if (existingProducts.length === 0) {
                    // Seed sample products
                    const sampleProducts = [
                        {
                            id: '1',
                            barcode: '111001',
                            name: 'Rice 5kg',
                            category: 'Grains',
                            costPrice: 150,
                            sellingPrice: 200,
                            stock: 50,
                            unit: 'pcs',
                        },
                        {
                            id: '2',
                            barcode: '111002',
                            name: 'Oil 1L',
                            category: 'Oils',
                            costPrice: 100,
                            sellingPrice: 150,
                            stock: 30,
                            unit: 'bottle',
                        },
                        {
                            id: '3',
                            barcode: '111003',
                            name: 'Sugar 1kg',
                            category: 'Pantry',
                            costPrice: 40,
                            sellingPrice: 60,
                            stock: 100,
                            unit: 'kg',
                        },
                        {
                            id: '4',
                            barcode: '111004',
                            name: 'Salt 500g',
                            category: 'Pantry',
                            costPrice: 15,
                            sellingPrice: 25,
                            stock: 200,
                            unit: 'pcs',
                        },
                        {
                            id: '5',
                            barcode: '111005',
                            name: 'Milk 500ml',
                            category: 'Dairy',
                            costPrice: 30,
                            sellingPrice: 50,
                            stock: 60,
                            unit: 'bottle',
                        },
                    ];

                    for (const product of sampleProducts) {
                        await localDB.addProduct(product);
                    }
                    // Sample products pre-loaded
                }

                // Sync products from backend if online (non-blocking)
                // Silently fails if backend unavailable - uses cached products
                syncService.syncProducts().catch(() => {
                    // Ignore sync errors - offline-first means we use local data
                });
            } catch (error) {
                console.error('App initialization error:', error);
            }
        };

        initApp();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // F1 = Checkout
            if (e.key === 'F1') {
                e.preventDefault();
                if (itemCount > 0) {
                    alert(t('checkout_summary', { count: itemCount, total: total.toFixed(2) }));
                } alert(`Checkout: ${itemCount} items - Total: ৳${total.toFixed(2)}`);
            }
            // ESC = Clear Cart
            if (e.key === 'Escape') {
                if (itemCount > 0 && window.confirm(t('confirm_clear_cart'))) {
                    e.preventDefault();
                    clearCart();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [itemCount, total, clearCart, t]);

    const handleCheckout = () => {
        if (itemCount === 0) {
            alert(t('cart_empty_message'));
            return;
        }
        // TODO: Implement checkout (Phase 4)
        alert(`Checkout: ${itemCount} items - Total: ৳${total.toFixed(2)}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
            {/* Header */}
            <header className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-primary">{t('app_name')}</h1>
                        <StatusIndicator />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-3 gap-6">
                    {/* Left Side: Scan Input */}
                    <div className="col-span-1">
                        <ScanInput />
                    </div>

                    {/* Middle & Right: Cart Summary */}
                    <div className="col-span-2">
                        <Cart />

                        {/* Phase 3: Payment & Discount Controls */}
                        <div className="card mt-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 border-l-4 border-blue-500">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-2xl">⚙️</span>
                                <h3 className="font-bold text-xl text-gray-800">{t('payment_settings')}</h3>
                            </div>

                            {/* Tax & Discount Row */}
                            <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b-2 border-gray-200">
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition">
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">💰 {t('tax')}</label>
                                    <TaxSelector />
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-400 transition">
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">🏷️ {t('discount')}</label>
                                    <DiscountInput />
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">💳 {t('payment_method')}</label>
                                <PaymentMethodSelector />
                            </div>
                        </div>

                        {/* Checkout & Action Buttons */}
                        <div className="card mt-6 bg-gradient-to-r from-primary via-blue-600 to-secondary text-white shadow-2xl overflow-hidden">
                            {/* Summary row */}
                            <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-white border-opacity-30">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3 min-w-max">
                                        <p className="text-sm opacity-80">{t('items_in_cart')}</p>
                                        <p className="text-4xl font-black">{itemCount}</p>
                                    </div>
                                    <div className="hidden sm:block text-opacity-80 text-sm">
                                        {itemCount > 0 && (
                                            <p className="opacity-75">
                                                🛒 {itemCount} {t('items')} • {items.reduce((sum, item) => sum + item.quantity, 0)} {t('units')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3 min-w-max text-right">
                                    <p className="text-sm opacity-80">{t('total')}</p>
                                    <p className="text-4xl font-black">৳{total.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                {/* Primary Action Buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    {itemCount > 0 && (
                                        <button
                                            onClick={clearCart}
                                            title="ESC"
                                            className="col-span-1 px-4 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 shadow-md"
                                        >
                                            ✕ {t('clear_cart')}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={itemCount === 0}
                                        title="F1"
                                        className={`${itemCount > 0 ? 'col-span-2' : 'col-span-3'} px-6 py-4 bg-white text-primary font-black text-lg rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md`}
                                    >
                                        💳 {t('checkout')} →
                                    </button>
                                </div>

                                {/* Hold Button - Full Width */}
                                <HoldOrderButton />

                                {/* Keyboard Shortcuts Info */}
                                <div className="text-xs opacity-90 bg-white bg-opacity-15 backdrop-blur-md p-4 rounded-xl border border-white border-opacity-30 flex items-center justify-between hover:bg-opacity-20 transition-all duration-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">⌨️</span>
                                        <span className="font-semibold">{t('keyboard_shortcuts')}</span>
                                    </div>
                                    <div className="text-right text-xs font-medium opacity-95 space-y-1">
                                        <div className="flex gap-6 justify-end">
                                            <span className="flex items-center gap-1"><kbd className="bg-white bg-opacity-20 px-2 py-1 rounded-md">F1</kbd> = {t('checkout')}</span>
                                            <span className="flex items-center gap-1"><kbd className="bg-white bg-opacity-20 px-2 py-1 rounded-md">ESC</kbd> = {t('clear_cart')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
