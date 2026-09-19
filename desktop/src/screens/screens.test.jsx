import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import SessionGate from '../components/SessionGate';
import CategoriesManager from './CategoriesManager';
import apiClient from '../config/api';
jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn() } }));

import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import '../i18n/config';
import App from '../App';
import Dashboard from './Dashboard';
import POSScreen from './POSScreen';
import ProductsManager from './ProductsManager';
import CustomersManager from './CustomersManager';
import SuppliersManager from './SuppliersManager';
import OrdersManager from './OrdersManager';
import InventoryManager from './InventoryManager';
import Reports from './Reports';
import Settings from './Settings';
import useCartStore from '../store/cartSlice';

for (const Screen of [App, Dashboard, POSScreen, ProductsManager, CustomersManager, SuppliersManager, OrdersManager, InventoryManager, Reports, Settings]) {
    test(`${Screen.name} renders without crashing`, () => {
        expect(renderToString(<Screen />)).not.toHaveLength(0);
    });
}
const testStore = { _id: 'store-1', name: 'Main', taxRate: 10, currency: 'USD' };
const testProduct = { _id: 'product-1', name: 'Rice 5kg', sellingPrice: 200, stock: 10, barcode: '111001', category: 'Grains' };
beforeEach(() => {
    jest.clearAllMocks();
    apiClient.get.mockResolvedValue({ data: { data: [testProduct], pagination: { pages: 1 } } });
    useCartStore.setState({ items: [], heldOrders: [], discount: 0, taxRate: 0 });
});
test('POS loads real products and removes the selected cart item', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        await act(async () => root.render(<POSScreen store={testStore} />));
        const product = Array.from(container.querySelectorAll('button')).find(button => button.textContent.includes('Rice 5kg'));
        act(() => product.click());
        expect(container.textContent).not.toContain('NaN');
        expect(container.textContent).toContain('$200.00 x 1');
        expect(container.textContent).toContain('Total: $220.00');
        const remove = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Remove');
        act(() => remove.click());
        expect(container.textContent).toContain('Cart is empty');
    } finally { act(() => root.unmount()); delete global.IS_REACT_ACT_ENVIRONMENT; }
});
test('checkout sends the mapped payload and clears the cart only after success', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        await act(async () => root.render(<POSScreen store={testStore} />));
        act(() => useCartStore.getState().addItem(testProduct));
        apiClient.post.mockRejectedValueOnce(new Error('Server unavailable'));
        const pay = () => Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Complete Payment');
        await act(async () => pay().click());
        expect(useCartStore.getState().items).toHaveLength(1);
        expect(container.textContent).toContain('Server unavailable');
        apiClient.post.mockResolvedValueOnce({ data: { data: { orderNumber: 'ORD-1', items: [], billing: { total: 220 }, qrToken: 'signed-token' } } });
        await act(async () => pay().click());
        expect(apiClient.post).toHaveBeenLastCalledWith('/api/orders', {
            items: [{ productId: 'product-1', quantity: 1, unitPrice: 200 }],
            discount: { type: 'percent', value: 0 }, paymentMethod: 'cash',
        });
        expect(useCartStore.getState().items).toHaveLength(0);
        expect(container.textContent).toContain('Sale saved: ORD-1');
    } finally { act(() => root.unmount()); delete global.IS_REACT_ACT_ENVIRONMENT; }
});

test('category form saves to the API and reloads saved records', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    apiClient.get.mockResolvedValue({ data: { data: [{ _id: 'category-1', name: 'Grains', description: '' }] } });
    apiClient.post.mockResolvedValue({ data: { success: true } });
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        await act(async () => { root.render(<CategoriesManager user={{ role: 'owner' }} />); });
        await act(async () => { jest.runOnlyPendingTimers(); });
        act(() => Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Add category').click());
        act(() => Simulate.change(container.querySelector('form input'), { target: { value: 'Beverages' } }));
        await act(async () => Simulate.submit(container.querySelector('form')));
        expect(apiClient.post).toHaveBeenCalledWith('/api/categories', { name: 'Beverages' });
        expect(container.querySelector('form')).toBeNull();
        expect(container.textContent).toContain('Grains');
    } finally { act(() => root.unmount()); jest.useRealTimers(); delete global.IS_REACT_ACT_ENVIRONMENT; }
});
test('sign in loads profile and selected store, and sign out removes tokens', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    apiClient.post.mockResolvedValue({ data: { data: { accessToken: 'test-access', refreshToken: 'test-refresh' } } });
    apiClient.get.mockImplementation(path => Promise.resolve({ data: { data: path === '/api/auth/me'
        ? { user: { _id: 'user-1', name: 'Owner', role: 'owner' }, tenant: { _id: 'tenant-1', businessName: 'Test Store' } }
        : [testStore] } }));
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        await act(async () => root.render(<SessionGate>{session => <p>Store ready: {session.store.name}</p>}</SessionGate>));
        act(() => Simulate.change(container.querySelector('input[type="email"]'), { target: { value: 'owner@example.com' } }));
        act(() => Simulate.change(container.querySelector('input[type="password"]'), { target: { value: 'correct-password' } }));
        await act(async () => Simulate.submit(container.querySelector('form')));
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', { email: 'owner@example.com', password: 'correct-password' });
        expect(container.textContent).toContain('Store ready: Main');
        expect(localStorage.getItem('storeId')).toBe('store-1');
        act(() => Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Sign out').click());
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('storeId')).toBeNull();
    } finally { act(() => root.unmount()); localStorage.clear(); delete global.IS_REACT_ACT_ENVIRONMENT; }
});

