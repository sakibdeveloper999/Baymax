import React from 'react';
import useCartStore from '../store/cartSlice';
import { useTranslation } from 'react-i18next';

export default function PaymentMethodSelector() {
    const { t } = useTranslation();
    const { paymentMethod, setPaymentMethod } = useCartStore();

    const PAYMENT_METHODS = [
        { id: 'cash', label: t('cash'), icon: '💵', gradientFrom: 'from-green-400', gradientTo: 'to-green-600' },
        { id: 'card', label: t('card'), icon: '💳', gradientFrom: 'from-blue-400', gradientTo: 'to-blue-600' },
        { id: 'mobile', label: t('mobile'), icon: '📱', gradientFrom: 'from-purple-400', gradientTo: 'to-purple-600' },
    ];

    return (
        <div className="flex gap-3">
            {PAYMENT_METHODS.map((method) => (
                <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex-1 py-4 px-4 rounded-xl border-3 transition font-black text-sm transform ${paymentMethod === method.id
                            ? `bg-gradient-to-b ${method.gradientFrom} ${method.gradientTo} text-white border-white shadow-2xl scale-105 ring-4 ring-offset-2`
                            : 'bg-white border-gray-300 text-gray-800 hover:border-gray-400 hover:shadow-lg hover:scale-102'
                        }`}
                >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <div className="text-xs uppercase tracking-wide">{method.label}</div>
                </button>
            ))}
        </div>
    );
}
