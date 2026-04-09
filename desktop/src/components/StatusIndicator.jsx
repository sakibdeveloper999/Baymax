import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import syncService from '../utils/sync';

function StatusIndicator() {
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState('online');

    useEffect(() => {
        // Update status on mount and when it changes
        setStatus(syncService.getStatus());

        const handleOnline = () => setStatus('online');
        const handleOffline = () => setStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const isOffline = status === 'offline';

    const toggleLanguage = () => {
        const languages = ['en', 'bn', 'ar'];
        const currentIndex = languages.indexOf(i18n.language);
        const nextIndex = (currentIndex + 1) % languages.length;
        i18n.changeLanguage(languages[nextIndex]);
    };

    const getLanguageLabel = () => {
        switch (i18n.language) {
            case 'en':
                return '🇬🇧 EN';
            case 'bn':
                return '🇧🇩 বাং';
            case 'ar':
                return '🇸🇦 العر';
            default:
                return '🇬🇧 EN';
        }
    };

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <div
                    className={`w-3 h-3 rounded-full ${isOffline ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                        }`}
                />
                <span className="text-sm font-semibold">
                    {isOffline ? t('offline_mode') : t('online_mode')}
                </span>
            </div>

            {/* Language Toggle - Cycles through EN → Bengali → Arabic */}
            <button
                onClick={toggleLanguage}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm font-semibold transition"
                title="Click to change language"
            >
                {getLanguageLabel()}
            </button>
        </div>
    );
}

export default StatusIndicator;
