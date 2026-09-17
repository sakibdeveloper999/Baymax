import React, { useState } from 'react';

export default function Reports() {
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState('today');

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
            </div>

            {/* Report Selection */}
            <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500"
                    >
                        <option value="sales">Sales Report</option>
                        <option value="inventory">Inventory Report</option>
                        <option value="customers">Customer Report</option>
                        <option value="profitability">Profitability Report</option>
                        <option value="top-products">Top Products</option>
                        <option value="category">Category Analysis</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500"
                    >
                        <option value="today">Today</option>
                        <option value="this-week">This Week</option>
                        <option value="this-month">This Month</option>
                        <option value="this-year">This Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
            </div>

            {/* Report Type: Sales */}
            {reportType === 'sales' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-6 text-white">
                            <p className="text-primary-100 text-sm">Today's Sales</p>
                            <p className="text-3xl font-bold">$4,290</p>
                            <p className="text-primary-200 text-xs mt-2">42 orders</p>
                        </div>
                        <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-lg shadow p-6 text-white">
                            <p className="text-success-100 text-sm">This Week</p>
                            <p className="text-3xl font-bold">$28,450</p>
                            <p className="text-success-200 text-xs mt-2">+12% vs last week</p>
                        </div>
                        <div className="bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg shadow p-6 text-white">
                            <p className="text-warning-100 text-sm">This Month</p>
                            <p className="text-3xl font-bold">$95,230</p>
                            <p className="text-warning-200 text-xs mt-2">+8% vs last month</p>
                        </div>
                        <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-lg shadow p-6 text-white">
                            <p className="text-primary-200 text-sm">Net Profit</p>
                            <p className="text-3xl font-bold">$15,320</p>
                            <p className="text-primary-300 text-xs mt-2">16% margin</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-600 mb-2">Daily Sales Trend</p>
                                <p className="text-5xl text-gray-300">📊</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-600 mb-2">Payment Methods Distribution</p>
                                <p className="text-5xl text-gray-300">📈</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Type: Inventory */}
            {reportType === 'inventory' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm">Total SKUs</p>
                            <p className="text-3xl font-bold text-gray-900">127</p>
                            <p className="text-gray-600 text-xs mt-2">across 4 categories</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm">Inventory Value</p>
                            <p className="text-3xl font-bold text-primary-600">$45,320</p>
                            <p className="text-gray-600 text-xs mt-2">+5% vs last month</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm">Stock Turnover</p>
                            <p className="text-3xl font-bold text-success-600">8.3x</p>
                            <p className="text-gray-600 text-xs mt-2">per month</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Low Stock Items</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Flour 1kg', stock: 12, minStock: 25 },
                                { name: 'Salt 500g', stock: 18, minStock: 20 },
                                { name: 'Sugar 2kg', stock: 28, minStock: 30 },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-danger-50 border-l-4 border-danger-600 rounded">
                                    <span className="font-medium text-gray-900">{item.name}</span>
                                    <span className="text-danger-600 font-bold">{item.stock} / {item.minStock}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Report Type: Customers */}
            {reportType === 'customers' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm">Total Customers</p>
                            <p className="text-3xl font-bold text-gray-900">1,234</p>
                            <p className="text-success-600 text-xs mt-2">+45 new this month</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm">Repeat Rate</p>
                            <p className="text-3xl font-bold text-primary-600">62%</p>
                            <p className="text-gray-600 text-xs mt-2">repeat customers</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm">Avg Customer Value</p>
                            <p className="text-3xl font-bold text-success-600">$245</p>
                            <p className="text-gray-600 text-xs mt-2">lifetime value</p>
                        </div>
                    </div>
                </div>
            )}

            {reportType === 'profitability' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Profit Metrics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between pb-2 border-b">
                                <span className="text-gray-700">Revenue</span>
                                <span className="font-bold text-gray-900">$95,230</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                                <span className="text-gray-700">Cost of Goods Sold</span>
                                <span className="font-bold text-gray-900">$67,450</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                                <span className="text-gray-700">Gross Profit</span>
                                <span className="font-bold text-success-600">$27,780</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="font-bold text-gray-900">Profit Margin</span>
                                <span className="font-bold text-primary-600">29.2%</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-600 mb-2">Profit Trend (30 Days)</p>
                            <p className="text-5xl text-gray-300">📊</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
