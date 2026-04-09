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
            <div className="card text-center py-8">
                <p className="text-gray-500">{t('cart_empty')}</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">{t('cart')}</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b-2 border-gray-200">
                        <tr>
                            <th className="text-left py-2">{t('product_name')}</th>
                            <th className="text-center py-2">{t('quantity')}</th>
                            <th className="text-right py-2">{t('price')}</th>
                            <th className="text-right py-2">{t('total')}</th>
                            <th className="text-center py-2">{t('remove')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.productId} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 font-medium">{item.productName}</td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td className="text-right">৳{item.unitPrice.toFixed(2)}</td>
                                <td className="text-right font-semibold">৳{(item.unitPrice * item.quantity).toFixed(2)}</td>
                                <td className="text-center">
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-200">
                {/* Subtotal */}
                <div className="flex justify-between mb-2">
                    <span>{t('subtotal')}:</span>
                    <span>৳{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600 font-semibold">
                        <span>
                            {t('discount')} ({discountType === 'percentage' ? `${discount}%` : `৳${discount}`}):
                        </span>
                        <span>-৳{discountAmount.toFixed(2)}</span>
                    </div>
                )}

                {/* Tax */}
                {taxRate > 0 && (
                    <div className="flex justify-between mb-2 text-blue-600 font-semibold">
                        <span>{t('tax')} ({taxRate}%):</span>
                        <span>+৳{taxAmount.toFixed(2)}</span>
                    </div>
                )}

                {/* Total */}
                <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                    <div className="text-2xl font-bold">
                        {t('total')}:
                    </div>
                    <div className="text-2xl font-bold text-primary">
                        ৳{total.toFixed(2)}
                    </div>
                </div>

                {/* Item Count */}
                <div className="mt-3 text-sm text-gray-600 text-center">
                    {items.length} {t('items')} • {items.reduce((sum, item) => sum + item.quantity, 0)} {t('units')}
                </div>
            </div>
        </div>
    );
}

export default Cart;
