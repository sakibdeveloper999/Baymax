import React, { useEffect, useState } from 'react';
import apiClient from '../config/api';
import apiError from '../utils/apiError';

const fields = [
    ['name', 'Store name'], ['address', 'Address'], ['phone', 'Phone'],
    ['currency', 'Currency code'], ['timezone', 'Timezone'], ['taxRate', 'Tax rate (%)'],
    ['taxLabel', 'Tax label'], ['receiptFooter', 'Receipt footer'],
];
const values = store => Object.fromEntries(fields.map(([key]) => [key, store?.[key] ?? (key === 'taxRate' ? 0 : '')]));
export default function Settings({ store, user, onStoreUpdated }) {
    const [form, setForm] = useState(() => values(store));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const canEdit = ['owner', 'manager'].includes(user?.role);
    useEffect(() => { setForm(values(store)); }, [store]);
    const save = async event => {
        event.preventDefault(); setError(''); setNotice('');
        const currency = form.currency.trim().toUpperCase();
        try {
            if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Enter a three-letter currency code.');
            new Intl.DateTimeFormat('en', { timeZone: form.timezone }).format(new Date());
        } catch { setError('Enter a valid currency code and timezone, such as USD and Asia/Dhaka.'); return; }
        setSaving(true);
        try {
            const { data } = await apiClient.put(`/api/stores/${store._id}`, { ...form, currency, taxRate: Number(form.taxRate) });
            onStoreUpdated?.(data.data);
            setForm(values(data.data)); setNotice('Store settings saved.');
        } catch (error) { setError(apiError(error)); }
        finally { setSaving(false); }
    };
    return <section className="p-6 space-y-4"><h1 className="text-3xl font-bold">Store Settings</h1>
        {error && <p role="alert" className="text-red-700">{error}</p>}{notice && <p role="status" className="text-green-700">{notice}</p>}
        {!canEdit && <p>Only an owner or manager can change store settings.</p>}
        <form onSubmit={save} className="card"><fieldset disabled={!canEdit || saving || !store} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(([key, label]) => <label key={key} className="block">{label}<input required={key !== 'receiptFooter'} type={key === 'taxRate' ? 'number' : 'text'} min={key === 'taxRate' ? 0 : undefined} max={key === 'taxRate' ? 100 : undefined} step={key === 'taxRate' ? '0.01' : undefined} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} /></label>)}
            <button type="submit" className="btn-success">{saving ? 'Saving...' : 'Save settings'}</button>
        </fieldset></form>
    </section>;
}
