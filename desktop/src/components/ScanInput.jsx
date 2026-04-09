import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useCartStore from '../store/cartSlice';
import localDB from '../db/localdb';

function ScanInput() {
    const { t } = useTranslation();
    const [scanValue, setScanValue] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success', 'error'
    const inputRef = useRef(null);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const showMessage = (text, type = 'success') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleScan = async (e) => {
        e.preventDefault();

        if (!scanValue.trim()) {
            return;
        }

        try {
            // Look up product by barcode in local database
            const product = await localDB.getProductByBarcode(scanValue.trim());

            if (product && product.id) {
                addItem({
                    id: product.id,
                    name: product.name,
                    price: product.sellingPrice,
                    sellingPrice: product.sellingPrice,
                });
                showMessage(`✓ ${product.name} added to cart`, 'success');
            } else {
                showMessage(`✗ ${t('product_not_found')}: ${scanValue}`, 'error');
            }
        } catch (error) {
            console.error('Scan error:', error);
            showMessage(`Error: ${error.message}`, 'error');
        }

        setScanValue('');
        inputRef.current?.focus();
    };

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('scan_product')}</h2>

            <form onSubmit={handleScan}>
                <input
                    ref={inputRef}
                    type="text"
                    value={scanValue}
                    onChange={(e) => setScanValue(e.target.value)}
                    placeholder={t('enter_barcode')}
                    className="input-field text-lg"
                    autoComplete="off"
                />
            </form>

            <p className="text-gray-500 text-sm mt-2">{t('scan_or_type_barcode')}</p>

            {message && (
                <div
                    className={`mt-3 p-3 rounded-lg font-semibold ${messageType === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                >
                    {message}
                </div>
            )}
        </div>
    );
}

export default ScanInput;
