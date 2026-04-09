import React, { useState } from 'react';
import useCartStore from '../store/cartSlice';
import { useTranslation } from 'react-i18next';

export default function DiscountInput() {
    const { t } = useTranslation();
    const { discount, discountType, setDiscount } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(discount || '');
    const [selectedType, setSelectedType] = useState(discountType);

    const handleApply = () => {
        const amount = parseFloat(inputValue) || 0;
        setDiscount(Math.max(0, amount), selectedType);
        setIsOpen(false);
    };

    const handleClear = () => {
        setDiscount(0, selectedType);
        setInputValue('');
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-primary text-sm py-2 px-3 rounded"
            >
                🏷️ {discount > 0 ? `${discount}${selectedType === 'percentage' ? '%' : '৳'}` : t('discount')}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64 z-50">
                    <h3 className="font-bold mb-3 text-gray-800">{t('discount')}</h3>

                    {/* Type Toggle */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setSelectedType('percentage')}
                            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${selectedType === 'percentage'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            % {t('percent')}
                        </button>
                        <button
                            onClick={() => setSelectedType('fixed')}
                            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${selectedType === 'fixed'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ৳ {t('fixed')}
                        </button>
                    </div>

                    {/* Input */}
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Enter ${selectedType === 'percentage' ? 'percentage' : 'amount'}`}
                        className="input-field w-full mb-4"
                        min="0"
                        autoFocus
                    />

                    {/* Preview */}
                    {inputValue && (
                        <div className="text-sm text-gray-600 mb-4">
                            {t('discount_amount')}: {selectedType === 'percentage' ? `${inputValue}%` : `৳${inputValue}`}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleApply}
                            className="flex-1 bg-green-500 text-white py-2 px-3 rounded font-medium hover:bg-green-600 transition"
                        >
                            {t('apply')}
                        </button>
                        <button
                            onClick={handleClear}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded font-medium hover:bg-gray-400 transition"
                        >
                            {t('clear')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
