import { create } from 'zustand';

const emptyCart = { items: [], discount: 0, discountType: 'percentage', taxRate: 0, paymentMethod: 'cash', isHeld: false, holdNotes: '' };
let storageKey = 'baymax-cart:guest';
function readSaved(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        return value && Array.isArray(value.items) && Array.isArray(value.heldOrders) ? value : {};
    } catch { return {}; }
}
function snapshot(state) {
    return Object.fromEntries(Object.keys(emptyCart).map(key => [key, state[key]]));
}
function heldSnapshot(state, notes) {
    return { ...snapshot(state), id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, holdNotes: notes, heldAt: new Date().toISOString() };
}
const useCartStore = create((set, get) => ({
    ...emptyCart,
    heldOrders: [],
    ...readSaved(storageKey),
    addItem: (product) => {
        const productId = product.id ?? product._id;
        const unitPrice = Number(product.sellingPrice ?? product.price);
        const quantity = Number(product.quantity ?? 1);
        if (productId == null || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isInteger(quantity) || quantity <= 0) return false;
        set(state => {
            const existing = state.items.find(item => item.productId === productId);
            return { items: existing
                ? state.items.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item)
                : [...state.items, { productId, productName: product.name, unitPrice, quantity }] };
        });
        return true;
    },
    removeItem: productId => set(state => ({ items: state.items.filter(item => item.productId !== productId) })),
    updateQuantity: (productId, quantity) => {
        quantity = Number(quantity);
        if (!Number.isInteger(quantity)) return;
        if (quantity <= 0) return get().removeItem(productId);
        set(state => ({ items: state.items.map(item => item.productId === productId ? { ...item, quantity } : item) }));
    },
    clearCart: () => set(state => ({ ...emptyCart, taxRate: state.taxRate })),
    setDiscount: (amount, type = 'percentage') => set({ discount: Math.max(0, Number(amount) || 0), discountType: type }),
    setTaxRate: rate => set({ taxRate: Math.max(0, Math.min(100, Number(rate) || 0)) }),
    setPaymentMethod: method => set({ paymentMethod: method }),
    holdOrder: (notes = '') => {
        if (!get().items.length) return false;
        set(state => ({ ...emptyCart, taxRate: state.taxRate, heldOrders: [...state.heldOrders, heldSnapshot(state, notes)] }));
        return true;
    },
    resumeOrder: id => {
        const held = get().heldOrders.find(order => order.id === id);
        if (!held) return false;
        set(state => ({
            ...snapshot(held),
            isHeld: false,
            heldOrders: [
                ...state.heldOrders.filter(order => order.id !== id),
                ...(state.items.length ? [heldSnapshot(state, state.holdNotes)] : []),
            ],
        }));
        return true;
    },
    releaseHold: () => set({ isHeld: false, holdNotes: '' }),
    getTotal: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const discountAmount = state.discountType === 'percentage'
            ? subtotal * Math.max(0, Math.min(100, state.discount)) / 100
            : Math.max(0, Math.min(subtotal, state.discount));
        return Math.round((subtotal - discountAmount) * (1 + state.taxRate / 100) * 100) / 100;
    },
    getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    getItems: () => get().items,
}));

// Separate local cart state for each signed-in user and store. These keys are not authorization.
export function activateCartScope(tenantId, userId, storeId) {
    const nextKey = tenantId && userId && storeId ? `baymax-cart:${tenantId}:${userId}:${storeId}` : 'baymax-cart:guest';
    const saved = readSaved(nextKey);
    storageKey = nextKey;
    useCartStore.setState({ ...emptyCart, heldOrders: [], ...saved });
}
useCartStore.subscribe(state => {
    try { localStorage.setItem(storageKey, JSON.stringify({ ...snapshot(state), heldOrders: state.heldOrders })); }
    catch { /* Keep the current cart usable when browser storage is unavailable. */ }
});
export default useCartStore;
