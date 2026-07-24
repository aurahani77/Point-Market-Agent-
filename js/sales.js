/* ========== Sales Manager ========== */
class SalesManager {
    constructor() {
        this.sales = [];
        this.currentInvoice = null;
    }

    async initialize() {
        try {
            this.sales = await db.getAll('sales');
        } catch (error) {
            console.error('Error initializing sales:', error);
        }
    }

    startInvoice(branchId) {
        this.currentInvoice = {
            invoiceNumber: stringUtils.generateInvoiceNumber(),
            branchId,
            items: [],
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0,
            startedAt: dateUtils.getCurrentDateTime()
        };
        return this.currentInvoice;
    }

    addItemToInvoice(productId, quantity, price = null) {
        if (!this.currentInvoice) {
            throw new Error('No active invoice');
        }

        const product = products.getProduct(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const itemPrice = price || product.price;
        const itemTotal = itemPrice * quantity;

        this.currentInvoice.items.push({
            productId,
            productName: product.name,
            quantity,
            price: itemPrice,
            total: itemTotal,
            cost: product.cost,
            profit: (itemPrice - product.cost) * quantity
        });

        this.recalculateInvoice();
        return this.currentInvoice;
    }

    removeItemFromInvoice(productId) {
        if (!this.currentInvoice) return;
        this.currentInvoice.items = this.currentInvoice.items.filter(i => i.productId !== productId);
        this.recalculateInvoice();
    }

    setDiscount(amount) {
        if (!this.currentInvoice) return;
        this.currentInvoice.discount = amount;
        this.recalculateInvoice();
    }

    recalculateInvoice() {
        if (!this.currentInvoice) return;

        const subtotal = arrayUtils.sumBy(this.currentInvoice.items, 'total');
        const tax = subtotal * 0.15; // 15% VAT
        const total = subtotal + tax - this.currentInvoice.discount;

        this.currentInvoice.subtotal = subtotal;
        this.currentInvoice.tax = tax;
        this.currentInvoice.total = Math.max(0, total);
    }

    async completeInvoice() {
        if (!this.currentInvoice || this.currentInvoice.items.length === 0) {
            throw new Error('Invalid invoice');
        }

        try {
            const sale = {
                ...this.currentInvoice,
                date: dateUtils.getCurrentDateTime(),
                completedAt: dateUtils.getCurrentDateTime()
            };

            const id = await db.add('sales', sale);
            sale.id = id;
            this.sales.push(sale);

            // Update inventory
            for (const item of sale.items) {
                const inventoryItem = inventory.getInventoryItem(item.productId, sale.branchId);
                if (inventoryItem) {
                    const newQuantity = Math.max(0, inventoryItem.quantity - item.quantity);
                    await inventory.updateQuantity(item.productId, sale.branchId, newQuantity);
                }
            }

            // Add notification
            const alert = NotificationsManager.createSaleAlert(sale.invoiceNumber, sale.total, 'success');
            await notifications.addNotification(alert);

            await auth.logActivity('sale-completed', `اكتمال بيع: #${sale.invoiceNumber}`, {
                invoiceNumber: sale.invoiceNumber,
                total: sale.total
            });

            this.currentInvoice = null;
            return { success: true, sale };
        } catch (error) {
            console.error('Error completing invoice:', error);
            return { success: false, error: error.message };
        }
    }

    cancelInvoice() {
        this.currentInvoice = null;
    }

    getSale(id) {
        return this.sales.find(s => s.id === id);
    }

    getSales() {
        return this.sales.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getSalesByBranch(branchId) {
        return this.sales.filter(s => s.branchId === branchId);
    }

    getSalesByDate(date) {
        return this.sales.filter(s => dateUtils.formatDate(s.date) === dateUtils.formatDate(date));
    }

    getTotalSales(startDate = null, endDate = null) {
        let filtered = this.sales;

        if (startDate && endDate) {
            filtered = filtered.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
            });
        }

        return arrayUtils.sumBy(filtered, 'total');
    }

    getTotalProfit(startDate = null, endDate = null) {
        let filtered = this.sales;

        if (startDate && endDate) {
            filtered = filtered.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
            });
        }

        return filtered.reduce((total, sale) => {
            const profit = sale.items.reduce((sum, item) => sum + item.profit, 0);
            return total + profit;
        }, 0);
    }

    getTopSellingItems(limit = 5) {
        const items = {};

        this.sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!items[item.productName]) {
                    items[item.productName] = { quantity: 0, total: 0 };
                }
                items[item.productName].quantity += item.quantity;
                items[item.productName].total += item.total;
            });
        });

        return Object.entries(items)
            .map(([name, data]) => ({ productName: name, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit);
    }

    getSalesStats() {
        const today = dateUtils.getCurrentDate();
        const todaySales = this.getSalesByDate(today);

        return {
            totalSales: this.sales.length,
            totalRevenue: arrayUtils.sumBy(this.sales, 'total'),
            totalProfit: this.getTotalProfit(),
            todaySales: todaySales.length,
            todayRevenue: arrayUtils.sumBy(todaySales, 'total'),
            averageSaleAmount: this.sales.length > 0 ? arrayUtils.sumBy(this.sales, 'total') / this.sales.length : 0
        };
    }
}

// Initialize Sales Manager
const sales = new SalesManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sales;
}
