import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

function ScanInput() {
    const { t } = useTranslation();
    const [scanValue, setScanValue] = useState('');
    const inputRef = useRef(null);

    const handleScan = (e) => {
        e.preventDefault();
        console.log('Scanned:', scanValue);
        // TODO: Process barcode lookup
        setScanValue('');
        inputRef.current?.focus();
    };

    return (
        <div className="scan-input-section">
            <h2>{t('scan_product')}</h2>
            <form onSubmit={handleScan}>
                <input
                    ref={inputRef}
                    type="text"
                    value={scanValue}
                    onChange={(e) => setScanValue(e.target.value)}
                    placeholder={t('enter_barcode')}
                    autoFocus
                    style={{
                        padding: '10px',
                        fontSize: '18px',
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: '5px',
                        border: '2px solid #667eea',
                    }}
                />
            </form>
            <p style={{ color: '#999', marginTop: '10px' }}>{t('scan_or_type_barcode')}</p>
        </div>
    );
}

export default ScanInput;
