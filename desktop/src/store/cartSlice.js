import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: [],
    discount: 0,
    discountType: 'percentage', // 'percentage' or 'fixed'
    taxRate: 0,
    paymentMethod: 'cash', // 'cash', 'card', 'mobile'
    isHeld: false,
    holdNotes: '',

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

    setDiscount: (amount, type = 'percentage') =>
        set({ discount: amount, discountType: type }),

    setTaxRate: (rate) =>
        set({ taxRate: rate }),

    setPaymentMethod: (method) =>
        set({ paymentMethod: method }),

    holdOrder: (notes = '') =>
        set({ isHeld: true, holdNotes: notes }),

    releaseHold: () =>
        set({ isHeld: false, holdNotes: '' }),

    getTotal: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

        // Calculate discount
        const discountAmount = state.discountType === 'percentage'
            ? (subtotal * state.discount) / 100
            : state.discount;

        // Calculate tax on discounted amount
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * state.taxRate) / 100;

        return Math.round((taxableAmount + taxAmount) * 100) / 100;
    },

    getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0)

    },
}));

export default useCartStore;
