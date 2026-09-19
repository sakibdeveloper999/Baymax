import React, { useEffect, useState } from 'react';
import apiClient from '../config/api';
import { activateCartScope } from '../store/cartSlice';

export default function SessionGate({ children }) {
    const [session, setSession] = useState(null);
    const [stores, setStores] = useState([]);
    const [busy, setBusy] = useState(Boolean(localStorage.getItem('authToken')));
    const [error, setError] = useState('');
    const [signup, setSignup] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', businessName: '' });
    const [storeForm, setStoreForm] = useState({ name: '', address: '', phone: '', currency: 'USD', taxRate: 0 });
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('storeId');
        activateCartScope();
        setSession(null);
        setStores([]);
        setBusy(false);
    };
    const chooseStore = (store, account = session) => {
        localStorage.setItem('storeId', store._id);
        activateCartScope(account.tenant._id, account.user._id, store._id);
        setSession({ ...account, store });
    };
    const loadSession = async () => {
        const { data: profile } = await apiClient.get('/api/auth/me');
        const account = profile.data;
        const { data: result } = await apiClient.get('/api/stores');
        setStores(result.data);
        setSession(account);
        const selected = result.data.find(store => store._id === localStorage.getItem('storeId')) || result.data[0];
        if (selected) chooseStore(selected, account);
    };
    const showError = error => setError(typeof error.response?.data?.error === 'string' ? error.response.data.error : error.response?.data?.error?.message || 'Cannot reach the server. Check your connection and try again.');
    useEffect(() => {
        const expired = () => { logout(); setError('Your session expired. Please sign in again.'); };
        window.addEventListener('auth:expired', expired);
        if (localStorage.getItem('authToken')) loadSession().catch(showError).finally(() => setBusy(false));
        return () => window.removeEventListener('auth:expired', expired);
        // Restore the session only when the application mounts.
    }, []);
    const submit = async event => {
        event.preventDefault(); setBusy(true); setError('');
        try {
            const payload = signup ? { businessName: form.businessName, ownerEmail: form.email, password: form.password } : { email: form.email, password: form.password };
            const { data } = await apiClient.post(`/api/auth/${signup ? 'signup' : 'login'}`, payload);
            localStorage.setItem('authToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.removeItem('storeId');
            await loadSession();
        } catch (error) { showError(error); }
        finally { setBusy(false); }
    };
    const createStore = async event => {
        event.preventDefault(); setBusy(true); setError('');
        try {
            const { data } = await apiClient.post('/api/stores', { ...storeForm, taxRate: Number(storeForm.taxRate) });
            setStores([data.data]); chooseStore(data.data);
        } catch (error) { showError(error); }
        finally { setBusy(false); }
    };
    if (session?.store) return <>
        <div className="bg-white border-b px-4 py-2 flex items-center gap-3 no-print">
            <span>{session.tenant.businessName} | {session.user.name} ({session.user.role})</span>
            <select disabled={busy} aria-label="Active store" className="max-w-xs" value={session.store._id} onChange={event => chooseStore(stores.find(store => store._id === event.target.value))}>
                {stores.map(store => <option key={store._id} value={store._id}>{store.name}</option>)}
            </select>
            <button disabled={busy} className="ml-auto btn-outline" onClick={logout}>Sign out</button>
        </div>
        {children({ ...session, transactionBusy: busy, setTransactionBusy: setBusy })}
    </>;
    return <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6"><section className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">{session ? 'Set up your store' : signup ? 'Create your business account' : 'Sign in to Baymax'}</h1>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {busy && <p role="status">Connecting...</p>}
        {session ? <form onSubmit={createStore} className="space-y-3">
            {['name', 'address', 'phone', 'currency', 'taxRate'].map(field => <label key={field} className="block">{field}<input required value={storeForm[field]} type={field === 'taxRate' ? 'number' : 'text'} min="0" max="100" onChange={event => setStoreForm({ ...storeForm, [field]: event.target.value })} /></label>)}
            <button disabled={busy || session.user.role !== 'owner'} className="btn-primary" type="submit">Create store</button>
            <button type="button" className="btn-outline ml-2" onClick={logout}>Sign out</button>
        </form> : <form onSubmit={submit} className="space-y-3">
            {signup && <label className="block">Business name<input required minLength="3" value={form.businessName} onChange={event => setForm({ ...form, businessName: event.target.value })} /></label>}
            <label className="block">Email<input type="email" autoComplete="username" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
            <label className="block">Password<input type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
            <button disabled={busy} className="btn-primary w-full" type="submit">{signup ? 'Create account' : 'Sign in'}</button>
            <button type="button" className="text-blue-700" onClick={() => setSignup(!signup)}>{signup ? 'Already registered? Sign in' : 'Create a business account'}</button>
        </form>}
    </section></main>;
}
