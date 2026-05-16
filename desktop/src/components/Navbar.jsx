import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Navbar({ onSidebarToggle }) {
    const { t, i18n } = useTranslation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        ☰
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Baymax OmniPOS</h2>
                        <p className="text-xs text-gray-500">Multi-Tenant SaaS v4.0</p>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${i18n.language === 'en'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => changeLanguage('ar')}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${i18n.language === 'ar'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            AR
                        </button>
                        <button
                            onClick={() => changeLanguage('bn')}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${i18n.language === 'bn'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            BN
                        </button>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        🔔
                        <span className="absolute top-0 right-0 w-2 h-2 bg-danger-500 rounded-full"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                A
                            </div>
                            <span className="text-sm font-medium text-gray-700">Admin</span>
                            <span className="text-xs text-gray-500">▼</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <a href="#" className="block px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-200">
                                    👤 My Profile
                                </a>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-200">
                                    🏢 Store Settings
                                </a>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-200">
                                    📱 Mobile Login
                                </a>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-50 text-sm text-danger-600">
                                    🚪 Logout
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
