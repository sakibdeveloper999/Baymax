import React, { useEffect } from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';
import ScanInput from './components/ScanInput';
import Cart from './components/Cart';
import StatusIndicator from './components/StatusIndicator';
import useCartStore from './store/cartSlice';
import localDB from './db/localdb';
import syncService from './utils/sync';

function App() {
    const { t } = useTranslation();
    const itemCount = useCartStore((state) => state.getItemCount());
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

    const handleCheckout = () => {
        if (itemCount === 0) {
            alert('Cart is empty!');
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

                        {/* Checkout Section */}
                        <div className="card mt-6 bg-gradient-to-r from-primary to-secondary text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90">{t('items_in_cart')}</p>
                                    <p className="text-3xl font-bold">{itemCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-90">{t('total')}</p>
                                    <p className="text-3xl font-bold">৳{total.toFixed(2)}</p>
                                </div>
                                <div className="flex gap-3">
                                    {itemCount > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="px-4 py-2 bg-white text-red-500 rounded-lg font-semibold hover:bg-gray-100 transition"
                                        >
                                            {t('clear_cart')}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={itemCount === 0}
                                        className="btn-primary px-6 py-2 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                                    >
                                        {t('checkout')} →
                                    </button>
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
