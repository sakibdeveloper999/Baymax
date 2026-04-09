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
                    type="button"
                    aria-pressed={paymentMethod === method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex-1 py-3 px-4 rounded border-2 transition font-medium text-sm ${paymentMethod === method.id
                        ? `${method.color} border-2 ring-2 ring-offset-1`
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    <div className="text-xl mb-1" aria-hidden="true">{method.icon}</div>
                    {method.label}
                </button>))}
        </div>
    );
}
