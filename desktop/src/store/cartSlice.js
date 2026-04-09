import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: [],

    addItem: (product) =>
        set((state) => {
            const existing = state.items.find((item) => item.productId === product.id || item.productId === product._id);

            if (existing) {
                return {
                    items: state.items.map((item) =>
                        (item.productId === product.id || item.productId === product._id)
                            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                            : item
                    ),
                };
            }

            return {
                items: [
                    ...state.items,
                    {
                        productId: product.id || product._id,
                        productName: product.name,
                        unitPrice: product.sellingPrice || product.price,
                        quantity: product.quantity || 1,
                    },
                ],
            };
        }),

    removeItem: (productId) =>
        set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
        })),

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }
        set((state) => ({
            items: state.items.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            ),
        }));
    },

    clearCart: () => set({ items: [] }),

    getTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    },

    getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0)

    },
}));
    
        export default useCartStore;
