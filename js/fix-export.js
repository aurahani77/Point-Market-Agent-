/* ========== Export Functionality Fix ========== */
/*
   This file provides enhanced export functionality
   - Fixes SheetJS library compatibility
   - Ensures proper data export to Excel/CSV
   - Adds missing export methods
*/

// Enhanced Excel Export Manager
class EnhancedExcelExporter {
    constructor(db, productsManager, inventory, sales) {
        this.db = db;
        this.productsManager = productsManager;
        this.inventory = inventory;
        this.sales = sales;
        this.checkXLSXLibrary();
    }

    // Check if XLSX library is loaded
    checkXLSXLibrary() {
        if (typeof XLSX === 'undefined') {
            console.error('⚠️ SheetJS library not loaded. Please ensure it\'s included in index.html');
            setTimeout(() => {
                notificationUtils.showToast('⚠️ مكتبة Excel غير محملة. يرجى تحديث الصفحة', 'warning');
            }, 1000);
        }
    }

    // Export Products to Excel
    exportProductsToExcel() {
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error('SheetJS library not loaded');
            }

            const products = this.productsManager.products || [];

            if (products.length === 0) {
                notificationUtils.showToast('❌ لا توجد منتجات للتصدير', 'warning');
                return;
            }

            // Prepare data
            const exportData = products.map(p => ({
                'اسم المنتج': p.name || '',
                'الفئة': p.category || '',
                'السعر': p.price || 0,
                'التكلفة': p.cost || 0,
                'الهامش': p.margin || 0,
                'SKU': p.sku || '',
                'الحد الأدنى': p.minStock || 0,
                'الحد الأقصى': p.maxStock || 0,
                'الوصف': p.description || '',
                'تاريخ الإنشاء': p.createdAt || ''
            }));

            // Create workbook
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');

            // Set column widths
            ws['!cols'] = [
                { wch: 20 },
                { wch: 15 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 12 },
                { wch: 10 },
                { wch: 10 },
                { wch: 25 },
                { wch: 15 }
            ];

            // Write file
            const fileName = `المنتجات_${dateUtils.getCurrentDate()}.xlsx`;
            XLSX.writeFile(wb, fileName);

            notificationUtils.showToast(`✅ تم تصدير ${products.length} منتج بنجاح`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            notificationUtils.showToast('❌ خطأ في التصدير: ' + error.message, 'danger');
        }
    }

    // Export Inventory to Excel
    exportInventoryToExcel() {
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error('SheetJS library not loaded');
            }

            const inventory = this.inventory.inventory || [];

            if (inventory.length === 0) {
                notificationUtils.showToast('❌ لا توجد بيانات مخزون للتصدير', 'warning');
                return;
            }

            // Prepare data
            const exportData = inventory.map(inv => ({
                'المنتج': this.productsManager.getProductById(inv.productId)?.name || 'غير معروف',
                'الفرع': inv.branchName || '',
                'الكمية': inv.quantity || 0,
                'الحد الأدنى': inv.minStock || 0,
                'الحد الأقصى': inv.maxStock || 0,
                'القيمة': inv.value || 0,
                'آخر تحديث': inv.lastUpdated || ''
            }));

            // Create workbook
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'المخزون');

            // Set column widths
            ws['!cols'] = [
                { wch: 20 },
                { wch: 15 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 12 },
                { wch: 15 }
            ];

            // Write file
            const fileName = `المخزون_${dateUtils.getCurrentDate()}.xlsx`;
            XLSX.writeFile(wb, fileName);

            notificationUtils.showToast(`✅ تم تصدير بيانات المخزون بنجاح`, 'success');
        } catch (error) {
            console.error('Inventory export error:', error);
            notificationUtils.showToast('❌ خطأ في التصدير: ' + error.message, 'danger');
        }
    }

    // Export Sales to Excel
    exportSalesToExcel() {
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error('SheetJS library not loaded');
            }

            const sales = this.sales.sales || [];

            if (sales.length === 0) {
                notificationUtils.showToast('❌ لا توجد مبيعات للتصدير', 'warning');
                return;
            }

            // Prepare data
            const exportData = sales.map(s => ({
                'رقم الفاتورة': s.id || '',
                'التاريخ': s.date || '',
                'الفرع': s.branchName || '',
                'المنتجات': (s.items?.length || 0) + ' منتج',
                'الإجمالي': s.total || 0,
                'الربح': s.profit || 0,
                'ملاحظات': s.notes || ''
            }));

            // Create workbook
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'المبيعات');

            // Set column widths
            ws['!cols'] = [
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 12 },
                { wch: 12 },
                { wch: 20 }
            ];

            // Write file
            const fileName = `المبيعات_${dateUtils.getCurrentDate()}.xlsx`;
            XLSX.writeFile(wb, fileName);

            notificationUtils.showToast(`✅ تم تصدير ${sales.length} عملية بيع بنجاح`, 'success');
        } catch (error) {
            console.error('Sales export error:', error);
            notificationUtils.showToast('❌ خطأ في التصدير: ' + error.message, 'danger');
        }
    }

    // Export as CSV
    exportToCSV(data, filename) {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No data to export');
            }

            // Get headers
            const headers = Object.keys(data[0]);

            // Create CSV content
            let csv = headers.join(',') + '\n';

            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value.replace(/"/g, '""')}"`
                        : value;
                });
                csv += values.join(',') + '\n';
            });

            // Create blob and download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', filename || 'export.csv');
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            notificationUtils.showToast('✅ تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            notificationUtils.showToast('❌ خطأ في التصدير: ' + error.message, 'danger');
        }
    }

    // Export as JSON
    exportToJSON(data, filename) {
        try {
            if (!data) {
                throw new Error('No data to export');
            }

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', filename || 'export.json');
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            notificationUtils.showToast('✅ تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            console.error('JSON export error:', error);
            notificationUtils.showToast('❌ خطأ في التصدير: ' + error.message, 'danger');
        }
    }

    // Export Product Template (Fixed)
    exportTemplate() {
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error('SheetJS library not loaded');
            }

            const template = [
                {
                    name: 'اسم المنتج',
                    category: 'الفئة',
                    price: 10.50,
                    cost: 5.25,
                    minStock: 10,
                    maxStock: 100,
                    description: 'وصف المنتج',
                    sku: 'SKU-001'
                }
            ];

            const ws = XLSX.utils.json_to_sheet(template);

            // Set column widths
            ws['!cols'] = [
                { wch: 20 },
                { wch: 15 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 25 },
                { wch: 12 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
            XLSX.writeFile(wb, 'نموذج_استيراد_المنتجات.xlsx');

            notificationUtils.showToast('✅ تم تنزيل النموذج بنجاح', 'success');
        } catch (error) {
            console.error('Template export error:', error);
            notificationUtils.showToast('❌ خطأ في تنزيل النموذج: ' + error.message, 'danger');
        }
    }
}

// Initialize Enhanced Exporter (will be used in app.js)
let enhancedExporter = null;

// Function to initialize exporter when app loads
function initializeEnhancedExporter() {
    if (typeof db !== 'undefined' && typeof products !== 'undefined' &&
        typeof inventory !== 'undefined' && typeof sales !== 'undefined') {
        enhancedExporter = new EnhancedExcelExporter(db, products, inventory, sales);
        console.log('✅ Enhanced Excel Exporter Initialized');
    }
}

// Export class for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedExcelExporter;
}
