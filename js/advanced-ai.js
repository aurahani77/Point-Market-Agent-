/* ========== Advanced AI Agent ========== */
class AdvancedAIAgent {
    constructor(db, productsManager, inventoryManager, salesManager, branchesManager) {
        this.db = db;
        this.products = productsManager;
        this.inventory = inventoryManager;
        this.sales = salesManager;
        this.branches = branchesManager;
    }

    // AI: Sales Forecast using simple ML
    async forecastSales(daysAhead = 30) {
        const sales = await this.db.getAll('sales');
        if (sales.length === 0) return { forecast: [], confidence: 0 };

        const dailySales = {};
        sales.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString();
            dailySales[date] = (dailySales[date] || 0) + sale.total;
        });

        const values = Object.values(dailySales);
        const avgDaily = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Generate forecast
        const forecast = [];
        for (let i = 1; i <= daysAhead; i++) {
            const trend = (values[values.length - 1] - values[0]) / values.length;
            const predicted = avgDaily + (trend * i) + (Math.random() - 0.5) * stdDev;
            forecast.push(Math.max(0, predicted));
        }

        const confidence = Math.min(100, (values.length / 30) * 100);
        return { forecast, avgDaily, confidence: Math.round(confidence) };
    }

    // AI: Smart Inventory Recommendations
    async getInventoryRecommendations() {
        const inventory = await this.db.getAll('inventory');
        const sales = await this.db.getAll('sales');
        const recommendations = [];

        // Calculate sales velocity for each product
        const productVelocity = {};
        sales.forEach(sale => {
            sale.items?.forEach(item => {
                productVelocity[item.productId] = (productVelocity[item.productId] || 0) + item.quantity;
            });
        });

        inventory.forEach(inv => {
            const velocity = productVelocity[inv.productId] || 0;
            const daysOfStock = velocity > 0 ? inv.quantity / velocity : Infinity;

            // Recommendations based on velocity and stock levels
            if (inv.quantity === 0) {
                recommendations.push({
                    type: 'critical',
                    priority: 'high',
                    productId: inv.productId,
                    action: 'إعادة تخزين فوري',
                    reason: 'المنتج منقطع الآن',
                    expectedImpact: 'فقدان مبيعات'
                });
            } else if (daysOfStock < 7 && velocity > 0) {
                recommendations.push({
                    type: 'reorder',
                    priority: 'high',
                    productId: inv.productId,
                    action: 'طلب فوري',
                    reason: `سيكون المخزون مختصراً في ${Math.round(daysOfStock)} أيام`,
                    expectedImpact: 'منع نقص المخزون'
                });
            } else if (inv.quantity > inv.maxStock * 0.8) {
                recommendations.push({
                    type: 'overstock',
                    priority: 'low',
                    productId: inv.productId,
                    action: 'تقليل الطلبات',
                    reason: 'المخزون زائد عن الحد المطلوب',
                    expectedImpact: 'تحسين السيولة'
                });
            }
        });

        return recommendations.sort((a, b) => {
            const priorityMap = { high: 0, medium: 1, low: 2 };
            return priorityMap[a.priority] - priorityMap[b.priority];
        });
    }

    // AI: Dynamic Pricing Recommendations
    async getPricingRecommendations() {
        const products = this.products.getAll();
        const sales = await this.db.getAll('sales');
        const recommendations = [];

        const productSales = {};
        sales.forEach(sale => {
            sale.items?.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { count: 0, revenue: 0 };
                }
                productSales[item.productId].count += item.quantity;
                productSales[item.productId].revenue += item.total;
            });
        });

        products.forEach(product => {
            const sales_data = productSales[product.id];
            if (!sales_data || sales_data.count === 0) return;

            const salesVelocity = sales_data.count;
            const currentMargin = product.margin || 0;
            const avgPrice = sales_data.revenue / sales_data.count;

            // AI Logic: If high velocity and low margin, increase price
            if (salesVelocity > 10 && currentMargin < 25) {
                const suggestedPrice = product.price * 1.1;
                recommendations.push({
                    productId: product.id,
                    productName: product.name,
                    action: 'زيادة السعر',
                    currentPrice: product.price,
                    suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
                    reason: `طلب مرتفع (${salesVelocity} وحدة) مع هامش منخفض`,
                    potentialIncrease: parseFloat((suggestedPrice - product.price).toFixed(2))
                });
            }
            // If low velocity, reduce price
            else if (salesVelocity < 3 && currentMargin > 30) {
                const suggestedPrice = product.price * 0.95;
                recommendations.push({
                    productId: product.id,
                    productName: product.name,
                    action: 'تخفيض السعر',
                    currentPrice: product.price,
                    suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
                    reason: `طلب منخفض (${salesVelocity} وحدات) - تحسين المبيعات`,
                    potentialDecrease: parseFloat((product.price - suggestedPrice).toFixed(2))
                });
            }
        });

        return recommendations;
    }

    // AI: Branch Performance Analysis
    async getBranchAnalysis() {
        const branches = this.branches.getAll();
        const sales = await this.db.getAll('sales');
        const analysis = [];

        const branchSales = {};
        sales.forEach(sale => {
            if (!branchSales[sale.branchId]) {
                branchSales[sale.branchId] = { total: 0, count: 0, lastSale: null };
            }
            branchSales[sale.branchId].total += sale.total;
            branchSales[sale.branchId].count++;
            branchSales[sale.branchId].lastSale = new Date(sale.date);
        });

        branches.forEach(branch => {
            const data = branchSales[branch.id];
            const revenue = data?.total || 0;
            const avgTransaction = data?.count > 0 ? revenue / data.count : 0;
            const daysSinceLastSale = data?.lastSale ? Math.floor((Date.now() - data.lastSale) / (1000 * 60 * 60 * 24)) : 999;

            let status = 'good';
            let recommendation = '';

            if (daysSinceLastSale > 30) {
                status = 'inactive';
                recommendation = 'الفرع غير نشط - يحتاج إلى متابعة';
            } else if (revenue < branch.cost) {
                status = 'loss';
                recommendation = 'الفرع غير مربح - يحتاج تحسين';
            } else if (avgTransaction > 500) {
                status = 'excellent';
                recommendation = 'أداء ممتاز - فرع نجاح';
            }

            analysis.push({
                branchId: branch.id,
                branchName: branch.name,
                status,
                recommendation,
                totalRevenue: revenue,
                transactionCount: data?.count || 0,
                avgTransaction: Math.round(avgTransaction),
                monthlyProfit: revenue - branch.cost,
                profitMargin: revenue > 0 ? Math.round(((revenue - branch.cost) / revenue) * 100) : 0
            });
        });

        return analysis.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    // AI: Customer Behavior Analysis
    async getCustomerBehavior() {
        const sales = await this.db.getAll('sales');
        const behavior = {
            totalCustomers: sales.length,
            avgTransactionValue: 0,
            repeatPurchaseRate: 0,
            peakSalesHour: 'غير محدد',
            mostPopularProducts: [],
            leastPopularProducts: []
        };

        if (sales.length === 0) return behavior;

        // Calculate average transaction
        behavior.avgTransactionValue = Math.round(
            sales.reduce((sum, s) => sum + s.total, 0) / sales.length
        );

        // Analyze popular products
        const productCount = {};
        sales.forEach(sale => {
            sale.items?.forEach(item => {
                productCount[item.productName] = (productCount[item.productName] || 0) + item.quantity;
            });
        });

        const sorted = Object.entries(productCount)
            .sort((a, b) => b[1] - a[1]);

        behavior.mostPopularProducts = sorted.slice(0, 5).map(([name, count]) => ({ name, count }));
        behavior.leastPopularProducts = sorted.slice(-5).map(([name, count]) => ({ name, count }));

        return behavior;
    }

    // AI: Risk Assessment
    async getRiskAssessment() {
        const risks = [];
        const inventory = await this.db.getAll('inventory');
        const sales = await this.db.getAll('sales');

        // Risk 1: High out of stock rate
        const outOfStock = inventory.filter(i => i.quantity === 0).length;
        const outOfStockRate = (outOfStock / inventory.length) * 100;
        if (outOfStockRate > 10) {
            risks.push({
                level: 'high',
                type: 'المخزون',
                title: 'معدل نقص مرتفع',
                description: `${Math.round(outOfStockRate)}% من المنتجات منقطعة`,
                impact: 'فقدان المبيعات والعملاء',
                action: 'زيادة كميات الطلب'
            });
        }

        // Risk 2: Declining sales
        if (sales.length > 10) {
            const recent = sales.slice(-5).reduce((sum, s) => sum + s.total, 0);
            const older = sales.slice(-10, -5).reduce((sum, s) => sum + s.total, 0);
            if (older > 0 && (recent / older) < 0.8) {
                risks.push({
                    level: 'medium',
                    type: 'المبيعات',
                    title: 'انخفاض المبيعات',
                    description: 'المبيعات انخفضت بنسبة 20% هذا الأسبوع',
                    impact: 'تقليل الإيرادات',
                    action: 'تحليل الأسباب وتحسين التسويق'
                });
            }
        }

        return risks.sort((a, b) => {
            const levelMap = { high: 0, medium: 1, low: 2 };
            return levelMap[a.level] - levelMap[b.level];
        });
    }

    // Get Overall AI Dashboard
    async getAIDashboard() {
        const [forecast, inventory, pricing, branches, customer, risks] = await Promise.all([
            this.forecastSales(30),
            this.getInventoryRecommendations(),
            this.getPricingRecommendations(),
            this.getBranchAnalysis(),
            this.getCustomerBehavior(),
            this.getRiskAssessment()
        ]);

        return {
            forecast,
            inventory,
            pricing,
            branches,
            customer,
            risks,
            timestamp: new Date().toISOString()
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAIAgent;
}
