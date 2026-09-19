import React, { useEffect, useState } from 'react';
import apiClient from '../config/api';
import apiError from '../utils/apiError';

export default function InventoryManager({ store, user }) {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ delta: '', reason: 'manual_adjustment', note: '' });
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const canAdjust = ['owner', 'manager'].includes(user?.role);
    useEffect(() => {
        if (!store?._id) return;
        let active = true;
        const timer = setTimeout(async () => {
            setLoading(true); setError('');
            try {
                const { data } = await apiClient.get('/api/products', { params: { page, limit: 25, search } });
                if (active) { setProducts(data.data); setPages(Math.max(1, data.pagination?.pages || 1)); }
            } catch (error) { if (active) { setError(apiError(error)); setProducts([]); } }
            finally { if (active) setLoading(false); }
        }, 200);
        return () => { active = false; clearTimeout(timer); };
    }, [store?._id, page, search]);
    const adjust = async event => {
        event.preventDefault();
        const delta = Number(form.delta);
        if (!Number.isInteger(delta) || delta === 0) { setError('Enter a non-zero whole-number adjustment.'); return; }
        if (selected.stock + delta < 0) { setError('Adjustment cannot reduce stock below zero.'); return; }
        setSaving(true); setError(''); setNotice('');
        try {
            const { data } = await apiClient.patch(`/api/products/${selected._id}/stock`, { delta, reason: form.reason, ...(form.note.trim() ? { note: form.note.trim() } : {}) }, { headers: { 'X-Store-ID': store._id } });
            setProducts(current => current.map(product => product._id === selected._id ? { ...product, stock: data.data.newBalance } : product));
            setSelected(null); setNotice('Stock adjustment saved.');
        } catch (error) { setError(apiError(error)); }
        finally { setSaving(false); }
    };
    return <section className="p-6 space-y-4"><h1 className="text-3xl font-bold">Inventory</h1>
        <input aria-label="Search inventory" placeholder="Search name or barcode..." value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
        {error && <p role="alert" className="text-red-700">{error}</p>}{notice && <p role="status" className="text-green-700">{notice}</p>}
        {selected && <form onSubmit={adjust} className="card space-y-3"><h2 className="font-bold">Adjust {selected.name} (current stock: {selected.stock})</h2>
            <label className="block">Quantity change<input required type="number" step="1" value={form.delta} onChange={event => setForm({ ...form, delta: event.target.value })} /></label>
            <label className="block">Reason<select value={form.reason} onChange={event => setForm({ ...form, reason: event.target.value })}>{['manual_adjustment', 'restock', 'damage', 'return'].map(reason => <option key={reason}>{reason}</option>)}</select></label>
            <label className="block">Note<input maxLength="500" value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} /></label>
            <button disabled={saving} className="btn-success" type="submit">Save adjustment</button><button disabled={saving} className="btn-outline ml-2" type="button" onClick={() => setSelected(null)}>Cancel</button>
        </form>}
        {loading ? <p role="status">Loading inventory...</p> : <div className="bg-white border rounded overflow-x-auto"><table><thead><tr><th>Product</th><th>Barcode</th><th>Stock</th><th>Low stock threshold</th><th>Status</th>{canAdjust && <th>Actions</th>}</tr></thead><tbody>
            {products.map(product => <tr key={product._id}><td>{product.name}</td><td>{product.barcode}</td><td>{product.stock}</td><td>{product.lowStockAlert}</td><td>{product.stock <= product.lowStockAlert ? 'Low stock' : 'In stock'}</td>{canAdjust && <td><button disabled={saving} className="text-blue-700" onClick={() => { setSelected(product); setForm({ delta: '', reason: 'manual_adjustment', note: '' }); setError(''); setNotice(''); }}>Adjust stock</button></td>}</tr>)}
            {!products.length && <tr><td colSpan="6">No products found.</td></tr>}
        </tbody></table></div>}
        <div className="flex gap-3 items-center"><button className="btn-outline" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn-outline" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>Next</button></div>
    </section>;
}
