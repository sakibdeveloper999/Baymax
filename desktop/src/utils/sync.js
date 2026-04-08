// Network detection and sync service
class SyncService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 Online');
            this.syncPendingOrders();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 Offline');
        });
    }

    async syncPendingOrders() {
        if (!this.isOnline) return;

        console.log('🔄 Syncing pending orders...');
        // TODO: Fetch pending orders from SQLite and POST to backend
    }

    queueOrder(order) {
        this.syncQueue.push(order);
        console.log('📦 Order queued for sync:', order);
    }
}

export default new SyncService();
