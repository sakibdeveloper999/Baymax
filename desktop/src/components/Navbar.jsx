import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Navbar({ onSidebarToggle }) {
    const { i18n } = useTranslation();
    return <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4"><button aria-label="Toggle navigation" onClick={onSidebarToggle} className="p-2 hover:bg-gray-100 rounded">?</button><h2 className="text-lg font-semibold">Baymax OmniPOS</h2></div>
            <div className="flex gap-2" aria-label="Language">{['en', 'ar', 'bn'].map(language => <button key={language} onClick={() => i18n.changeLanguage(language)} className={i18n.language === language ? 'btn-primary' : 'btn-outline'}>{language.toUpperCase()}</button>)}</div>
        </div>
    </header>;
}
