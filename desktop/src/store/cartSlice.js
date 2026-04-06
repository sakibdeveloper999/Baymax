import { create } from 'zustand';

const useCartStore = create((set) => ({
    items: [],
    addItem: (product) =>
        set((state) => {
            const existing = state.items.find((item) => item.productId === product.productId);
            if (existing) {
                return {
                    items: state.items.map((item) =>
                        item.productId === product.productId
                            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                            : item
                    ),
                };
            }
            return { items: [...state.items, { ...product, quantity: product.quantity || 1 }] };
        }),
    removeItem: (productId) =>
        set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
        })),
    updateQuantity: (productId, quantity) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            ),
        })),
    clearCart: () => set({ items: [] }),
    getTotal: () => {
        // Calculate total (to be used in components)
        return 0; // Placeholder
    },
}));

export default useCartStore;
