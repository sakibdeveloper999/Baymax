import { create } from 'zustand';
import localDB from '../db/localdb';

const useOrderStore = create((set, get) => ({
    orders: [],
    currentOrder: null,

    createOrder: async (items, subtotal, discount = 0, tax = 0) => {
        const total = subtotal - discount + tax;
        const order = {
            items,
            subtotal,
            discount,
            tax,
            total,
            paymentMethod: 'cash',
            status: 'pending_sync',
        };

        try {
            const orderId = await localDB.saveOrder(order);
            set((state) => ({
                orders: [...state.orders, { ...order, id: orderId }],
                currentOrder: { ...order, id: orderId },
            }));
            return { success: true, orderId };
        } catch (error) {
            console.error('Error saving order:', error);
            return { success: false, error: error.message };
        }
    },

    loadPendingOrders: async () => {
        try {
            const pending = await localDB.getPendingOrders();
            set({ orders: pending });
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    },

    setCurrentOrder: (order) => set({ currentOrder: order }),
    clearCurrentOrder: () => set({ currentOrder: null }),
}));

export default useOrderStore;
