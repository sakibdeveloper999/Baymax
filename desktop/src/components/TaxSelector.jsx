import React from 'react';
import useCartStore from '../store/cartSlice';
import { useTranslation } from 'react-i18next';

export default function TaxSelector() {
    const { t } = useTranslation();
    const { taxRate, setTaxRate } = useCartStore();

    const TAX_RATES = [
        { label: t('no_tax'), value: 0 },
        { label: '5%', value: 5 },
        { label: '10%', value: 10 },
        { label: '15%', value: 15 },
        { label: t('custom'), value: null },
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
        <div className="relative group">
            <button className="btn-primary text-sm py-2 px-3 rounded">
                💰 {t('tax')}: {taxRate}%
            </button>

            {/* Dropdown Menu */}
            <div className="hidden group-hover:block absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-50 min-w-max">
                {TAX_RATES.map((rate) => (
                    <button
                        key={rate.value !== null ? rate.value : 'custom'}
                        onClick={() => handleSelect(rate.value)}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-100 transition ${rate.value === taxRate ? 'bg-blue-200 font-bold' : ''
                            }`}
                    >
                        {rate.label}
                    </button>
                ))}
            </div>

            {/* Custom Input */}
            {showCustom && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-48 z-50">
                    <label className="text-sm font-semibold mb-2 block">{t('enter_tax_rate')}</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            min="0"
                            max="100"
                            className="input-field flex-1"
                            autoFocus
                        />
                        <span className="py-2">%</span>
                    </div>
                    <button
                        onClick={handleCustomApply}
                        className="w-full mt-2 bg-green-500 text-white py-1 px-2 rounded text-sm hover:bg-green-600"
                    >
                        {t('apply')}
                    </button>
                </div>
            )}
        </div>
    );
}
