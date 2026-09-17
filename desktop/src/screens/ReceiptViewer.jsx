import React, { useEffect, useState } from 'react';
import apiClient from '../config/api';

export default function ReceiptViewer({ token }) {
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        setReceipt(null);
        setError('');
        apiClient.get(`/api/orders/receipt/${encodeURIComponent(token)}`).then(({ data }) => {
            if (active) setReceipt(data.data);
        }).catch(error => {
            if (active) setError(error.response?.data?.error?.message || 'This receipt is unavailable or its link has expired.');
        });
        return () => { active = false; };
    }, [token]);
    if (error) return <main className="max-w-lg mx-auto p-8"><h1 className="text-2xl font-bold">Receipt unavailable</h1><p role="alert">{error}</p></main>;
    if (!receipt) return <p className="p-8" role="status">Loading receipt...</p>;
    const money = value => new Intl.NumberFormat(undefined, { style: 'currency', currency: receipt.store?.currency || 'USD' }).format(value);
    return <main className="max-w-lg mx-auto p-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold">{receipt.store?.name || 'Receipt'}</h1>
        <p>{receipt.store?.address}</p><p>{receipt.store?.phone}</p>
        <p className="mt-4">{receipt.orderNumber}</p><p>{new Date(receipt.timestamp).toLocaleString()}</p>
        <ul className="my-6 divide-y">{receipt.items.map((item, index) => <li key={index} className="py-3 flex justify-between gap-4">
            <span>{item.productName} ? {item.quantity}</span><strong>{money(item.total)}</strong>
        </li>)}</ul>
        <p>Subtotal: {money(receipt.billing.subtotal)}</p>
        <p>Discount: {money(receipt.billing.discount)}</p>
        <p>{receipt.store?.taxLabel || 'Tax'}: {money(receipt.billing.tax)}</p>
        <p className="text-xl font-bold mt-2">Total: {money(receipt.billing.total)}</p>
        <p>{receipt.paymentMethod} ? {receipt.status}</p>
        <p className="mt-6">{receipt.store?.receiptFooter || 'Thank you for shopping with us.'}</p>
        <button className="btn-primary mt-6 no-print" onClick={() => window.print()}>Print receipt</button>
    </main>;
}
