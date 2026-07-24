/* ========== Reports Manager ========== */
class ReportsManager {
    constructor() {
        this.reports = [];
    }

    generateSalesReport(startDate, endDate) {
        const report = {
            type: 'sales',
            period: { startDate, endDate },
            generatedAt: dateUtils.getCurrentDateTime(),
            data: {
                totalSales: sales.getTotalSales(startDate, endDate),
                totalProfit: sales.getTotalProfit(startDate, endDate),
                transactionCount: sales.getSales().filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
                }).length,
                topItems: sales.getTopSellingItems(),
                byBranch: this.getSalesReportByBranch(startDate, endDate)
            }
        };
        this.reports.push(report);
        return report;
    }

    generateInventoryReport() {
        const report = {
            type: 'inventory',
            generatedAt: dateUtils.getCurrentDateTime(),
            data: {
                totalValue: inventory.getTotalInventoryValue(),
                lowStockItems: inventory.getLowStockItems(),
                outOfStockItems: inventory.getOutOfStockItems(),
                highStockItems: inventory.getHighStockItems(),
                stats: inventory.getInventoryStats()
            }
        };
        this.reports.push(report);
        return report;
    }

    generateBranchReport() {
        const report = {
            type: 'branch',
            generatedAt: dateUtils.getCurrentDateTime(),
            data: {
                branchCount: branches.branches.length,
                totalMetrics: branches.getTotalMetrics(),
                topPerformers: branches.getTopPerformingBranches(),
                needsAttention: branches.getLowestPerformingBranches()
            }
        };
        this.reports.push(report);
        return report;
    }

    generateProductReport() {
        const report = {
            type: 'product',
            generatedAt: dateUtils.getCurrentDateTime(),
            data: {
                totalProducts: products.products.length,
                categories: products.getCategories(),
                stats: products.getProductStats(),
                topProducts: products.getTopSellingProducts(),
                totalValue: products.calculateTotalValue()
            }
        };
        this.reports.push(report);
        return report;
    }

    getSalesReportByBranch(startDate, endDate) {
        const byBranch = {};

        branches.branches.forEach(branch => {
            const branchSales = sales.getSalesByBranch(branch.id).filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
            });

            byBranch[branch.name] = {
                sales: branchSales.length,
                revenue: arrayUtils.sumBy(branchSales, 'total'),
                profit: branchSales.reduce((sum, sale) => {
                    return sum + sale.items.reduce((s, item) => s + item.profit, 0);
                }, 0)
            };
        });

        return byBranch;
    }

    generateDemandForecast() {
        const report = {
            type: 'forecast',
            generatedAt: dateUtils.getCurrentDateTime(),
            data: {
                predictedTrends: this.predictTrends(),
                recommendations: this.generateRecommendations(),
                seasonalAnalysis: this.analyzeSeasonality()
            }
        };
        return report;
    }

    predictTrends() {
        const topSelling = sales.getTopSellingItems(10);
        return topSelling.map(item => ({
            product: item.productName,
            demandLevel: 'high',
            trend: '📈',
            predictedDemand: Math.round(item.quantity * 1.1)
        }));
    }

    generateRecommendations() {
        const recommendations = [];

        // Low stock recommendations
        const lowStockItems = inventory.getLowStockItems();
        if (lowStockItems.length > 0) {
            recommendations.push({
                type: 'low-stock',
                priority: 'high',
                message: `${lowStockItems.length} منتجات تحتاج إلى إعادة تخزين`
            });
        }

        // Out of stock recommendations
        const outOfStockItems = inventory.getOutOfStockItems();
        if (outOfStockItems.length > 0) {
            recommendations.push({
                type: 'out-of-stock',
                priority: 'critical',
                message: `${outOfStockItems.length} منتجات انقطعت عن المخزون`
            });
        }

        // High stock recommendations
        const highStockItems = inventory.getHighStockItems();
        if (highStockItems.length > 0) {
            recommendations.push({
                type: 'high-stock',
                priority: 'medium',
                message: `فكر في تقليل الطلبات لـ ${highStockItems.length} منتجات`
            });
        }

        return recommendations;
    }

    analyzeSeasonality() {
        return {
            peak: 'الربع الأول والثالث',
            low: 'الربع الثاني والرابع',
            products: {
                high: ['فواكه', 'خضار'],
                low: ['مخبوزات']
            }
        };
    }

    getReports(type = null) {
        if (type) {
            return this.reports.filter(r => r.type === type);
        }
        return this.reports;
    }

    exportReportAsJSON(report) {
        return JSON.stringify(report, null, 2);
    }

    exportReportAsCSV(report) {
        // Simple CSV export implementation
        let csv = `Type,Generated At\n${report.type},${report.generatedAt}\n\n`;

        if (report.data) {
            csv += 'Metric,Value\n';
            for (const [key, value] of Object.entries(report.data)) {
                if (typeof value !== 'object') {
                    csv += `${key},"${value}"\n`;
                }
            }
        }

        return csv;
    }
}

// Initialize Reports Manager
const reports = new ReportsManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = reports;
}
