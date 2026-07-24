/* ========== Products Manager ========== */
class ProductsManager {
    constructor() {
        this.products = [];
        this.categories = new Set();
    }

    async initialize() {
        try {
            this.products = await db.getAll('products');
            this.products.forEach(p => this.categories.add(p.category));

            if (this.products.length === 0) {
                await this.seedDefaultProducts();
            }
        } catch (error) {
            console.error('Error initializing products:', error);
        }
    }

    async seedDefaultProducts() {
        const defaultProducts = [
            { name: 'أفوكادو', category: 'فواكه', price: 15, cost: 5, minStock: 50, maxStock: 200 },
            { name: 'تفاح أحمر', category: 'فواكه', price: 8, cost: 3, minStock: 100, maxStock: 300 },
            { name: 'موز', category: 'فواكه', price: 6, cost: 2, minStock: 150, maxStock: 500 },
            { name: 'برتقال', category: 'فواكه', price: 7, cost: 2.5, minStock: 100, maxStock: 400 },
            { name: 'عنب أبيض', category: 'فواكه', price: 12, cost: 4, minStock: 50, maxStock: 200 },
            { name: 'رمان', category: 'فواكه', price: 14, cost: 5, minStock: 40, maxStock: 150 },
            { name: 'مانجو', category: 'فواكه', price: 18, cost: 6, minStock: 30, maxStock: 120 },
            { name: 'كيوي', category: 'فواكه', price: 11, cost: 4, minStock: 60, maxStock: 200 },

            { name: 'طماطم', category: 'خضار', price: 5, cost: 1.5, minStock: 200, maxStock: 800 },
            { name: 'خيار', category: 'خضار', price: 4, cost: 1, minStock: 200, maxStock: 800 },
            { name: 'جزر', category: 'خضار', price: 3, cost: 0.8, minStock: 250, maxStock: 1000 },
            { name: 'بصل', category: 'خضار', price: 2, cost: 0.5, minStock: 300, maxStock: 1200 },
            { name: 'ثوم', category: 'خضار', price: 8, cost: 2.5, minStock: 100, maxStock: 400 },
            { name: 'بروكلي', category: 'خضار', price: 7, cost: 2, minStock: 80, maxStock: 300 },
            { name: 'ملفوف', category: 'خضار', price: 4, cost: 1, minStock: 150, maxStock: 600 },
            { name: 'فلفل أحمر', category: 'خضار', price: 9, cost: 3, minStock: 100, maxStock: 400 },

            { name: 'حليب', category: 'ألبان', price: 5, cost: 2, minStock: 300, maxStock: 1000 },
            { name: 'جبنة بيضاء', category: 'ألبان', price: 15, cost: 5, minStock: 100, maxStock: 400 },
            { name: 'زبادي', category: 'ألبان', price: 4, cost: 1.5, minStock: 200, maxStock: 800 },
            { name: 'زبدة', category: 'ألبان', price: 18, cost: 6, minStock: 50, maxStock: 200 },
            { name: 'كريمة', category: 'ألبان', price: 12, cost: 4, minStock: 60, maxStock: 250 },

            { name: 'دجاج', category: 'لحوم', price: 35, cost: 15, minStock: 30, maxStock: 150 },
            { name: 'لحم بقري', category: 'لحوم', price: 50, cost: 20, minStock: 20, maxStock: 100 },
            { name: 'سمك', category: 'لحوم', price: 40, cost: 16, minStock: 25, maxStock: 120 },
            { name: 'ديك رومي', category: 'لحوم', price: 45, cost: 18, minStock: 15, maxStock: 80 },

            { name: 'خبز أبيض', category: 'مخبوزات', price: 2, cost: 0.5, minStock: 200, maxStock: 1000 },
            { name: 'خبز أسمر', category: 'مخبوزات', price: 3, cost: 0.8, minStock: 150, maxStock: 800 },
            { name: 'كيك', category: 'مخبوزات', price: 8, cost: 2.5, minStock: 50, maxStock: 200 },
            { name: 'بسكويت', category: 'مخبوزات', price: 6, cost: 2, minStock: 100, maxStock: 500 }
        ];

        for (const product of defaultProducts) {
            try {
                const newProduct = {
                    ...product,
                    createdAt: dateUtils.getCurrentDateTime(),
                    updatedAt: dateUtils.getCurrentDateTime()
                };
                await db.add('products', newProduct);
                this.categories.add(product.category);
            } catch (error) {
                console.error('Error seeding product:', error);
            }
        }

        this.products = await db.getAll('products');
    }

    async addProduct(productData) {
        try {
            const product = {
                ...productData,
                createdAt: dateUtils.getCurrentDateTime(),
                updatedAt: dateUtils.getCurrentDateTime()
            };

            const id = await db.add('products', product);
            product.id = id;
            this.products.push(product);
            this.categories.add(product.category);

            await auth.logActivity('product-added', `تم إضافة منتج: ${product.name}`, { productId: id });
            await notifications.addNotification(
                NotificationsManager.createAlert('product-added', `تم إضافة "${product.name}"`, '✨ منتج جديد')
            );

            return { success: true, product };
        } catch (error) {
            console.error('Error adding product:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProduct(id, productData) {
        try {
            const product = { ...productData, id, updatedAt: dateUtils.getCurrentDateTime() };
            await db.put('products', product);

            const index = this.products.findIndex(p => p.id === id);
            if (index !== -1) {
                this.products[index] = product;
                this.categories.add(product.category);
            }

            await auth.logActivity('product-updated', `تم تحديث منتج: ${product.name}`, { productId: id });
            return { success: true, product };
        } catch (error) {
            console.error('Error updating product:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(id) {
        try {
            const product = this.products.find(p => p.id === id);
            if (!product) {
                throw new Error('Product not found');
            }

            await db.delete('products', id);
            this.products = this.products.filter(p => p.id !== id);

            await auth.logActivity('product-deleted', `تم حذف منتج: ${product.name}`, { productId: id });
            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            return { success: false, error: error.message };
        }
    }

    getProduct(id) {
        return this.products.find(p => p.id === id);
    }

    getProducts() {
        return this.products;
    }

    getCategories() {
        return Array.from(this.categories).sort();
    }

    searchProducts(query) {
        if (!query) return this.products;
        return this.products.filter(p =>
            stringUtils.searchString(p.name, query) ||
            stringUtils.searchString(p.category, query)
        );
    }

    getProductsByCategory(category) {
        if (!category) return this.products;
        return this.products.filter(p => p.category === category);
    }

    getTopSellingProducts(limit = 5) {
        return arrayUtils.sortBy(this.products, 'price', 'desc').slice(0, limit);
    }

    calculateTotalValue() {
        return arrayUtils.sumBy(this.products, 'cost');
    }

    getProductStats() {
        return {
            total: this.products.length,
            categories: this.categories.size,
            totalValue: this.calculateTotalValue(),
            averagePrice: arrayUtils.averageBy(this.products, 'price')
        };
    }
}

// Initialize Products Manager
const products = new ProductsManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
