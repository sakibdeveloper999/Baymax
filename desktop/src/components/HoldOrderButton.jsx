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
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-4 rounded-lg font-black text-lg hover:from-orange-600 hover:to-orange-700 transition transform hover:scale-105 active:scale-95 ring-2 ring-orange-400 ring-opacity-50 shadow-lg"
            >
                ⏸️ {t('held_order')} - {t('release')}
            </button>
        );
    }

    return (
        <div>
            <button
                onClick={() => setShowDialog(true)}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 py-4 px-4 rounded-lg font-black text-lg hover:from-amber-500 hover:to-amber-600 transition transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform disabled:hover:scale-100 shadow-lg"
                disabled={items.length === 0}
            >
                ⏸️ {t('hold_order')}
            </button>

            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-8 w-96 shadow-2xl border-4 border-blue-500 transform transition animate-bounce">
                        <div className="text-center mb-6">
                            <div className="text-5xl mb-2">⏸️</div>
                            <h2 className="text-2xl font-black text-gray-800">{t('hold_order')}</h2>
                        </div>

                        <p className="text-gray-600 mb-4 text-center">{t('add_notes_optional')}</p>

                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('order_notes_placeholder')}
                            className="input-field w-full h-24 resize-none mb-6 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleHold}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-black hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 active:scale-95"
                            >
                                ✓ {t('hold')}
                            </button>
                            <button
                                onClick={() => setShowDialog(false)}
                                className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-black hover:bg-gray-400 transition transform hover:scale-105 active:scale-95"
                            >
                                ✕ {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
