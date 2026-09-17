import useCartStore, { activateCartScope } from './cartSlice';

beforeEach(() => useCartStore.setState({ items: [], heldOrders: [], discount: 0, discountType: 'percentage', taxRate: 0 }));
test('adds, merges, totals and removes products using their stable ID', () => {
    const product = { id: 1, name: 'Rice', price: 200 };
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(product);
    expect(useCartStore.getState().items[0]).toMatchObject({ productId: 1, productName: 'Rice', unitPrice: 200, quantity: 2 });
    expect(useCartStore.getState().getTotal()).toBe(400);
    useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items).toHaveLength(0);
});
test('preserves a zero selling price', () => {
    useCartStore.getState().addItem({ _id: 'free', name: 'Free item', sellingPrice: 0, price: 10 });
    expect(useCartStore.getState().getTotal()).toBe(0);
});
test('clamps discounts before applying tax', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Rice', price: 100 });
    useCartStore.getState().setDiscount(150);
    useCartStore.getState().setTaxRate(10);
    expect(useCartStore.getState().getTotal()).toBe(0);
});

test('holding frees the cart and resuming preserves the other active sale', () => {
    useCartStore.getState().addItem({ id: 1, name: 'Rice', price: 10 });
    useCartStore.getState().holdOrder('Customer will return');
    expect(useCartStore.getState().items).toHaveLength(0);
    const heldId = useCartStore.getState().heldOrders[0].id;
    useCartStore.getState().addItem({ id: 2, name: 'Milk', price: 5 });
    useCartStore.getState().resumeOrder(heldId);
    expect(useCartStore.getState().items[0].productName).toBe('Rice');
    expect(useCartStore.getState().heldOrders[0].items[0].productName).toBe('Milk');
});
test('saved carts restore and remain separate across tenants and stores', () => {
    localStorage.clear();
    activateCartScope('tenant-a', 'user-a', 'store-a');
    useCartStore.getState().addItem({ id: 1, name: 'Rice', price: 10 });
    activateCartScope('tenant-b', 'user-b', 'store-b');
    expect(useCartStore.getState().items).toHaveLength(0);
    activateCartScope('tenant-a', 'user-a', 'store-a');
    expect(useCartStore.getState().items[0].productName).toBe('Rice');
    activateCartScope();
});
