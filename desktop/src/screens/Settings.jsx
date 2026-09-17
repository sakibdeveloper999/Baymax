import React, { useState } from 'react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({
        storeName: 'Main Branch',
        storeAddress: '123 Market St, City',
        storePhone: '+1-555-0100',
        storeEmail: 'store@baymax.local',
        taxRate: 10,
        currency: 'USD',
        timezone: 'UTC-5',
        receiptFooter: 'Thank you for shopping!',
        notificationEmail: 'admin@baymax.local',
        dailyBackup: true,
        twoFactorAuth: false,
        language: 'en',
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage store configuration and preferences</p>
            </div>

            {/* Notification */}
            {saved && (
                <div className="bg-success-50 border-l-4 border-success-600 p-4 rounded flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <p className="text-success-700 font-medium">Settings saved successfully!</p>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-4">
                    {[
                        { id: 'general', label: 'General Settings' },
                        { id: 'store', label: 'Store Information' },
                        { id: 'billing', label: 'Billing & Tax' },
                        { id: 'security', label: 'Security' },
                        { id: 'integrations', label: 'Integrations' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium transition border-b-2 ${activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="en">English</option>
                                    <option value="ar">Arabic</option>
                                    <option value="bn">Bengali</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                <select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="UTC-5">UTC-5 (Eastern)</option>
                                    <option value="UTC+0">UTC+0 (GMT)</option>
                                    <option value="UTC+3">UTC+3 (EAT)</option>
                                    <option value="UTC+5">UTC+5 (Pakistan)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="PKR">PKR (₨)</option>
                                    <option value="BDT">BDT (৳)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Automatic Backup</label>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={formData.dailyBackup} onChange={(e) => setFormData({ ...formData, dailyBackup: e.target.checked })} className="w-4 h-4" />
                                    <span className="text-gray-700">Enable automatic daily backups</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Store Information */}
                {activeTab === 'store' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                            <input type="text" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea value={formData.storeAddress} onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input type="tel" value={formData.storePhone} onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" value={formData.storeEmail} onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Footer Text</label>
                            <textarea value={formData.receiptFooter} onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="2"></textarea>
                        </div>
                    </div>
                )}

                {/* Billing & Tax */}
                {activeTab === 'billing' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                            <input type="number" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" step="0.1" min="0" />
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-700"><strong>Note:</strong> Tax will be automatically calculated on all sales using the rate specified above.</p>
                        </div>
                    </div>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-sm text-gray-600">Require 2FA for all logins</p>
                                    </div>
                                    <input type="checkbox" checked={formData.twoFactorAuth} onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })} className="w-4 h-4" />
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="font-medium text-gray-900 mb-2">Change Password</p>
                                    <input type="password" placeholder="Current password" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
                                    <input type="password" placeholder="New password" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
                                    <input type="password" placeholder="Confirm password" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
                                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700">Update Password</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Integrations */}
                {activeTab === 'integrations' && (
                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-bold text-gray-900 mb-2">Backend API Connection</h3>
                            <p className="text-sm text-gray-600 mb-3">Connected to MongoDB Atlas - Multi-tenant SaaS v4.0</p>
                            <button className="bg-success-600 text-white px-4 py-2 rounded-lg text-sm font-medium">✅ Connected</button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-bold text-gray-900 mb-2">Email Service</h3>
                            <p className="text-sm text-gray-600 mb-3">Configure email for receipts and notifications</p>
                            <input type="email" placeholder="Notification email" value={formData.notificationEmail} onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="mt-6 flex gap-4">
                    <button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition">
                        💾 Save Changes
                    </button>
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
