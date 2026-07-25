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

    // Seed Products
    async seedProducts() {
        console.log('🌱 Seeding Products...');
        const productsData = [
            { name: 'تفاح أحمر', category: 'فواكه', price: 8, cost: 5, minStock: 10, maxStock: 50 },
            { name: 'برتقال', category: 'فواكه', price: 6, cost: 3, minStock: 15, maxStock: 60 },
            { name: 'موز', category: 'فواكه', price: 5, cost: 2, minStock: 20, maxStock: 80 },
            { name: 'عنب أبيض', category: 'فواكه', price: 12, cost: 7, minStock: 8, maxStock: 40 },
            { name: 'بطيخ أحمر', category: 'فواكه', price: 15, cost: 8, minStock: 5, maxStock: 30 },
            { name: 'خيار', category: 'خضار', price: 3, cost: 1, minStock: 30, maxStock: 100 },
            { name: 'طماطم', category: 'خضار', price: 4, cost: 2, minStock: 25, maxStock: 90 },
            { name: 'بصل', category: 'خضار', price: 2, cost: 1, minStock: 40, maxStock: 120 },
            { name: 'ثوم', category: 'خضار', price: 5, cost: 2, minStock: 20, maxStock: 70 },
            { name: 'جزر', category: 'خضار', price: 3, cost: 1, minStock: 35, maxStock: 110 },
            { name: 'لبن طازج', category: 'ألبان', price: 7, cost: 3, minStock: 15, maxStock: 50 },
            { name: 'جبن أبيض', category: 'ألبان', price: 20, cost: 10, minStock: 8, maxStock: 30 },
            { name: 'زبادي', category: 'ألبان', price: 6, cost: 2, minStock: 20, maxStock: 60 },
            { name: 'زبدة', category: 'ألبان', price: 25, cost: 12, minStock: 5, maxStock: 20 },
            { name: 'حليب طازج', category: 'ألبان', price: 8, cost: 4, minStock: 10, maxStock: 40 },
            { name: 'دجاج طازج', category: 'لحوم', price: 35, cost: 15, minStock: 8, maxStock: 30 },
            { name: 'لحم بقري', category: 'لحوم', price: 45, cost: 20, minStock: 6, maxStock: 25 },
            { name: 'كبدة', category: 'لحوم', price: 30, cost: 12, minStock: 5, maxStock: 20 },
            { name: 'سمك طازج', category: 'لحوم', price: 40, cost: 18, minStock: 7, maxStock: 25 },
            { name: 'جمبري', category: 'لحوم', price: 50, cost: 22, minStock: 4, maxStock: 15 },
            { name: 'خبز أبيض', category: 'مخبوزات', price: 2, cost: 1, minStock: 50, maxStock: 200 },
            { name: 'خبز بر', category: 'مخبوزات', price: 3, cost: 1.5, minStock: 40, maxStock: 150 },
            { name: 'معجنات', category: 'مخبوزات', price: 5, cost: 2, minStock: 30, maxStock: 100 },
            { name: 'كيك', category: 'مخبوزات', price: 15, cost: 6, minStock: 10, maxStock: 50 },
            { name: 'بسكويت', category: 'مخبوزات', price: 4, cost: 1.5, minStock: 60, maxStock: 200 },
            { name: 'دقيق', category: 'مواد جافة', price: 6, cost: 2.5, minStock: 20, maxStock: 80 },
            { name: 'سكر', category: 'مواد جافة', price: 7, cost: 3, minStock: 15, maxStock: 60 },
            { name: 'ملح', category: 'مواد جافة', price: 2, cost: 1, minStock: 30, maxStock: 100 },
            { name: 'زيت نباتي', category: 'مواد جافة', price: 12, cost: 5, minStock: 10, maxStock: 40 },
            { name: 'أرز', category: 'مواد جافة', price: 8, cost: 3, minStock: 20, maxStock: 80 }
        ];

        for (const product of productsData) {
            try {
                await this.productsManager.addProduct(product);
            } catch (error) {
                console.warn('Could not add product:', error.message);
            }
        }
        console.log('✅ Products Seeded: 30 products');
    }

    // Seed Branches
    async seedBranches() {
        console.log('🌱 Seeding Branches...');
        const branchesData = [
            { name: 'الرياض الرئيسية', location: 'الرياض', city: 'الرياض', phone: '0114444444', email: 'riyadh@pointmarket.sa' },
            { name: 'جدة الفرع الأول', location: 'جدة', city: 'جدة', phone: '0122222222', email: 'jeddah@pointmarket.sa' },
            { name: 'الدمام والشرقية', location: 'الدمام', city: 'الدمام', phone: '0138888888', email: 'dammam@pointmarket.sa' },
            { name: 'الخبر الفرع', location: 'الخبر', city: 'الخبر', phone: '0138888889', email: 'khobar@pointmarket.sa' },
            { name: 'مكة المكرمة', location: 'مكة', city: 'مكة', phone: '0125555555', email: 'makkah@pointmarket.sa' },
            { name: 'المدينة المنورة', location: 'المدينة', city: 'المدينة', phone: '0144444445', email: 'madinah@pointmarket.sa' },
            { name: 'القصيم', location: 'بريدة', city: 'بريدة', phone: '0163333333', email: 'qassim@pointmarket.sa' },
            { name: 'عسير', location: 'أبها', city: 'أبها', phone: '0177777777', email: 'aseer@pointmarket.sa' },
            { name: 'الباحة', location: 'الباحة', city: 'الباحة', phone: '0177666666', email: 'baha@pointmarket.sa' },
            { name: 'الحدود الشمالية', location: 'عرعر', city: 'عرعر', phone: '0148888888', email: 'northern@pointmarket.sa' },
            { name: 'تبوك', location: 'تبوك', city: 'تبوك', phone: '0144555555', email: 'tabuk@pointmarket.sa' },
            { name: 'الجوف', location: 'سكاكا', city: 'سكاكا', phone: '0146666666', email: 'jouf@pointmarket.sa' },
            { name: 'حائل', location: 'حائل', city: 'حائل', phone: '0169999999', email: 'hail@pointmarket.sa' },
            { name: 'نجران', location: 'نجران', city: 'نجران', phone: '0175555555', email: 'najran@pointmarket.sa' },
            { name: 'جيزان', location: 'جيزان', city: 'جيزان', phone: '0173333333', email: 'jizan@pointmarket.sa' },
            { name: 'الرياض 2', location: 'الرياض', city: 'الرياض', phone: '0114444446', email: 'riyadh2@pointmarket.sa' },
            { name: 'جدة 2', location: 'جدة', city: 'جدة', phone: '0122222223', email: 'jeddah2@pointmarket.sa' },
            { name: 'الدمام 2', location: 'الدمام', city: 'الدمام', phone: '0138888890', email: 'dammam2@pointmarket.sa' },
            { name: 'الرياض 3', location: 'الرياض', city: 'الرياض', phone: '0114444447', email: 'riyadh3@pointmarket.sa' },
            { name: 'جدة 3', location: 'جدة', city: 'جدة', phone: '0122222224', email: 'jeddah3@pointmarket.sa' },
            { name: 'الدمام 3', location: 'الدمام', city: 'الدمام', phone: '0138888891', email: 'dammam3@pointmarket.sa' },
            { name: 'الرياض 4', location: 'الرياض', city: 'الرياض', phone: '0114444448', email: 'riyadh4@pointmarket.sa' },
            { name: 'جدة 4', location: 'جدة', city: 'جدة', phone: '0122222225', email: 'jeddah4@pointmarket.sa' },
            { name: 'الدمام 4', location: 'الدمام', city: 'الدمام', phone: '0138888892', email: 'dammam4@pointmarket.sa' },
            { name: 'الرياض 5', location: 'الرياض', city: 'الرياض', phone: '0114444449', email: 'riyadh5@pointmarket.sa' },
            { name: 'جدة 5', location: 'جدة', city: 'جدة', phone: '0122222226', email: 'jeddah5@pointmarket.sa' },
            { name: 'الدمام 5', location: 'الدمام', city: 'الدمام', phone: '0138888893', email: 'dammam5@pointmarket.sa' },
            { name: 'القصيم 2', location: 'بريدة', city: 'بريدة', phone: '0163333334', email: 'qassim2@pointmarket.sa' },
            { name: 'عسير 2', location: 'أبها', city: 'أبها', phone: '0177777778', email: 'aseer2@pointmarket.sa' },
            { name: 'الباحة 2', location: 'الباحة', city: 'الباحة', phone: '0177666667', email: 'baha2@pointmarket.sa' },
            { name: 'تبوك 2', location: 'تبوك', city: 'تبوك', phone: '0144555556', email: 'tabuk2@pointmarket.sa' },
            { name: 'حائل 2', location: 'حائل', city: 'حائل', phone: '0169999990', email: 'hail2@pointmarket.sa' },
            { name: 'نجران 2', location: 'نجران', city: 'نجران', phone: '0175555556', email: 'najran2@pointmarket.sa' },
            { name: 'جيزان 2', location: 'جيزان', city: 'جيزان', phone: '0173333334', email: 'jizan2@pointmarket.sa' },
            { name: 'الخبر 2', location: 'الخبر', city: 'الخبر', phone: '0138888894', email: 'khobar2@pointmarket.sa' }
        ];

        for (const branch of branchesData) {
            try {
                await this.branchesManager.addBranch(branch);
            } catch (error) {
                console.warn('Could not add branch:', error.message);
            }
        }
        console.log('✅ Branches Seeded: 35 branches');
    }

    // Seed Inventory
    async seedInventory() {
        console.log('🌱 Seeding Inventory...');
        const products = this.productsManager.getAll();
        const branches = this.branchesManager.getAll();

        for (const product of products) {
            for (const branch of branches) {
                try {
                    const quantity = Math.floor(Math.random() * (product.maxStock - product.minStock + 1)) + product.minStock;
                    await this.inventoryManager.addInventoryItem({
                        productId: product.id,
                        branchId: branch.id,
                        quantity: quantity,
                        minStock: product.minStock,
                        maxStock: product.maxStock,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (error) {
                    console.warn('Could not add inventory:', error.message);
                }
            }
        }
        console.log('✅ Inventory Seeded: ' + (products.length * branches.length) + ' items');
    }

    // Seed All Data
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   🌱 Starting Database Seeding... 🌱   ║');
        console.log('╚════════════════════════════════════════╝\n');

        try {
            // Check if seeded already
            const productsCount = await this.db.getAll('products');
            if (productsCount.length > 20) {
                console.log('⏭️  Database already seeded, skipping...');
                return;
            }

            // Seed initial data
            await this.seedProducts();
            await this.seedBranches();
            await this.seedInventory();

            // Seed additional data
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
