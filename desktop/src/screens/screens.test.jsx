import React from 'react';
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
test('POS shows the selected product and removes it', () => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    useCartStore.setState({ items: [] });
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        act(() => root.render(<POSScreen />));
        const product = Array.from(container.querySelectorAll('button')).find(button => button.textContent.includes('Rice 5kg'));
        act(() => product.click());
        expect(container.textContent).not.toContain('NaN');
        expect(container.textContent).toContain('$200 x 1');
        const remove = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Remove');
        act(() => remove.click());
        expect(container.textContent).toContain('Cart is empty');
    } finally {
        act(() => root.unmount());
        delete global.IS_REACT_ACT_ENVIRONMENT;
    }
});
