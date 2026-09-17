import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ProductsManager() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        barcode: '',
        name: '',
        category: '',
        costPrice: '',
        sellingPrice: '',
        stock: '',
    });

    const [products, setProducts] = useState([
        { id: 1, barcode: '111001', name: 'Rice 5kg', category: 'Grains', costPrice: 150, sellingPrice: 200, stock: 45 },
        { id: 2, barcode: '111002', name: 'Oil 1L', category: 'Oils', costPrice: 100, sellingPrice: 150, stock: 30 },
        { id: 3, barcode: '111003', name: 'Sugar 2kg', category: 'Grains', costPrice: 100, sellingPrice: 150, stock: 28 },
    ]);

    const filteredProducts = products.filter(p =>
        p.barcode.includes(searchQuery) || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const newProduct = {
            id: products.length + 1,
            ...formData,
            costPrice: parseFloat(formData.costPrice),
            sellingPrice: parseFloat(formData.sellingPrice),
            stock: parseInt(formData.stock),
        };
        setProducts([...products, newProduct]);
        setFormData({ barcode: '', name: '', category: '', costPrice: '', sellingPrice: '', stock: '' });
        setShowForm(false);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product inventory</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                    ➕ Add Product
                </button>
            </div>

            {/* Add Product Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Product</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Barcode"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        />
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Grains">Grains</option>
                            <option value="Oils">Oils</option>
                            <option value="Spices">Spices</option>
                            <option value="Dairy">Dairy</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Cost Price"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Selling Price"
                            value={formData.sellingPrice}
                            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Initial Stock"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        />
                        <div className="md:col-span-3 flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-success-600 hover:bg-success-700 text-white py-2 rounded-lg font-medium transition"
                            >
                                Save Product
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by barcode or product name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                    <span className="absolute right-4 top-2.5 text-gray-400">🔍</span>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Barcode</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Cost Price</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Selling Price</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Stock</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Margin</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.map((product) => {
                                const margin = ((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(1);
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm text-gray-900">{product.barcode}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">${product.costPrice}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-primary-600">${product.sellingPrice}</td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                            <span className={`${product.stock < 20 ? 'text-danger-600' : 'text-success-600'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-success-600">{margin}%</td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-3">
                                                ✏️
                                            </button>
                                            <button className="text-danger-600 hover:text-danger-700 text-sm font-medium">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Stock Value</p>
                    <p className="text-3xl font-bold text-primary-600">
                        ${products.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0)}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Low Stock Items</p>
                    <p className="text-3xl font-bold text-warning-600">{products.filter(p => p.stock < 20).length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Avg Margin</p>
                    <p className="text-3xl font-bold text-success-600">
                        {(products.reduce((sum, p) => sum + ((p.sellingPrice - p.costPrice) / p.costPrice * 100), 0) / products.length).toFixed(1)}%
                    </p>
                </div>
            </div>
        </div>
    );
}
