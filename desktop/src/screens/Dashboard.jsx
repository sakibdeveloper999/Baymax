import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const { t } = useTranslation();

    const stats = [
        { label: 'Total Sales Today', value: '$4,290', change: '+12%', icon: '💰' },
        { label: 'Orders Completed', value: '42', change: '+8%', icon: '✅' },
        { label: 'Active Customers', value: '1,234', change: '+25%', icon: '👥' },
        { label: 'Inventory Value', value: '$45,320', change: '-2%', icon: '📦' },
    ];

    const recentOrders = [
        { id: '#ORD-001', customer: 'John Doe', amount: '$120.50', status: 'Completed', time: '10:30 AM' },
        { id: '#ORD-002', customer: 'Jane Smith', amount: '$85.00', status: 'Completed', time: '10:15 AM' },
        { id: '#ORD-003', customer: 'Bob Johnson', amount: '$215.75', status: 'Pending', time: '10:00 AM' },
        { id: '#ORD-004', customer: 'Alice Williams', amount: '$65.25', status: 'Completed', time: '09:45 AM' },
        { id: '#ORD-005', customer: 'Charlie Brown', amount: '$340.00', status: 'Completed', time: '09:30 AM' },
    ];

    const topProducts = [
        { name: 'Rice 5kg', sales: 45, revenue: '$900' },
        { name: 'Oil 1L', sales: 32, revenue: '$480' },
        { name: 'Sugar 2kg', sales: 28, revenue: '$420' },
        { name: 'Flour 1kg', sales: 24, revenue: '$360' },
        { name: 'Salt 500g', sales: 18, revenue: '$135' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-success-600' : 'text-danger-600'}`}>
                                    {stat.change} from yesterday
                                </p>
                            </div>
                            <span className="text-3xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View All
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 font-semibold text-gray-700">Order ID</th>
                                    <th className="text-left py-3 font-semibold text-gray-700">Customer</th>
                                    <th className="text-left py-3 font-semibold text-gray-700">Amount</th>
                                    <th className="text-left py-3 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 font-semibold text-gray-700">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentOrders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="py-3 font-medium text-gray-900">{order.id}</td>
                                        <td className="py-3 text-gray-700">{order.customer}</td>
                                        <td className="py-3 font-semibold text-gray-900">{order.amount}</td>
                                        <td className="py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Completed'
                                                    ? 'bg-success-100 text-success-700'
                                                    : 'bg-warning-100 text-warning-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-600">{order.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Products</h2>
                    <div className="space-y-4">
                        {topProducts.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-600">{product.sales} sold</p>
                                </div>
                                <p className="font-semibold text-success-600">{product.revenue}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-2">Sales Trend (Last 7 Days)</p>
                        <p className="text-4xl text-gray-300">📊</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-2">Category Distribution</p>
                        <p className="text-4xl text-gray-300">📈</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
