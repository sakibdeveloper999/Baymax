import React, { useState } from 'react';

export default function OrdersManager() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [orders, setOrders] = useState([
        { id: '#ORD-001', customer: 'John Doe', amount: 120.50, status: 'Completed', date: '2024-05-16 10:30 AM', items: 5, paymentMethod: 'Cash' },
        { id: '#ORD-002', customer: 'Jane Smith', amount: 85.00, status: 'Completed', date: '2024-05-16 10:15 AM', items: 3, paymentMethod: 'Card' },
        { id: '#ORD-003', customer: 'Bob Johnson', amount: 215.75, status: 'Pending', date: '2024-05-16 10:00 AM', items: 8, paymentMethod: 'Credit' },
        { id: '#ORD-004', customer: 'Alice Williams', amount: 65.25, status: 'Completed', date: '2024-05-16 09:45 AM', items: 2, paymentMethod: 'Cash' },
        { id: '#ORD-005', customer: 'Charlie Brown', amount: 340.00, status: 'Completed', date: '2024-05-16 09:30 AM', items: 12, paymentMethod: 'Card' },
    ]);

    const filteredOrders = orders.filter(o => {
        const matchSearch = o.id.includes(searchQuery) || o.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === 'All' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-success-100 text-success-700';
            case 'Pending': return 'bg-warning-100 text-warning-700';
            case 'Cancelled': return 'bg-danger-100 text-danger-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-1">View and manage all customer orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Order ID or customer name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500"
                        >
                            <option value="All">All Orders</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition">
                            📥 Export Orders
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Items</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-bold text-primary-600">{order.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer}</td>
                                    <td className="px-6 py-4 text-center text-gray-700">{order.items}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">${order.amount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{order.paymentMethod}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mr-3">👁️</button>
                                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">🧾</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Orders Today</p>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Completed Orders</p>
                    <p className="text-3xl font-bold text-success-600">{orders.filter(o => o.status === 'Completed').length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Revenue Today</p>
                    <p className="text-3xl font-bold text-primary-600">${orders.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Avg Order Value</p>
                    <p className="text-3xl font-bold text-warning-600">${(orders.reduce((sum, o) => sum + o.amount, 0) / orders.length).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
