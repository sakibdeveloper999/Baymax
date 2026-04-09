import React from 'react';
import useCartStore from '../store/cartSlice';
import { useTranslation } from 'react-i18next';

export default function TaxSelector() {
    const { t } = useTranslation();
    const { taxRate, setTaxRate } = useCartStore();

    const TAX_RATES = [
        { label: t('no_tax'), value: 0, icon: '✓' },
        { label: '5%', value: 5, icon: '📍' },
        { label: '10%', value: 10, icon: '📍' },
        { label: '15%', value: 15, icon: '📍' },
        { label: t('custom'), value: null, icon: '⚙️' },
    ];

    const [showCustom, setShowCustom] = React.useState(false);
    const [customValue, setCustomValue] = React.useState(taxRate);

    const handleSelect = (rate) => {
        if (rate !== null) {
            setTaxRate(rate);
            setShowCustom(false);
            setCustomValue(rate);
        } else {
            setShowCustom(true);
        }
    };

    const handleCustomApply = () => {
        const value = parseFloat(customValue) || 0;
        setTaxRate(Math.max(0, Math.min(100, value)));
        setShowCustom(false);
    };

    return (
        <div className="relative w-full">
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 active:scale-95 shadow-md">
                💰 {t('tax')}: {taxRate}%
            </button>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-3 bg-white border-4 border-blue-400 rounded-xl shadow-2xl py-2 z-50 min-w-max divide-y-2 divide-gray-200">
                {TAX_RATES.map((rate) => (
                    <button
                        key={rate.value !== null ? rate.value : 'custom'}
                        onClick={() => handleSelect(rate.value)}
                        className={`w-full text-left px-5 py-3 transition transform hover:scale-105 font-semibold flex items-center justify-between ${rate.value === taxRate
                                ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                                : 'hover:bg-gray-100 text-gray-800'
                            }`}
                    >
                        <span>{rate.label}</span>
                        {rate.value === taxRate && <span className="text-xl">✓</span>}
                    </button>
                ))}
            </div>

            {/* Custom Input */}
            {showCustom && (
                <div className="absolute top-full left-0 mt-3 bg-white border-4 border-blue-400 rounded-xl shadow-2xl p-6 w-64 z-50">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-lg font-black text-gray-800">⚙️ {t('enter_tax_rate')}</label>
                        <button
                            onClick={() => setShowCustom(false)}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="number"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            min="0"
                            max="100"
                            className="flex-1 p-3 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg font-bold text-lg"
                            autoFocus
                        />
                        <span className="py-3 px-3 bg-blue-100 rounded-lg font-black text-blue-600">%</span>
                    </div>

                    <button
                        onClick={handleCustomApply}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-black hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 active:scale-95"
                    >
                        ✓ {t('apply')}
                    </button>
                </div>
            )}
        </div>
    );
}
