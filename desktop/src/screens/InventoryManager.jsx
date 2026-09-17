import React from 'react';

export default function InventoryManager() {
    const products = [
        { id: 1, barcode: '111001', name: 'Rice 5kg', category: 'Grains', stock: 45, minStock: 20, value: 9000 },
        { id: 2, barcode: '111002', name: 'Oil 1L', category: 'Oils', stock: 30, minStock: 15, value: 4500 },
        { id: 3, barcode: '111003', name: 'Sugar 2kg', category: 'Grains', stock: 28, minStock: 20, value: 4200 },
        { id: 4, barcode: '111004', name: 'Flour 1kg', category: 'Grains', stock: 12, minStock: 25, value: 1440 },
        { id: 5, barcode: '111005', name: 'Salt 500g', category: 'Spices', stock: 18, minStock: 15, value: 1350 },
    ];

    const lowStockItems = products.filter(p => p.stock < p.minStock);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
                <p className="text-gray-600 mt-1">Monitor stock levels and inventory value</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total SKUs</p>
                    <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Stock Value</p>
                    <p className="text-3xl font-bold text-primary-600">${products.reduce((sum, p) => sum + p.value, 0)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Low Stock Items</p>
                    <p className="text-3xl font-bold text-danger-600">{lowStockItems.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Avg Stock Level</p>
                    <p className="text-3xl font-bold text-success-600">
                        {(products.reduce((sum, p) => sum + p.stock, 0) / products.length).toFixed(0)}
                    </p>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-danger-50 border-l-4 border-danger-600 p-4 rounded">
                    <h3 className="font-bold text-danger-800 mb-2">⚠️ Low Stock Alert</h3>
                    <p className="text-sm text-danger-700 mb-3">{lowStockItems.length} product(s) need restocking</p>
                    <div className="space-y-2">
                        {lowStockItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <span className="text-danger-600 font-bold">{item.stock} / {item.minStock}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Barcode</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Current Stock</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Min Stock</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Stock Value</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => {
                                const isLowStock = product.stock < product.minStock;
                                return (
                                    <tr key={product.id} className={isLowStock ? 'bg-danger-50' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{product.barcode}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-900">{product.stock}</td>
                                        <td className="px-6 py-4 text-center text-gray-700">{product.minStock}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-primary-600">${product.value}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${isLowStock ? 'bg-danger-100 text-danger-700' : 'bg-success-100 text-success-700'
                                                }`}>
                                                {isLowStock ? 'Low Stock' : 'Good'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                                📦
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
