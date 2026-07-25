/* ========== Seed Data Manager ========== */
class SeedersManager {
    constructor(db, productsManager, branchesManager, inventoryManager, salesManager) {
        this.db = db;
        this.productsManager = productsManager;
        this.branchesManager = branchesManager;
        this.inventoryManager = inventoryManager;
        this.salesManager = salesManager;
    }

    // Generate Random Date within last 3 months
    randomDateLastThreeMonths() {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
    }

    // Generate Random Quantity
    randomQuantity(min = 5, max = 50) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate Seed Sales Data (Historical Sales)
    async seedHistoricalSales() {
        console.log('🌱 Seeding Historical Sales Data...');
        const products = this.productsManager.getAll();
        const branches = this.branchesManager.getAll();
        const invoiceBaseNumber = 10001;

        // Generate 200 historical sales transactions
        for (let i = 0; i < 200; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomBranch = branches[Math.floor(Math.random() * branches.length)];
            const randomQuantity = this.randomQuantity(1, 15);
            const randomDate = this.randomDateLastThreeMonths();

            const sale = {
                invoiceNumber: `INV-${invoiceBaseNumber + i}`,
                branchId: randomBranch.id,
                branchName: randomBranch.name,
                date: randomDate.toISOString(),
                items: [
                    {
                        productId: randomProduct.id,
                        productName: randomProduct.name,
                        quantity: randomQuantity,
                        price: randomProduct.price,
                        total: randomQuantity * randomProduct.price
                    }
                ],
                subtotal: randomQuantity * randomProduct.price,
                tax: (randomQuantity * randomProduct.price) * 0.15,
                discount: Math.random() > 0.8 ? (randomQuantity * randomProduct.price) * 0.05 : 0,
                total: (randomQuantity * randomProduct.price) * 1.15,
                status: 'completed',
                paymentMethod: ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)],
                notes: ['Regular sale', 'Bulk order', 'Discount applied', ''][Math.floor(Math.random() * 4)]
            };

            try {
                await this.db.add('sales', sale);
            } catch (error) {
                console.warn('Could not add sale:', error.message);
            }
        }
        console.log('✅ Historical Sales Seeded: 200 transactions');
    }

    // Seed Inventory Movement History
    async seedInventoryMovements() {
        console.log('🌱 Seeding Inventory Movement History...');
        const inventoryStore = await this.db.getAll('inventory');

        // Add a movement history for sample inventory items
        for (let i = 0; i < Math.min(50, inventoryStore.length); i++) {
            const randomDate = this.randomDateLastThreeMonths();
            const movement = {
                inventoryId: inventoryStore[i].id,
                productId: inventoryStore[i].productId,
                branchId: inventoryStore[i].branchId,
                type: ['in', 'out', 'adjustment'][Math.floor(Math.random() * 3)],
                quantity: this.randomQuantity(5, 30),
                reason: [
                    'Purchase Order',
                    'Sales Transaction',
                    'Stock Adjustment',
                    'Damaged Goods',
                    'Transfer Between Branches'
                ][Math.floor(Math.random() * 5)],
                date: randomDate.toISOString(),
                timestamp: randomDate.getTime()
            };

            try {
                await this.db.add('inventoryMovements', movement);
            } catch (error) {
                // Store might not exist yet
            }
        }
        console.log('✅ Inventory Movements Seeded: 50 movements');
    }

    // Seed Product Reviews/Ratings
    async seedProductReviews() {
        console.log('🌱 Seeding Product Reviews...');
        const products = this.productsManager.getAll();

        for (const product of products) {
            const reviewCount = this.randomQuantity(5, 20);
            const reviews = [];

            for (let i = 0; i < reviewCount; i++) {
                reviews.push({
                    productId: product.id,
                    rating: Math.floor(Math.random() * 5) + 1,
                    text: [
                        'Excellent quality and freshness!',
                        'Good value for money',
                        'Very satisfied with purchase',
                        'Highly recommend',
                        'Best quality in market',
                        'Fast delivery',
                        'Good packaging',
                        'Competitive price',
                        'Always reliable',
                        'Will buy again'
                    ][Math.floor(Math.random() * 10)],
                    date: this.randomDateLastThreeMonths().toISOString(),
                    customer: `Customer ${Math.floor(Math.random() * 1000)}`
                });
            }

            try {
                await this.db.add('productReviews', { productId: product.id, reviews });
            } catch (error) {
                // Store might not exist
            }
        }
        console.log('✅ Product Reviews Seeded: Ratings for all products');
    }

    // Seed System Notifications
    async seedNotifications() {
        console.log('🌱 Seeding System Notifications...');
        const notifications = [
            {
                type: 'info',
                title: 'Welcome to Point Market System',
                message: 'Your inventory management system is ready to use',
                timestamp: new Date().getTime(),
                read: true
            },
            {
                type: 'warning',
                title: 'Low Stock Alert',
                message: 'Several products are running low on inventory',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).getTime(),
                read: true
            },
            {
                type: 'success',
                title: 'High Sales Today',
                message: 'Today sales exceeded target by 25%',
                timestamp: new Date(Date.now() - 60 * 60 * 1000).getTime(),
                read: true
            },
            {
                type: 'error',
                title: 'Stock Out Warning',
                message: 'Banana inventory is out of stock at Riyadh branch',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).getTime(),
                read: false
            },
            {
                type: 'info',
                title: 'New Sales Record',
                message: 'Milk product reached highest sales volume this month',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).getTime(),
                read: false
            }
        ];

        for (const notification of notifications) {
            try {
                await this.db.add('notifications', notification);
            } catch (error) {
                console.warn('Could not add notification:', error.message);
            }
        }
        console.log('✅ Notifications Seeded: 5 notifications');
    }

    // Seed Activity Logs
    async seedActivityLogs() {
        console.log('🌱 Seeding Activity Logs...');
        const activities = [
            { action: 'Login', user: 'Admin', timestamp: new Date(Date.now() - 5 * 60 * 1000).getTime() },
            { action: 'Created Invoice', user: 'Manager', timestamp: new Date(Date.now() - 15 * 60 * 1000).getTime() },
            { action: 'Updated Inventory', user: 'Staff', timestamp: new Date(Date.now() - 30 * 60 * 1000).getTime() },
            { action: 'Generated Report', user: 'Admin', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).getTime() },
            { action: 'Added New Product', user: 'Manager', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).getTime() },
            { action: 'Backup Created', user: 'System', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).getTime() },
            { action: 'Inventory Check', user: 'Staff', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).getTime() },
        ];

        for (const activity of activities) {
            try {
                await this.db.add('activityLog', activity);
            } catch (error) {
                console.warn('Could not add activity:', error.message);
            }
        }
        console.log('✅ Activity Logs Seeded: 7 activities');
    }

    // Seed All Data
    async seedAll() {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   🌱 Starting Database Seeding... 🌱   ║');
        console.log('╚════════════════════════════════════════╝\n');

        try {
            // Check if seeded already
            const salesCount = await this.db.getAll('sales');
            if (salesCount.length > 50) {
                console.log('⏭️  Database already seeded, skipping...');
                return;
            }

            // Seed data
            await this.seedHistoricalSales();
            await this.seedInventoryMovements();
            await this.seedProductReviews();
            await this.seedNotifications();
            await this.seedActivityLogs();

            console.log('\n╔════════════════════════════════════════╗');
            console.log('║   ✅ Seeding Complete! Ready to use! ✅   ║');
            console.log('╚════════════════════════════════════════╝\n');
        } catch (error) {
            console.error('❌ Seeding Error:', error);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeedersManager;
}