test('orders load from the API and show selected order details', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    const order = { _id: 'order-1', orderNumber: 'ORD-LIVE-1', total: 25, subtotal: 25, createdAt: '2026-09-19T10:00:00Z', items: [{ productName: 'Rice', quantity: 1, total: 25 }] };
    apiClient.get.mockImplementation(path => Promise.resolve({ data: { data: path === '/api/orders' ? [order] : order, pagination: { pages: 1 } } }));
    const container = document.createElement('div'); const root = createRoot(container);
    try {
        await act(async () => root.render(<OrdersManager store={testStore} />));
        expect(container.textContent).toContain('ORD-LIVE-1');
        await act(async () => Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'View').click());
        expect(apiClient.get).toHaveBeenCalledWith('/api/orders/order-1');
        expect(container.textContent).toContain('Rice x 1: $25.00');
    } finally { act(() => root.unmount()); delete global.IS_REACT_ACT_ENVIRONMENT; }
});
test('inventory keeps failed adjustments open and uses the server balance on success', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true; jest.useFakeTimers();
    apiClient.get.mockResolvedValue({ data: { data: [testProduct], pagination: { pages: 1 } } });
    const container = document.createElement('div'); const root = createRoot(container);
    try {
        await act(async () => root.render(<InventoryManager store={testStore} user={{ role: 'manager' }} />));
        await act(async () => jest.runOnlyPendingTimers());
        act(() => Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Adjust stock').click());
        act(() => Simulate.change(container.querySelector('input[type="number"]'), { target: { value: '3' } }));
        apiClient.patch.mockRejectedValueOnce(new Error('Stock service unavailable'));
        await act(async () => Simulate.submit(container.querySelector('form')));
        expect(container.textContent).toContain('Stock service unavailable');
        expect(container.querySelector('form')).not.toBeNull();
        apiClient.patch.mockResolvedValueOnce({ data: { data: { newBalance: 13 } } });
        await act(async () => Simulate.submit(container.querySelector('form')));
        expect(apiClient.patch).toHaveBeenLastCalledWith('/api/products/product-1/stock', { delta: 3, reason: 'manual_adjustment' }, { headers: { 'X-Store-ID': 'store-1' } });
        expect(container.querySelector('form')).toBeNull();
        expect(container.textContent).toContain('Stock adjustment saved.');
        expect(container.querySelector('tbody tr').textContent).toContain('13');
    } finally { act(() => root.unmount()); jest.useRealTimers(); delete global.IS_REACT_ACT_ENVIRONMENT; }
});
test('settings saves numeric tax and updates the active store only after success', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    const store = { ...testStore, address: '123 Main St', phone: '+15551234567', timezone: 'Asia/Dhaka', taxLabel: 'VAT', receiptFooter: 'Thank you' };
    const saved = { ...store, taxRate: 15 };
    apiClient.put.mockResolvedValue({ data: { data: saved } });
    const updated = jest.fn(); const container = document.createElement('div'); const root = createRoot(container);
    try {
        await act(async () => root.render(<Settings store={store} user={{ role: 'owner' }} onStoreUpdated={updated} />));
        act(() => Simulate.change(container.querySelector('input[type="number"]'), { target: { value: '15' } }));
        await act(async () => Simulate.submit(container.querySelector('form')));
        expect(apiClient.put).toHaveBeenCalledWith('/api/stores/store-1', expect.objectContaining({ taxRate: 15, currency: 'USD' }));
        expect(updated).toHaveBeenCalledWith(saved);
        expect(container.textContent).toContain('Store settings saved.');
    } finally { act(() => root.unmount()); delete global.IS_REACT_ACT_ENVIRONMENT; }
});
