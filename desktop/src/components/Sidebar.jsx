import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Sidebar({ isOpen, onToggle, currentScreen, onScreenChange }) {
    const { t } = useTranslation();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null },
        { id: 'pos', label: 'POS', icon: '🛒', badge: null },
        { id: 'products', label: 'Products', icon: '📦', badge: null },
        { id: 'categories', label: 'Categories', icon: '🏷️', badge: null },
        { id: 'customers', label: 'Customers', icon: '👥', badge: null },
        { id: 'suppliers', label: 'Suppliers', icon: '🏭', badge: null },
        { id: 'orders', label: 'Orders', icon: '📋', badge: null },
        { id: 'inventory', label: 'Inventory', icon: '📈', badge: null },
        { id: 'reports', label: 'Reports', icon: '📑', badge: null },
        { id: 'settings', label: 'Settings', icon: '⚙️', badge: null },
    ];

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-primary-700 to-primary-900 text-white transition-all duration-300 ease-in-out flex flex-col`}>
            {/* Logo */}
            <div className="p-4 flex items-center justify-between">
                {isOpen && <h1 className="text-xl font-bold">Baymax POS</h1>}
                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-primary-600 rounded-lg transition"
                >
                    {isOpen ? '◀' : '▶'}
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-2 p-4">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => onScreenChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentScreen === item.id
                                        ? 'bg-primary-500 shadow-lg'
                                        : 'hover:bg-primary-600'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {isOpen && (
                                    <>
                                        <span className="flex-1 text-left">{item.label}</span>
                                        {item.badge && (
                                            <span className="bg-danger-500 text-white text-xs px-2 py-1 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-primary-600">
                {isOpen && (
                    <div className="text-sm">
                        <p className="font-semibold">v4.0 SaaS</p>
                        <p className="text-primary-200 text-xs">Multi-Tenant</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
