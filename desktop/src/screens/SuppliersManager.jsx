import React, { useState } from 'react';

export default function SuppliersManager() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', company: '', phone: '', email: '' });

    const [suppliers, setSuppliers] = useState([
        { id: 1, name: 'Ahmed Al-Mansouri', company: 'Al-Mansouri Trading', phone: '555-2001', email: 'ahmed@mansouri.com', payables: 5000, lastOrder: '2024-05-15' },
        { id: 2, name: 'Fatima Khan', company: 'Khan Wholesale', phone: '555-2002', email: 'fatima@khan.com', payables: 3200, lastOrder: '2024-05-14' },
        { id: 3, name: 'Hassan Ibrahim', company: 'Ibrahim Foods', phone: '555-2003', email: 'hassan@ibrahim.com', payables: 7500, lastOrder: '2024-05-16' },
    ]);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const newSupplier = { id: suppliers.length + 1, ...formData, payables: 0, lastOrder: new Date().toISOString().split('T')[0] };
        setSuppliers([...suppliers, newSupplier]);
        setFormData({ name: '', company: '', phone: '', email: '' });
        setShowForm(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
                    <p className="text-gray-600 mt-1">Manage supplier information and payables</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition">
                    ➕ Add Supplier
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Contact Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <input type="text" placeholder="Company Name" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                        <button type="submit" className="bg-success-600 text-white py-2 rounded-lg font-medium">Save</button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Cancel</button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-4">
                <input type="text" placeholder="Search by name or company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500" />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Company</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Payables</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Order</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{supplier.name}</td>
                                    <td className="px-6 py-4 text-gray-700">{supplier.company}</td>
                                    <td className="px-6 py-4 text-gray-700">{supplier.phone}</td>
                                    <td className="px-6 py-4 text-gray-600">{supplier.email}</td>
                                    <td className="px-6 py-4 text-right font-bold text-danger-600">${supplier.payables}</td>
                                    <td className="px-6 py-4 text-gray-600">{supplier.lastOrder}</td>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Suppliers</p>
                    <p className="text-3xl font-bold text-gray-900">{suppliers.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Total Payables</p>
                    <p className="text-3xl font-bold text-danger-600">${suppliers.reduce((sum, s) => sum + s.payables, 0)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-600 text-sm">Active Suppliers</p>
                    <p className="text-3xl font-bold text-success-600">{suppliers.length}</p>
                </div>
            </div>
        </div>
    );
}
