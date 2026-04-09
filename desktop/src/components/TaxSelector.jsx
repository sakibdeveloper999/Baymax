import React, { useState, useRef, useEffect } from 'react';
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

    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(() => {
        // Set initial focused index to current tax rate
        return TAX_RATES.findIndex(rate => rate.value === taxRate);
    });
    const [showCustom, setShowCustom] = useState(false);
    const [customValue, setCustomValue] = useState(taxRate);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const menuItemsRef = useRef([]);

    // Handle selection and close menu
    const handleSelect = (rate) => {
        if (rate !== null) {
            setTaxRate(rate);
            setShowCustom(false);
            setCustomValue(rate);
        } else {
            setShowCustom(true);
        }
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const handleCustomApply = () => {
        const value = parseFloat(customValue) || 0;
        setTaxRate(Math.max(0, Math.min(100, value)));
        setShowCustom(false);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const handleCustomCancel = () => {
        setCustomValue('');
        setShowCustom(false);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    // Handle keyboard navigation on toggle button
    const handleButtonKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (!isOpen) {
                setFocusedIndex(TAX_RATES.findIndex(rate => rate.value === taxRate));
                // Focus the first/selected item when menu opens
                setTimeout(() => {
                    menuItemsRef.current[focusedIndex]?.focus();
                }, 0);
            }
        } else if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
            setFocusedIndex(TAX_RATES.findIndex(rate => rate.value === taxRate));
            setTimeout(() => {
                menuItemsRef.current[focusedIndex]?.focus();
            }, 0);
        }
    };

    // Handle keyboard navigation within menu
    const handleMenuItemKeyDown = (e, index) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                handleSelect(TAX_RATES[index].value);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = index + 1 < TAX_RATES.length ? index + 1 : 0;
                setFocusedIndex(nextIndex);
                setTimeout(() => {
                    menuItemsRef.current[nextIndex]?.focus();
                }, 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = index - 1 >= 0 ? index - 1 : TAX_RATES.length - 1;
                setFocusedIndex(prevIndex);
                setTimeout(() => {
                    menuItemsRef.current[prevIndex]?.focus();
                }, 0);
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                buttonRef.current?.focus();
                break;
            case 'Home':
                e.preventDefault();
                setFocusedIndex(0);
                setTimeout(() => {
                    menuItemsRef.current[0]?.focus();
                }, 0);
                break;
            case 'End':
                e.preventDefault();
                const lastIndex = TAX_RATES.length - 1;
                setFocusedIndex(lastIndex);
                setTimeout(() => {
                    menuItemsRef.current[lastIndex]?.focus();
                }, 0);
                break;
            default:
                break;
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Handle Escape key for custom input
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && showCustom) {
                e.preventDefault();
                handleCustomCancel();
            }
        };
        if (showCustom) {
            document.addEventListener('keydown', handleEscapeKey);
            return () => document.removeEventListener('keydown', handleEscapeKey);
        }
    }, [showCustom]);

    return (
        <div className="relative w-full">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleButtonKeyDown}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                💰 {t('tax')}: {taxRate}%
            </button>

            {/* Accessible Dropdown Menu */}
            {isOpen && !showCustom && (
                <div
                    ref={menuRef}
                    role="menu"
                    className="absolute top-full left-0 mt-3 bg-white border-4 border-blue-400 rounded-xl shadow-2xl py-2 z-50 min-w-max divide-y-2 divide-gray-200"
                >
                    {TAX_RATES.map((rate, index) => (
                        <button
                            key={rate.value !== null ? rate.value : 'custom'}
                            ref={(el) => (menuItemsRef.current[index] = el)}
                            onClick={() => handleSelect(rate.value)}
                            onKeyDown={(e) => handleMenuItemKeyDown(e, index)}
                            role="menuitem"
                            aria-selected={rate.value === taxRate}
                            className={`w-full text-left px-5 py-3 transition transform hover:scale-105 font-semibold flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-300 ${rate.value === taxRate
                                ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                                : 'hover:bg-gray-100 text-gray-800'
                                }`}
                            tabIndex={index === focusedIndex ? 0 : -1}
                        >
                            <span>{rate.label}</span>
                            {rate.value === taxRate && <span className="text-xl">✓</span>}
                        </button>
                    ))}
                </div>
            )}
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

                    <div className="flex gap-2">
                        <button
                            onClick={handleCustomApply}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-black hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 active:scale-95"
                        >
                            ✓ {t('apply')}
                        </button>
                        <button
                            onClick={handleCustomCancel}
                            className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-4 rounded-lg font-black hover:from-gray-500 hover:to-gray-600 transition transform hover:scale-105 active:scale-95"
                        >
                            ✕ {t('cancel')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
