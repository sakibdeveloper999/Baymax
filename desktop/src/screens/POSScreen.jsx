import React, { useEffect, useRef, useState } from 'react';
import useCartStore from '../store/cartSlice';
import apiClient from '../config/api';
import generateReceipt from '../utils/receipt';
import printReceipt from '../utils/printer';

export default function POSScreen({ store, user, onBusyChange }) {
    const scanRef = useRef(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [receipt, setReceipt] = useState(null);
    const cart = useCartStore();
    useEffect(() => { onBusyChange?.(busy); return () => onBusyChange?.(false); }, [busy, onBusyChange]);
    const money = value => new Intl.NumberFormat(undefined, { style: 'currency', currency: store?.currency || 'USD' }).format(value);
    const message = error => typeof error.response?.data?.error === 'string' ? error.response.data.error : error.response?.data?.error?.message || error.message;
    useEffect(() => {
        cart.setTaxRate(store?.taxRate || 0);
        setReceipt(null);
        setSearch('');
        setCategory('All');
        setPage(1);
        // Store selection owns the tax rate.
    }, [store?._id, store?.taxRate]);
    useEffect(() => {
        if (!store?._id) return;
        let active = true;
        setLoading(true); setError(''); setProducts([]);
        apiClient.get('/api/products', { params: { page, limit: 100 } }).then(({ data }) => {
            if (active) { setProducts(data.data); setPages(Math.max(1, data.pagination?.pages || 1)); }
        }).catch(error => { if (active) setError(message(error)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [store?._id, page]);
    const categoryName = product => product.categoryId?.name || product.category || 'General';
    const categories = ['All', ...new Set(products.map(categoryName))];
    const filtered = products.filter(product => (category === 'All' || categoryName(product) === category)
        && (product.name.toLowerCase().includes(search.toLowerCase()) || product.barcode.includes(search)));
    const addProduct = product => { cart.addItem(product); scanRef.current?.focus(); };
    const scanProduct = async event => {
        if (event.key !== 'Enter' || busy || !search.trim()) return;
        event.preventDefault(); setError(''); setBusy(true);
        try {
            const { data } = await apiClient.get(`/api/products/barcode/${encodeURIComponent(search.trim())}`);
            addProduct(data.data); setSearch('');
        } catch (error) { setError(error.response?.status === 404 ? 'Barcode not found. Create this product in Products before selling it.' : message(error)); }
        finally { setBusy(false); scanRef.current?.focus(); }
    };
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountAmount = cart.discountType === 'percentage' ? subtotal * Math.min(100, cart.discount) / 100 : Math.min(subtotal, cart.discount);
    const tax = (subtotal - discountAmount) * cart.taxRate / 100;
    const printOrder = async order => {
        const result = await printReceipt(generateReceipt({ ...order, ...order.billing, createdAt: order.timestamp }, {
            storeName: store.name, storeAddress: store.address, storePhone: store.phone,
        }));
        if (!result.success) setError(`Sale saved, but printing failed: ${result.error}`);
    };
    const checkout = async () => {
        if (!cart.items.length || busy || !store) return;
        setBusy(true); setError('');
        try {
            const { data } = await apiClient.post('/api/orders', {
                items: cart.items.map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice })),
                discount: { type: cart.discountType === 'percentage' ? 'percent' : 'flat', value: cart.discount },
                paymentMethod: cart.paymentMethod,
            });
            const completed = data.data;
            setReceipt(completed);
            cart.clearCart();
            setProducts(current => current.map(product => ({ ...product, stock: Math.max(0, product.stock - (cart.items.find(item => item.productId === product._id)?.quantity || 0)) })));
            if (window.electron?.printReceipt) await printOrder(completed);
        } catch (error) { setError(message(error)); }
        finally { setBusy(false); scanRef.current?.focus(); }
    };
    const receiptUrl = receipt?.qrToken ? `${window.location.href.split('#')[0]}#receipt/${encodeURIComponent(receipt.qrToken)}` : '';
    return <div className="p-6 space-y-4">
        <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">Point of Sale</h1><p>{store?.name || 'Select a store'} | {user?.name || ''}</p></div>
        {error && <p role="alert" className="alert-danger p-3 rounded">{error}</p>}
        {receipt && <div role="status" className="alert-success p-3 rounded flex gap-4 items-center">
            <span>Sale saved: {receipt.orderNumber} | {money(receipt.billing.total)}</span>
            <button onClick={() => printOrder(receipt)} className="btn-outline">Print receipt</button>
            {receiptUrl && <a href={receiptUrl} target="_blank" rel="noreferrer" className="underline">View receipt</a>}
        </div>}
        {cart.heldOrders.length > 0 && <div className="flex gap-2 flex-wrap" aria-label="Held orders">
            {cart.heldOrders.map((order, index) => <button key={order.id} disabled={busy} className="btn-outline" onClick={() => { cart.resumeOrder(order.id); scanRef.current?.focus(); }}>Resume order {index + 1} ({order.items.length} items)</button>)}
        </div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-4">
                <input ref={scanRef} aria-label="Scan barcode or search products" placeholder="Scan barcode and press Enter, or search this page..." value={search} onChange={event => setSearch(event.target.value)} onKeyDown={scanProduct} autoFocus disabled={busy} />
                <div className="flex gap-2 flex-wrap">{categories.map(value => <button key={value} className={category === value ? 'btn-primary' : 'btn-outline'} onClick={() => setCategory(value)}>{value}</button>)}</div>
                {loading ? <p role="status">Loading products...</p> : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filtered.map(product => <button key={product._id} disabled={busy || product.stock <= 0} onClick={() => addProduct(product)} className="bg-white border rounded-lg p-4 text-left hover:border-blue-500 disabled:opacity-50">
                        <strong className="block">{product.name}</strong><span className="block text-sm">{categoryName(product)}</span>
                        <span className="block font-bold text-blue-700">{money(product.sellingPrice)}</span><span className="text-xs">{product.barcode} | Stock: {product.stock}</span>
                    </button>)}
                    {!filtered.length && <p>No products found.</p>}
                </div>}
                <div className="flex gap-3 items-center"><button className="btn-outline" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn-outline" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>Next</button></div>
            </section>
            <section className="bg-white border rounded-lg p-4 space-y-4">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                {!cart.items.length && <p>Cart is empty</p>}
                {cart.items.map(item => <div key={item.productId} className="border-b pb-3">
                    <strong>{item.productName}</strong><p>{money(item.unitPrice)} x {item.quantity} = {money(item.unitPrice * item.quantity)}</p>
                    <div className="flex gap-2"><button disabled={busy} aria-label={`Decrease ${item.productName}`} onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)} className="btn-outline">-</button><button disabled={busy} aria-label={`Increase ${item.productName}`} onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)} className="btn-outline">+</button><button disabled={busy} onClick={() => cart.removeItem(item.productId)} className="text-red-700">Remove</button></div>
                </div>)}
                <fieldset disabled={busy} className="space-y-2">
                    <label className="block">Discount<input aria-label="Discount" type="number" min="0" max={cart.discountType === 'percentage' ? 100 : subtotal} value={cart.discount} onChange={event => cart.setDiscount(event.target.value, cart.discountType)} /></label>
                    <select aria-label="Discount type" value={cart.discountType} onChange={event => cart.setDiscount(cart.discount, event.target.value)}><option value="percentage">Percentage</option><option value="fixed">Flat amount</option></select>
                    <select aria-label="Payment method" value={cart.paymentMethod} onChange={event => cart.setPaymentMethod(event.target.value)}><option value="cash">Cash</option><option value="card">Card</option><option value="mobile">Mobile banking</option></select>
                </fieldset>
                <div><p>Subtotal: {money(subtotal)}</p><p>Discount: -{money(discountAmount)}</p><p>{store?.taxLabel || 'Tax'} ({cart.taxRate}%): {money(tax)}</p><p className="text-xl font-bold">Total: {money(cart.getTotal())}</p></div>
                <button disabled={busy || !cart.items.length || !store} onClick={checkout} className="btn-success w-full">{busy ? 'Please wait...' : 'Complete Payment'}</button>
                <button disabled={busy || !cart.items.length} onClick={() => { cart.holdOrder(); scanRef.current?.focus(); }} className="btn-warning w-full">Hold Order</button>
            </section>
        </div>
    </div>;
}
