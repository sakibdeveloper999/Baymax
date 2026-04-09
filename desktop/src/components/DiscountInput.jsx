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
        let amount = parseFloat(inputValue) || 0;
        amount = Math.max(0, amount);
        if (selectedType === 'percentage') {
            amount = Math.min(100, amount);
        }
        setDiscount(amount, selectedType);
        setIsOpen(false);
    };
    const handleClear = () => {
        setDiscount(0, selectedType);
        setInputValue('');
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 active:scale-95 shadow-md"
            >
                🏷️ {discount > 0 ? `${discount}${discountType === 'percentage' ? '%' : '৳'}` : t('discount')}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border-4 border-green-400 rounded-xl shadow-2xl p-6 w-80 z-50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-lg text-gray-800">🏷️ {t('discount')}</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex gap-3 mb-5 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setSelectedType('percentage')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-black transition transform ${selectedType === 'percentage'
                                ? 'bg-blue-500 text-white shadow-lg scale-105'
                                : 'bg-transparent text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            % {t('percent')}
                        </button>
                        <button
                            onClick={() => setSelectedType('fixed')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-black transition transform ${selectedType === 'fixed'
                                ? 'bg-blue-500 text-white shadow-lg scale-105'
                                : 'bg-transparent text-gray-700 hover:bg-gray-200'
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
                        className="w-full mb-4 p-3 border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg font-bold text-lg"
                        min="0"
                        autoFocus
                    />

                    {/* Preview */}
                    {inputValue && (
                        <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg mb-5 text-center">
                            <p className="text-xs text-gray-600 uppercase font-bold">Preview</p>
                            <p className="text-2xl font-black text-green-600">
                                {selectedType === 'percentage' ? `${inputValue}%` : `৳${inputValue}`}
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleApply}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-black hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 active:scale-95"
                        >
                            ✓ {t('apply')}
                        </button>
                        <button
                            onClick={handleClear}
                            className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-black hover:bg-gray-400 transition transform hover:scale-105 active:scale-95"
                        >
                            ✕ {t('clear')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
