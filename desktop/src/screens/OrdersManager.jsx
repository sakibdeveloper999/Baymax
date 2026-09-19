import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../config/api';
import apiError from '../utils/apiError';

export default function OrdersManager({ store }) {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const request = useRef(0);
    useEffect(() => () => { request.current += 1; }, []);
    useEffect(() => {
        if (!store?._id) return;
        let active = true;
        setLoading(true); setError('');
        apiClient.get('/api/orders', { params: { page, limit: 25, ...(status ? { status } : {}) } })
            .then(({ data }) => { if (active) { setOrders(data.data); setPages(Math.max(1, data.pagination?.pages || 1)); } })
            .catch(error => { if (active) { setError(apiError(error)); setOrders([]); } })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [store?._id, page, status]);
    const openOrder = async id => {
        const version = ++request.current;
        setDetailLoading(true); setDetail(null); setError('');
        try {
            const { data } = await apiClient.get(`/api/orders/${id}`);
            if (version === request.current) setDetail(data.data);
        } catch (error) { if (version === request.current) setError(apiError(error)); }
        finally { if (version === request.current) setDetailLoading(false); }
    };
    const money = amount => new Intl.NumberFormat(undefined, { style: 'currency', currency: store?.currency || 'USD' }).format(amount || 0);
    return <section className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">Orders</h1>
        <label>Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{['completed', 'pending', 'cancelled'].map(value => <option key={value}>{value}</option>)}</select></label>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {loading ? <p role="status">Loading orders...</p> : <div className="bg-white overflow-x-auto rounded border"><table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Cashier</th><th>Payment</th><th>Status</th><th>Total</th><th>Details</th></tr></thead><tbody>
            {orders.map(order => <tr key={order._id}><td>{order.orderNumber}</td><td>{new Date(order.createdAt).toLocaleString()}</td><td>{order.customerId?.name || 'Walk-in'}</td><td>{order.cashierId?.name || '-'}</td><td>{order.paymentMethod}</td><td>{order.status}</td><td>{money(order.total)}</td><td><button className="text-blue-700" onClick={() => openOrder(order._id)}>View</button></td></tr>)}
            {!orders.length && <tr><td colSpan="8">No orders found.</td></tr>}
        </tbody></table></div>}
        <div className="flex gap-3 items-center"><button className="btn-outline" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn-outline" disabled={loading || page >= pages} onClick={() => setPage(page + 1)}>Next</button></div>
        {detailLoading && <p role="status">Loading order details...</p>}
        {detail && <article className="card space-y-2"><h2 className="text-xl font-bold">{detail.orderNumber}</h2><ul>{detail.items.map((item, index) => <li key={index}>{item.productName} x {item.quantity}: {money(item.total)}</li>)}</ul><p>Subtotal: {money(detail.subtotal)}</p><p>Discount: {money(detail.discount)}</p><p>Tax: {money(detail.tax)}</p><p className="font-bold">Total: {money(detail.total)}</p><button className="btn-outline" onClick={() => setDetail(null)}>Close details</button></article>}
    </section>;
}
