import React, { useState } from 'react';
import useCartStore from '../store/cartSlice';
import { useTranslation } from 'react-i18next';

export default function HoldOrderButton() {
    const { t } = useTranslation();
    const { isHeld, holdNotes, holdOrder, releaseHold, items } = useCartStore();
    const [showDialog, setShowDialog] = useState(false);
    const [notes, setNotes] = useState(holdNotes);

    const handleHold = () => {
        if (items.length === 0) {
            alert(t('add_items_to_hold'));
            return;
        }
        holdOrder(notes);
        setShowDialog(false);
    };

    const handleRelease = () => {
        releaseHold();
        setNotes('');
    };

    if (isHeld) {
        return (
            <button
                onClick={handleRelease}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded font-bold text-lg hover:bg-orange-600 transition ring-2 ring-orange-400"
            >
                ⏸️ {t('held_order')} - {t('release')}
            </button>
        );
    }

    return (
        <div>
            <button
                onClick={() => setShowDialog(true)}
                className="w-full bg-yellow-500 text-gray-800 py-3 px-4 rounded font-bold text-lg hover:bg-yellow-600 transition"
                disabled={items.length === 0}
            >
                ⏸️ {t('hold_order')}
            </button>

            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <h2 className="text-xl font-bold mb-4">{t('hold_order')}</h2>
                        <p className="text-gray-600 mb-4">{t('add_notes_optional')}</p>

                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('order_notes_placeholder')}
                            className="input-field w-full h-24 resize-none mb-4"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={handleHold}
                                className="flex-1 bg-green-500 text-white py-2 px-4 rounded font-bold hover:bg-green-600"
                            >
                                {t('hold')}
                            </button>
                            <button
                                onClick={() => setShowDialog(false)}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded font-bold hover:bg-gray-400"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
