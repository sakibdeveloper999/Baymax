import React, { useState } from 'react';

export default function CustomersManager() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', creditLimit: '' });

    const [customers, setCustomers] = useState([
        { id: 1, name: 'John Doe', phone: '555-0101', email: 'john@email.com', wallet: 500, creditLimit: 1000, totalSpent: 4500 },
        { id: 2, name: 'Jane Smith', phone: '555-0102', email: 'jane@email.com', wallet: 200, creditLimit: 2000, totalSpent: 8200 },
        { id: 3, name: 'Bob Johnson', phone: '555-0103', email: 'bob@email.com', wallet: 750, creditLimit: 1500, totalSpent: 3200 },
    ]);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const newCustomer = {
            id: customers.length + 1,
            ...formData,
            creditLimit: parseFloat(formData.creditLimit),
            wallet: 0,
            totalSpent: 0,
        };
        setCustomers([...customers, newCustomer]);
        setFormData({ name: '', phone: '', email: '', creditLimit: '' });
        setShowForm(false);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-600 mt-1">Manage customer information and loyalty</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                    ➕ Add Customer
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <input type="number" placeholder="Credit Limit" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <button type="submit" className="bg-success-600 text-white py-2 rounded-lg font-medium">Save</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Cancel</button>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <input type="text" placeholder="Search by name or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500" />
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Wallet Balance</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Credit Limit</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total Spent</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                                    <td className="px-6 py-4 text-gray-700">{customer.phone}</td>
                                    <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-success-600">${customer.wallet}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-primary-600">${customer.creditLimit}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">${customer.totalSpent}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-primary-600 hover:text-primary-700 mr-3">✏️</button>
                                        <button className="text-danger-600 hover:text-danger-700">🗑️</button>
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
                    <p className="text-gray-600 text-sm">Total Customers</p>
                    <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Wallet Balance</p>
                    <p className="text-3xl font-bold text-success-600">${customers.reduce((sum, c) => sum + c.wallet, 0)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Credit Given</p>
                    <p className="text-3xl font-bold text-warning-600">${customers.reduce((sum, c) => sum + c.creditLimit, 0)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-primary-600">${customers.reduce((sum, c) => sum + c.totalSpent, 0)}</p>
                </div>
            </div>
        </div>
    );
}
