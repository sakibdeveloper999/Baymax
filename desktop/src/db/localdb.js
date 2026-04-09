/**
 * IndexedDB Module: Offline-first local storage
 * Stores products, cart items, and pending orders for sync
 */

class LocalDB {
    constructor() {
        this.db = null;
        this.ready = this.init();
        this.isDev = process.env.NODE_ENV === 'development';
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BaymaxPOS', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                if (this.isDev) console.log('✅ IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productsStore = db.createObjectStore('products', { keyPath: 'id' });
                    productsStore.createIndex('barcode', 'barcode', { unique: true });
                    if (this.isDev) console.log('📦 Products store created');
                }

                // Cart items store
                if (!db.objectStoreNames.contains('cartItems')) {
                    db.createObjectStore('cartItems', { keyPath: 'id', autoIncrement: true });
                    if (this.isDev) console.log('🛒 Cart store created');
                }

                // Orders store
                if (!db.objectStoreNames.contains('orders')) {
                    const ordersStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
                    ordersStore.createIndex('status', 'status', { unique: false });
                    ordersStore.createIndex('createdAt', 'createdAt', { unique: false });
                    if (this.isDev) console.log('📝 Orders store created');
                }

                // Sync log store
                if (!db.objectStoreNames.contains('syncLog')) {
                    db.createObjectStore('syncLog', { keyPath: 'id', autoIncrement: true });
                    if (this.isDev) console.log('🔄 Sync log store created');
                }
            };
        });
    }

    // Products
    async getProductByBarcode(barcode) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('products', 'readonly');
            const index = tx.objectStore('products').index('barcode');
            const request = index.get(barcode);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllProducts() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('products', 'readonly');
            const request = tx.objectStore('products').getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addProduct(product) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('products', 'readwrite');
            const request = tx.objectStore('products').add(product);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateProduct(product) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('products', 'readwrite');
            const request = tx.objectStore('products').put(product);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Cart Items
    async addCartItem(item) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('cartItems', 'readwrite');
            const request = tx.objectStore('cartItems').add(item);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getCartItems() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('cartItems', 'readonly');
            const request = tx.objectStore('cartItems').getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clearCart() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('cartItems', 'readwrite');
            const request = tx.objectStore('cartItems').clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Orders
    async saveOrder(order) {
        await this.ready;
        const orderData = {
            ...order,
            status: 'pending_sync',
            createdAt: new Date(),
        };
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('orders', 'readwrite');
            const request = tx.objectStore('orders').add(orderData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getPendingOrders() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('orders', 'readonly');
            const index = tx.objectStore('orders').index('status');
            const request = index.getAll('pending_sync');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateOrderStatus(orderId, status) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('orders', 'readwrite');
            const store = tx.objectStore('orders');
            const getRequest = store.get(orderId);

            getRequest.onsuccess = () => {
                const order = getRequest.result;
                order.status = status;
                const updateRequest = store.put(order);
                updateRequest.onsuccess = () => resolve(order);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    // Sync Log
    async logSync(syncData) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('syncLog', 'readwrite');
            const request = tx.objectStore('syncLog').add({
                ...syncData,
                timestamp: new Date(),
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

export default new LocalDB();
