/* ========== AI Agent for Intelligent Recommendations ========== */
class AIAgent {
    constructor() {
        this.recommendations = [];
    }

    async generateRecommendations() {
        this.recommendations = [];

        // Inventory Analysis
        this.analyzeInventory();

        // Sales Analysis
        this.analyzeSales();

        // Performance Analysis
        this.analyzePerformance();

        // Trend Analysis
        this.analyzeTrends();

        return this.recommendations;
    }

    analyzeInventory() {
        const lowStockItems = inventory.getLowStockItems();
        const outOfStockItems = inventory.getOutOfStockItems();
        const highStockItems = inventory.getHighStockItems();

        if (lowStockItems.length > 0) {
            this.addRecommendation({
                icon: '⚠️',
                title: 'تحذير المخزون المنخفض',
                message: `${lowStockItems.length} منتجات وصلت للحد الأدنى`,
                priority: 'high',
                action: 'أضف منتجات إلى المخزون فوراً'
            });
        }

        if (outOfStockItems.length > 0) {
            this.addRecommendation({
                icon: '🚨',
                title: 'حالة حرجة: انقطاع المخزون',
                message: `${outOfStockItems.length} منتجات انقطعت عن الأسواق`,
                priority: 'critical',
                action: 'أعد التخزين للمنتجات المنقطعة فوراً'
            });
        }

        if (highStockItems.length > 0 && highStockItems.length <= 3) {
            this.addRecommendation({
                icon: '📦',
                title: 'مخزون زائد',
                message: `${highStockItems.length} منتجات تجاوزت الحد الأقصى`,
                priority: 'medium',
                action: 'قلل الطلب أو زد المبيعات'
            });
        }
    }

    analyzeSales() {
        const stats = sales.getSalesStats();
        const topItems = sales.getTopSellingItems(3);

        if (stats.totalSales > 0) {
            this.addRecommendation({
                icon: '💰',
                title: 'ملخص المبيعات',
                message: `إجمالي المبيعات: ${numberUtils.formatCurrency(stats.totalRevenue)}`,
                priority: 'info',
                action: `عدد المعاملات: ${stats.totalSales}`
            });
        }

        if (topItems.length > 0) {
            const topProduct = topItems[0];
            this.addRecommendation({
                icon: '⭐',
                title: 'المنتج الأكثر مبيعاً',
                message: `${topProduct.productName}`,
                priority: 'info',
                action: `تم بيع ${topProduct.quantity} وحدة`
            });
        }
    }

    analyzePerformance() {
        const topBranches = branches.getTopPerformingBranches(2);

        if (topBranches.length > 0) {
            const topBranch = topBranches[0];
            this.addRecommendation({
                icon: '🏆',
                title: 'أفضل فرع',
                message: `فرع ${topBranch.name}`,
                priority: 'info',
                action: `الإيراد: ${numberUtils.formatCurrency(topBranch.revenue)}`
            });
        }

        const metrics = branches.getTotalMetrics();
        this.addRecommendation({
            icon: '🎯',
            title: 'إحصائيات الفروع',
            message: `${metrics.totalBranches} فرع بإجمالي إيرادات ${numberUtils.formatCurrency(metrics.totalRevenue)}`,
            priority: 'info',
            action: `الموظفون: ${metrics.totalStaff}`
        });
    }

    analyzeTrends() {
        const inventoryValue = inventory.getTotalInventoryValue();
        const categories = products.getCategories();

        if (categories.length > 0) {
            this.addRecommendation({
                icon: '📊',
                title: 'تنوع المنتجات',
                message: `${categories.length} فئات منتجات`,
                priority: 'info',
                action: `الفئات: ${categories.join(', ')}`
            });
        }

        this.addRecommendation({
            icon: '💼',
            title: 'قيمة المخزون الإجمالية',
            message: numberUtils.formatCurrency(inventoryValue),
            priority: 'info',
            action: 'قم بمراجعة توزيع المخزون بين الفروع'
        });
    }

    addRecommendation(recommendation) {
        this.recommendations.push({
            id: stringUtils.generateId('REC'),
            ...recommendation,
            timestamp: dateUtils.getCurrentDateTime()
        });
    }

    getRecommendations(priority = null) {
        if (priority) {
            return this.recommendations.filter(r => r.priority === priority);
        }
        return this.recommendations;
    }

    getCriticalRecommendations() {
        return this.getRecommendations('critical');
    }

    getHighPriorityRecommendations() {
        return this.getRecommendations('high');
    }

    async exportRecommendations() {
        return JSON.stringify(this.recommendations, null, 2);
    }

    getPredictionScore() {
        // Simple scoring algorithm
        let score = 100;

        // Reduce score for low stock
        score -= inventory.getLowStockItems().length * 5;

        // Reduce score for out of stock
        score -= inventory.getOutOfStockItems().length * 10;

        return Math.max(0, score);
    }

    getHealthStatus() {
        const score = this.getPredictionScore();

        if (score >= 80) return { status: 'good', emoji: '✅', color: 'success' };
        if (score >= 60) return { status: 'fair', emoji: '⚠️', color: 'warning' };
        return { status: 'critical', emoji: '🚨', color: 'danger' };
    }
}

// Initialize AI Agent
const aiAgent = new AIAgent();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = aiAgent;
}
