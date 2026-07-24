/* ========== Inventory Manager ========== */
class InventoryManager {
    constructor() {
        this.inventory = [];
    }

    async initialize() {
        try {
            this.inventory = await db.getAll('inventory');

            if (this.inventory.length === 0) {
                await this.seedDefaultInventory();
            }
        } catch (error) {
            console.error('Error initializing inventory:', error);
        }
    }

    async seedDefaultInventory() {
        const branches = await branches.getBranches();
        const allProducts = products.getProducts();

        for (const product of allProducts) {
            for (const branch of branches) {
                const quantity = Math.floor(Math.random() * (product.maxStock - product.minStock + 1)) + product.minStock;
                try {
                    const inventoryItem = {
                        productId: product.id,
                        branchId: branch.id,
                        quantity,
                        lastUpdated: dateUtils.getCurrentDateTime(),
                        notes: ''
                    };
                    await db.add('inventory', inventoryItem);
                } catch (error) {
                    console.error('Error seeding inventory:', error);
                }
            }
        }

        this.inventory = await db.getAll('inventory');
    }

    async updateQuantity(productId, branchId, quantity, notes = '') {
        try {
            const item = this.inventory.find(i => i.productId === productId && i.branchId === branchId);
            const product = products.getProduct(productId);
            const branch = branches.getBranch(branchId);

            if (!item) {
                const newItem = {
                    productId,
                    branchId,
                    quantity,
                    lastUpdated: dateUtils.getCurrentDateTime(),
                    notes
                };
                const id = await db.add('inventory', newItem);
                newItem.id = id;
                this.inventory.push(newItem);
            } else {
                item.quantity = quantity;
                item.lastUpdated = dateUtils.getCurrentDateTime();
                item.notes = notes;
                await db.put('inventory', item);
            }

            // Check for alerts
            const status = this.getInventoryStatus(product, quantity);
            const alert = NotificationsManager.createInventoryAlert(
                product.name, quantity, product.minStock, product.maxStock
            );
            await notifications.addNotification(alert);

            await auth.logActivity(
                'inventory-updated',
                `تحديث مخزون: ${product.name} في ${branch.name} = ${quantity}`,
                { productId, branchId, quantity }
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating inventory:', error);
            return { success: false, error: error.message };
        }
    }

    getInventoryStatus(product, quantity) {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= product.minStock) return 'low';
        if (quantity >= product.maxStock) return 'high';
        return 'balanced';
    }

    getInventoryItem(productId, branchId) {
        return this.inventory.find(i => i.productId === productId && i.branchId === branchId);
    }

    getProductInventory(productId) {
        return this.inventory.filter(i => i.productId === productId);
    }

    getBranchInventory(branchId) {
        return this.inventory.filter(i => i.branchId === branchId);
    }

    getInventory() {
        return this.inventory;
    }

    getInventoryWithDetails() {
        return this.inventory.map(item => {
            const product = products.getProduct(item.productId);
            const branch = branches.getBranch(item.branchId);
            const status = this.getInventoryStatus(product, item.quantity);
            const value = product.cost * item.quantity;

            return {
                ...item,
                productName: product?.name || '-',
                productCategory: product?.category || '-',
                branchName: branch?.name || '-',
                status,
                value,
                minStock: product?.minStock || 0,
                maxStock: product?.maxStock || 0,
                price: product?.price || 0
            };
        });
    }

    searchInventory(query) {
        if (!query) return this.getInventoryWithDetails();
        const lowerQuery = query.toLowerCase();
        return this.getInventoryWithDetails().filter(item =>
            item.productName.toLowerCase().includes(lowerQuery) ||
            item.branchName.toLowerCase().includes(lowerQuery)
        );
    }

    getTotalInventoryValue() {
        return arrayUtils.sumBy(this.getInventoryWithDetails(), 'value');
    }

    getLowStockItems() {
        return this.getInventoryWithDetails().filter(item => item.status === 'low');
    }

    getOutOfStockItems() {
        return this.getInventoryWithDetails().filter(item => item.status === 'out-of-stock');
    }

    getHighStockItems() {
        return this.getInventoryWithDetails().filter(item => item.status === 'high');
    }

    getInventoryStats() {
        const items = this.getInventoryWithDetails();
        return {
            totalItems: items.length,
            totalValue: this.getTotalInventoryValue(),
            lowStock: this.getLowStockItems().length,
            outOfStock: this.getOutOfStockItems().length,
            highStock: this.getHighStockItems().length
        };
    }

    getBranchInventoryStats(branchId) {
        const branchItems = this.getInventoryWithDetails().filter(i => i.branchId === branchId);
        return {
            totalItems: branchItems.length,
            totalValue: arrayUtils.sumBy(branchItems, 'value'),
            lowStock: branchItems.filter(i => i.status === 'low').length,
            balanced: branchItems.filter(i => i.status === 'balanced').length
        };
    }
}

// Initialize Inventory Manager
const inventory = new InventoryManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = inventory;
}
