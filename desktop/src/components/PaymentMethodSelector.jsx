import React from 'react';
import useCartStore from '../store/cartSlice';
import { useTranslation } from 'react-i18next';

export default function PaymentMethodSelector() {
    const { t } = useTranslation();
    const { paymentMethod, setPaymentMethod } = useCartStore();

    const PAYMENT_METHODS = [
        { id: 'cash', label: t('cash'), icon: '💵', color: 'bg-green-100 border-green-400' },
        { id: 'card', label: t('card'), icon: '💳', color: 'bg-blue-100 border-blue-400' },
        { id: 'mobile', label: t('mobile'), icon: '📱', color: 'bg-purple-100 border-purple-400' },
    ];

    return (
        <div className="flex gap-2">
            {PAYMENT_METHODS.map((method) => (
                <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex-1 py-3 px-4 rounded border-2 transition font-medium text-sm ${paymentMethod === method.id
                            ? `${method.color} border-2 ring-2 ring-offset-1`
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    <div className="text-xl mb-1">{method.icon}</div>
                    {method.label}
                </button>
            ))}
        </div>
    );
}
