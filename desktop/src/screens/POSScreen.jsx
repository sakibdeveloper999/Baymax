import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCartStore from '../store/cartSlice';

export default function POSScreen() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const items = useCartStore((state) => state.getItems());
    const addToCart = useCartStore((state) => state.addItem);
    const removeFromCart = useCartStore((state) => state.removeItem);
    const total = useCartStore((state) => state.getTotal());

    const products = [
        { id: 1, name: 'Rice 5kg', category: 'Grains', price: 200, barcode: '111001' },
        { id: 2, name: 'Oil 1L', category: 'Oils', price: 150, barcode: '111002' },
        { id: 3, name: 'Sugar 2kg', category: 'Grains', price: 150, barcode: '111003' },
        { id: 4, name: 'Flour 1kg', category: 'Grains', price: 120, barcode: '111004' },
        { id: 5, name: 'Salt 500g', category: 'Spices', price: 75, barcode: '111005' },
        { id: 6, name: 'Milk 1L', category: 'Dairy', price: 100, barcode: '111006' },
        { id: 7, name: 'Butter 250g', category: 'Dairy', price: 200, barcode: '111007' },
        { id: 8, name: 'Eggs 12pcs', category: 'Dairy', price: 180, barcode: '111008' },
    ];

    const categories = ['All', 'Grains', 'Oils', 'Spices', 'Dairy'];

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode.includes(searchQuery);
        const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    return (
        <div className="p-6 space-y-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
                <div className="text-sm text-gray-600">
                    <span>Store: Main Branch</span> | <span>Cashier: Admin</span>
                </div>
            </div>

            {/* Main Grid: Products + Cart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
                {/* Products Section */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                    {/* Search & Filter */}
                    <div className="bg-white rounded-lg shadow p-4 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Scan barcode or search product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-primary-500 rounded-lg focus:outline-none focus:border-primary-600 text-lg"
                                autoFocus
                            />
                            <span className="absolute right-4 top-3 text-gray-400">🔍</span>
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${selectedCategory === cat
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition bg-white"
                                >
                                    <div className="text-3xl mb-2">📦</div>
                                    <p className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</p>
                                    <p className="text-xs text-gray-600 mt-1">{product.category}</p>
                                    <p className="text-lg font-bold text-primary-600 mt-2">${product.price}</p>
                                    <p className="text-xs text-gray-500 mt-1">{product.barcode}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart Section */}
                <div className="bg-white rounded-lg shadow flex flex-col">
                    {/* Cart Header */}
                    <div className="bg-primary-600 text-white p-4 rounded-t-lg">
                        <h2 className="text-lg font-bold">Shopping Cart</h2>
                        <p className="text-primary-200 text-sm">Items: {items.length}</p>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {items.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-gray-500">
                                <div className="text-center">
                                    <p className="text-3xl mb-2">🛒</p>
                                    <p>Cart is empty</p>
                                </div>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-600">${item.sellingPrice} x {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-primary-600">${(item.sellingPrice * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="flex-1 px-2 py-1 bg-danger-500 hover:bg-danger-600 text-white text-xs rounded transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Summary */}
                    <div className="border-t border-gray-200 p-4 space-y-3">
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (10%):</span>
                                <span className="font-semibold text-gray-900">${(total * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between text-lg">
                                <span className="font-bold text-gray-900">Total:</span>
                                <span className="font-bold text-primary-600">${(total * 1.1).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button className="w-full bg-success-600 hover:bg-success-700 text-white py-3 rounded-lg font-bold transition text-lg">
                                💳 Complete Payment
                            </button>
                            <button className="w-full bg-warning-500 hover:bg-warning-600 text-white py-2 rounded-lg font-medium transition">
                                ⏸️ Hold Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
