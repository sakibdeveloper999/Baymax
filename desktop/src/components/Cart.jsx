import React from 'react';
import { useTranslation } from 'react-i18next';
import useCartStore from '../store/cartSlice';
import { calculateSubtotal, applyDiscount, calculateTax } from '../utils/billing';

function Cart() {
    const { t } = useTranslation();
    const items = useCartStore((state) => state.items);
    const discount = useCartStore((state) => state.discount);
    const discountType = useCartStore((state) => state.discountType);
    const taxRate = useCartStore((state) => state.taxRate);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const total = useCartStore((state) => state.getTotal());

    // Calculate breakdown
    const subtotal = calculateSubtotal(items);
    const discountAmount = discountType === 'percentage'
        ? (subtotal * discount) / 100
        : discount;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = calculateTax(taxableAmount, taxRate);

    if (items.length === 0) {
        return (
            <div className="card text-center py-16 bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-lg text-gray-600 font-semibold">{t('cart_empty')}</p>
                <p className="text-sm text-gray-500 mt-2">📱 {t('scan_or_type_barcode')}</p>
            </div>
        );
    }

    return (
        <div className="card overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                <h2 className="text-2xl font-bold">{t('cart')}</h2>
                <p className="text-blue-100 text-sm mt-1">{items.length} {t('items')} • {items.reduce((sum, item) => sum + item.quantity, 0)} {t('units')}</p>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('product_name')}</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('quantity')}</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('price')}</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('total')}</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('remove')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={item.productId} className={`border-b border-gray-200 hover:bg-blue-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="py-4 px-4 font-medium text-gray-800">{item.productName}</td>
                                <td className="text-center py-4 px-4">
                                    <div className="flex items-center justify-center gap-2 bg-gray-200 rounded-lg py-1 px-2 w-fit">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="w-6 h-6 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center text-xs font-bold"
                                        >
                                            −
                                        </button>
                                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-6 h-6 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center justify-center text-xs font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td className="text-right py-4 px-4 text-gray-700">৳{item.unitPrice.toFixed(2)}</td>
                                <td className="text-right py-4 px-4 font-bold text-blue-600">৳{(item.unitPrice * item.quantity).toFixed(2)}</td>
                                <td className="text-center py-4 px-4">
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-lg w-8 h-8 rounded transition"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-6 border-t-2 border-gray-300">
                {/* Subtotal */}
                <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">{t('subtotal')}:</span>
                    <span className="font-semibold text-gray-900">৳{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                    <div className="flex justify-between mb-3 pb-3 border-b border-green-200 bg-green-50 px-3 py-2 rounded">
                        <span className="text-green-700 font-semibold">
                            🏷️ {t('discount')} ({discountType === 'percentage' ? `${discount}%` : `৳${discount}`}):
                        </span>
                        <span className="text-green-700 font-bold">-৳{discountAmount.toFixed(2)}</span>
                    </div>
                )}

                {/* Tax */}
                {taxRate > 0 && (
                    <div className="flex justify-between mb-3 pb-3 border-b border-blue-200 bg-blue-50 px-3 py-2 rounded">
                        <span className="text-blue-700 font-semibold">
                            💰 {t('tax')} ({taxRate}%):
                        </span>
                        <span className="text-blue-700 font-bold">+৳{taxAmount.toFixed(2)}</span>
                    </div>
                )}

                {/* Final Total */}
                <div className="flex justify-between pt-3 bg-gradient-to-r from-primary to-blue-700 text-white px-4 py-4 rounded-lg">
                    <div className="text-lg font-bold">
                        {t('total')}:
                    </div>
                    <div className="text-3xl font-black">
                        ৳{total.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
