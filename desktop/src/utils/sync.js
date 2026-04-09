import apiClient from '../config/api';
import localDB from '../db/localdb';

/**
 * SyncService: Manages online/offline state and data syncing
 */
class SyncService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.setupListeners();
        // Status shown in UI - no need to log
    }

    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            // Sync when connection restored
            this.syncPendingOrders();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            // Status shown in UI - no console log needed
        });
    }

    /**
     * Sync all pending orders to backend
     */
    async syncPendingOrders() {
        if (!this.isOnline) {
            return; // Offline - skip sync
        }

        try {
            const pendingOrders = await localDB.getPendingOrders();

            if (pendingOrders.length === 0) {
                return; // Nothing to sync
            }

            for (const order of pendingOrders) {
                try {
                    // POST to backend
                    const response = await apiClient.post('/api/orders', order);

                    if (response.data.success) {
                        // Mark as synced in local DB
                        await localDB.updateOrderStatus(order.id, 'synced');
                        await localDB.logSync({
                            orderId: order.id,
                            status: 'success',
                            serverOrderId: response.data.data.orderId,
                        });
                    }
                } catch (error) {
                    // Log failed sync attempts
                    await localDB.logSync({
                        orderId: order.id,
                        status: 'failed',
                        error: error.message,
                    });
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    /**
     * Fetch latest products from backend and cache locally
     * Gracefully handles backend unavailability (offline-first)
     */
    async syncProducts() {
        if (!this.isOnline) {
            return; // Offline - silently skip sync
        }

        try {
            // Create a timeout promise (3 second timeout)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 3000)
            );

            const response = await Promise.race([
                apiClient.get('/api/products'),
                timeoutPromise,
            ]);

            if (response.data.success) {
                // Cache products from backend
                for (const product of response.data.data) {
                    await localDB.updateProduct({
                        id: product._id,
                        ...product,
                    });
                }
                console.log('✅ Products synced from backend');
            }
        } catch (error) {
            // Silently ignore - using cached products instead
            // Only log errors in development
            if (process.env.NODE_ENV === 'development') {
                console.debug('ℹ️ Backend sync skipped:', error.message);
            }
        }
    }

    getStatus() {
        return this.isOnline ? 'online' : 'offline';
    }
}

export default new SyncService();

