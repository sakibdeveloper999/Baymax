import useCartStore from './cartSlice';

beforeEach(() => useCartStore.setState({ items: [], discount: 0, discountType: 'percentage', taxRate: 0 }));
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
