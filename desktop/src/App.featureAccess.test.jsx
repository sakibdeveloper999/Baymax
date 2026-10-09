import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import POSScreen from './screens/POSScreen';
import ProductsManager from './screens/ProductsManager';
import CategoriesManager from './screens/CategoriesManager';
import CustomersManager from './screens/CustomersManager';
import SuppliersManager from './screens/SuppliersManager';
import OrdersManager from './screens/OrdersManager';
import InventoryManager from './screens/InventoryManager';
import Reports from './screens/Reports';

let mockSession;
jest.mock('./components/SessionGate', () => ({ __esModule: true, default: ({ children }) => children(mockSession) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'en' } }) }));
jest.mock('./layouts/MainLayout', () => ({ __esModule: true, default: ({ children, onScreenChange }) => <>
    <nav>{['pos', 'products', 'categories', 'customers', 'suppliers', 'orders', 'inventory', 'reports'].map(screen =>
        <button key={screen} data-screen={screen} onClick={() => onScreenChange(screen)}>{screen}</button>)}</nav>{children}
</> }));
jest.mock('./screens/POSScreen', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted POS</p>) }));
jest.mock('./screens/ProductsManager', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted Products</p>) }));
jest.mock('./screens/CategoriesManager', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted Categories</p>) }));
jest.mock('./screens/CustomersManager', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted Customers</p>) }));
jest.mock('./screens/SuppliersManager', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted Suppliers</p>) }));
jest.mock('./screens/OrdersManager', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted Orders</p>) }));
jest.mock('./screens/InventoryManager', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted Inventory</p>) }));
jest.mock('./screens/Reports', () => ({ __esModule: true, default: jest.fn(() => <p>Mounted Reports</p>) }));

let container, root;
beforeEach(() => {
    jest.clearAllMocks();
    global.IS_REACT_ACT_ENVIRONMENT = true;
    mockSession = { user: { role: 'owner' }, tenant: { plan: 'basic' }, store: { _id: 'store' },
        features: ['pos', 'products', 'categories', 'barcodes'], planConfigured: true };
    container = document.createElement('div');
    root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); delete global.IS_REACT_ACT_ENVIRONMENT; });
const select = screen => act(() => container.querySelector('[data-screen="' + screen + '"]').click());

test('Basic screens allow catalog and POS but do not mount customer, supplier or report screens', () => {
    act(() => root.render(<App />));
    expect(POSScreen).toHaveBeenCalled();
    for (const [screen, component] of [['customers', CustomersManager], ['suppliers', SuppliersManager], ['reports', Reports]]) {
        select(screen);
        expect(container.textContent).toContain('not included');
        expect(component).not.toHaveBeenCalled();
    }
    for (const [screen, component] of [['products', ProductsManager], ['categories', CategoriesManager], ['orders', OrdersManager], ['inventory', InventoryManager]]) {
        select(screen);
        expect(component).toHaveBeenCalled();
    }
});
test('configured custom features allow entitled screens independent of plan name', () => {
    mockSession.features = [...mockSession.features, 'customers', 'suppliers', 'reports'];
    act(() => root.render(<App />));
    for (const [screen, component] of [['customers', CustomersManager], ['suppliers', SuppliersManager], ['reports', Reports]]) {
        select(screen);
        expect(component).toHaveBeenCalled();
        expect(container.textContent).not.toContain('not included');
    }
    expect(container.textContent).toContain('Sample preview');
});
test('missing or malformed plan configuration blocks protected screens', () => {
    mockSession.planConfigured = false;
    act(() => root.render(<App />));
    expect(container.textContent).toContain('configuration is unavailable');
    expect(POSScreen).not.toHaveBeenCalled();
    select('customers');
    expect(CustomersManager).not.toHaveBeenCalled();
});
test('POS requires both sales and product access; catalog does not require sales access', () => {
    mockSession.features = ['products'];
    act(() => root.render(<App />));
    expect(POSScreen).not.toHaveBeenCalled();
    select('products');
    expect(ProductsManager).toHaveBeenCalled();
    select('orders');
    expect(OrdersManager).not.toHaveBeenCalled();
    select('categories');
    expect(CategoriesManager).not.toHaveBeenCalled();
    select('inventory');
    expect(InventoryManager).toHaveBeenCalled();
});