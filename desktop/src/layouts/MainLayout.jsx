import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout({ children, currentScreen, onScreenChange }) {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                currentScreen={currentScreen}
                onScreenChange={onScreenChange}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
