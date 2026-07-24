/* ========== IndexedDB Manager ========== */
class DatabaseManager {
    constructor(dbName = 'PointMarketDB', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized:', this.dbName);
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createObjectStores(db);
            };
        });
    }

    createObjectStores(db) {
        // Users Store
        if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('username', 'username', { unique: true });
            userStore.createIndex('email', 'email', { unique: false });
        }

        // Products Store
        if (!db.objectStoreNames.contains('products')) {
            const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productStore.createIndex('category', 'category', { unique: false });
            productStore.createIndex('name', 'name', { unique: false });
        }

        // Branches Store
        if (!db.objectStoreNames.contains('branches')) {
            const branchStore = db.createObjectStore('branches', { keyPath: 'id', autoIncrement: true });
            branchStore.createIndex('name', 'name', { unique: false });
        }

        // Inventory Store
        if (!db.objectStoreNames.contains('inventory')) {
            const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
            inventoryStore.createIndex('productId', 'productId', { unique: false });
            inventoryStore.createIndex('branchId', 'branchId', { unique: false });
            inventoryStore.createIndex('productBranch', ['productId', 'branchId'], { unique: true });
        }

        // Sales Store
        if (!db.objectStoreNames.contains('sales')) {
            const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
            salesStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: true });
            salesStore.createIndex('branchId', 'branchId', { unique: false });
            salesStore.createIndex('date', 'date', { unique: false });
        }

        // Notifications Store
        if (!db.objectStoreNames.contains('notifications')) {
            const notificationStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
            notificationStore.createIndex('timestamp', 'timestamp', { unique: false });
            notificationStore.createIndex('type', 'type', { unique: false });
        }

        // Activity Log Store
        if (!db.objectStoreNames.contains('activityLog')) {
            const logStore = db.createObjectStore('activityLog', { keyPath: 'id', autoIncrement: true });
            logStore.createIndex('timestamp', 'timestamp', { unique: false });
            logStore.createIndex('userId', 'userId', { unique: false });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
    }

    // Generic Methods
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async query(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Backup & Restore
    async exportData() {
        const backup = {};
        const storeNames = [
            'users', 'products', 'branches', 'inventory',
            'sales', 'notifications', 'activityLog', 'settings'
        ];

        for (const storeName of storeNames) {
            try {
                backup[storeName] = await this.getAll(storeName);
            } catch (error) {
                console.error(`Error exporting ${storeName}:`, error);
            }
        }

        return backup;
    }

    async importData(backup) {
        for (const [storeName, data] of Object.entries(backup)) {
            if (!Array.isArray(data)) continue;

            try {
                await this.clear(storeName);
                for (const record of data) {
                    await this.put(storeName, record);
                }
            } catch (error) {
                console.error(`Error importing ${storeName}:`, error);
            }
        }
    }
}

// Initialize Database Manager
const db = new DatabaseManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = db;
}
