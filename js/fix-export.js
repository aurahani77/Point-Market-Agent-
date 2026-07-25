/* ========== Enhanced Excel Exporter ========== */
class EnhancedExcelExporter {
    constructor() {
        this.checkXLSXLibrary();
    }

    checkXLSXLibrary() {
        if (typeof XLSX === 'undefined') {
            console.warn('SheetJS library not loaded. Export feature may not work.');
            return false;
        }
        return true;
    }

    exportSalesReport(report) {
        try {
            if (!this.checkXLSXLibrary()) {
                notificationUtils.showToast('مكتبة Excel غير متوفرة', 'danger');
                return;
            }

            const { totalSales, totalProfit, transactionCount, topItems, byBranch } = report.data;

            // Main report sheet
            const reportData = [
                ['تقرير المبيعات', '', ''],
                ['تاريخ التقرير', new Date().toLocaleDateString('ar-SA'), ''],
                ['', '', ''],
                ['المقياس', 'القيمة', ''],
                ['إجمالي المبيعات', totalSales, ''],
                ['إجمالي الأرباح', totalProfit, ''],
                ['عدد العمليات', transactionCount, '']
            ];

            // Top selling items
            reportData.push(['', '', '']);
            reportData.push(['أفضل المنتجات المباعة', '', '']);
            reportData.push(['المنتج', 'الكمية', 'الإجمالي']);
            topItems.forEach(item => {
                reportData.push([item.productName, item.quantity, item.total]);
            });

            // By branch
            reportData.push(['', '', '']);
            reportData.push(['المبيعات حسب الفرع', '', '']);
            reportData.push(['الفرع', 'عدد العمليات', 'الإيراد']);
            Object.entries(byBranch).forEach(([name, data]) => {
                reportData.push([name, data.sales, data.revenue]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المبيعات');

            XLSX.writeFile(workbook, `sales-report-${dateUtils.getCurrentDate()}.xlsx`);
            notificationUtils.showToast('تم تصدير التقرير بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('حدث خطأ أثناء التصدير', 'danger');
        }
    }

    exportInventoryReport(report) {
        try {
            if (!this.checkXLSXLibrary()) {
                notificationUtils.showToast('مكتبة Excel غير متوفرة', 'danger');
                return;
            }

            const { totalValue, lowStockItems, outOfStockItems, highStockItems, stats } = report.data;

            const reportData = [
                ['تقرير المخزون', '', ''],
                ['تاريخ التقرير', new Date().toLocaleDateString('ar-SA'), ''],
                ['', '', ''],
                ['المقياس', 'القيمة', ''],
                ['إجمالي قيمة المخزون', totalValue, ''],
                ['عدد المنتجات', stats.totalProducts, ''],
                ['متوسط السعر', stats.averagePrice, '']
            ];

            // Low stock items
            reportData.push(['', '', '']);
            reportData.push(['المنتجات منخفضة المخزون (⚠️)', '', '']);
            reportData.push(['المنتج', 'الكمية', 'السعر']);
            lowStockItems.forEach(item => {
                reportData.push([item.productName, item.quantity, item.price]);
            });

            // Out of stock items
            reportData.push(['', '', '']);
            reportData.push(['المنتجات المنقطعة (🔴)', '', '']);
            outOfStockItems.forEach(item => {
                reportData.push([item.productName, item.quantity, item.price]);
            });

            // High stock items
            reportData.push(['', '', '']);
            reportData.push(['المنتجات ذات المخزون العالي', '', '']);
            highStockItems.forEach(item => {
                reportData.push([item.productName, item.quantity, item.price]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المخزون');

            XLSX.writeFile(workbook, `inventory-report-${dateUtils.getCurrentDate()}.xlsx`);
            notificationUtils.showToast('تم تصدير التقرير بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('حدث خطأ أثناء التصدير', 'danger');
        }
    }

    exportBranchReport(report) {
        try {
            if (!this.checkXLSXLibrary()) {
                notificationUtils.showToast('مكتبة Excel غير متوفرة', 'danger');
                return;
            }

            const { branchCount, totalMetrics, topPerformers, needsAttention } = report.data;

            const reportData = [
                ['تقرير الفروع', '', ''],
                ['تاريخ التقرير', new Date().toLocaleDateString('ar-SA'), ''],
                ['', '', ''],
                ['المقياس', 'القيمة', ''],
                ['عدد الفروع', branchCount, ''],
                ['إجمالي الإيرادات', totalMetrics.totalRevenue, ''],
                ['إجمالي التكاليف', totalMetrics.totalCost, ''],
                ['إجمالي الموظفين', totalMetrics.totalStaff, '']
            ];

            // Top performers
            reportData.push(['', '', '']);
            reportData.push(['الفروع الأفضل أداءً (🏆)', '', '']);
            reportData.push(['الفرع', 'الإيراد', 'الموقع']);
            topPerformers.forEach(b => {
                reportData.push([b.name, b.revenue, b.location || '-']);
            });

            // Needs attention
            reportData.push(['', '', '']);
            reportData.push(['الفروع التي تحتاج متابعة (⚠️)', '', '']);
            needsAttention.forEach(b => {
                reportData.push([b.name, b.revenue, b.location || '-']);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الفروع');

            XLSX.writeFile(workbook, `branch-report-${dateUtils.getCurrentDate()}.xlsx`);
            notificationUtils.showToast('تم تصدير التقرير بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('حدث خطأ أثناء التصدير', 'danger');
        }
    }

    exportProductReport(report) {
        try {
            if (!this.checkXLSXLibrary()) {
                notificationUtils.showToast('مكتبة Excel غير متوفرة', 'danger');
                return;
            }

            const { totalProducts, categories, stats, topProducts, totalValue } = report.data;

            const reportData = [
                ['تقرير المنتجات', '', ''],
                ['تاريخ التقرير', new Date().toLocaleDateString('ar-SA'), ''],
                ['', '', ''],
                ['المقياس', 'القيمة', ''],
                ['إجمالي المنتجات', totalProducts, ''],
                ['إجمالي القيمة', totalValue, '']
            ];

            // Categories
            reportData.push(['', '', '']);
            reportData.push(['الفئات', '', '']);
            categories.forEach(cat => {
                reportData.push([cat, '', '']);
            });

            // Top products
            reportData.push(['', '', '']);
            reportData.push(['أفضل المنتجات', '', '']);
            reportData.push(['المنتج', 'السعر', 'الفئة']);
            topProducts.forEach(p => {
                reportData.push([p.name, p.price, p.category]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المنتجات');

            XLSX.writeFile(workbook, `product-report-${dateUtils.getCurrentDate()}.xlsx`);
            notificationUtils.showToast('تم تصدير التقرير بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('حدث خطأ أثناء التصدير', 'danger');
        }
    }

    exportProductsToExcel() {
        try {
            if (!this.checkXLSXLibrary()) {
                notificationUtils.showToast('مكتبة Excel غير متوفرة', 'danger');
                return;
            }

            const data = products.products.map(p => [
                p.name,
                p.category,
                p.price,
                p.cost,
                p.price - p.cost,
                p.sku || '',
                p.minStock || 0,
                p.maxStock || 0
            ]);

            data.unshift(['المنتج', 'الفئة', 'السعر', 'التكلفة', 'الهامش', 'SKU', 'الحد الأدنى', 'الحد الأقصى']);

            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'المنتجات');

            XLSX.writeFile(workbook, `products-${dateUtils.getCurrentDate()}.xlsx`);
            notificationUtils.showToast('تم تصدير المنتجات بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('حدث خطأ أثناء التصدير', 'danger');
        }
    }

    exportInventoryToExcel() {
        try {
            if (!this.checkXLSXLibrary()) {
                notificationUtils.showToast('مكتبة Excel غير متوفرة', 'danger');
                return;
            }

            const data = [];
            products.products.forEach(product => {
                branches.branches.forEach(branch => {
                    const inv = inventory.getInventoryItem(product.id, branch.id);
                    if (inv) {
                        data.push([
                            product.name,
                            branch.name,
                            inv.quantity,
                            product.price,
                            inv.quantity * product.price
                        ]);
                    }
                });
            });

            data.unshift(['المنتج', 'الفرع', 'الكمية', 'السعر', 'الإجمالي']);

            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'المخزون');

            XLSX.writeFile(workbook, `inventory-${dateUtils.getCurrentDate()}.xlsx`);
            notificationUtils.showToast('تم تصدير المخزون بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('حدث خطأ أثناء التصدير', 'danger');
        }
    }

    exportSalesToExcel() {
        try {
            if (!this.checkXLSXLibrary()) {
                notificationUtils.showToast('مكتبة Excel غير متوفرة', 'danger');
                return;
            }

            const data = sales.getSales().map(sale => [
                sale.invoiceNumber,
                sale.date,
                sale.branchId,
                sale.items.length,
                sale.subtotal,
                sale.tax,
                sale.discount,
                sale.total
            ]);

            data.unshift(['رقم الفاتورة', 'التاريخ', 'الفرع', 'البنود', 'الإجمالي الجزئي', 'الضريبة', 'الخصم', 'الإجمالي']);

            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'المبيعات');

            XLSX.writeFile(workbook, `sales-${dateUtils.getCurrentDate()}.xlsx`);
            notificationUtils.showToast('تم تصدير المبيعات بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('حدث خطأ أثناء التصدير', 'danger');
        }
    }
}

// Initialize Enhanced Exporter
const exporter = new EnhancedExcelExporter();
