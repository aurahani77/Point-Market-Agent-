/* ========== Excel Importer Manager ========== */
class ExcelImporterManager {
    constructor(db, productsManager) {
        this.db = db;
        this.productsManager = productsManager;
    }

    // Parse Excel File
    parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('فشل في قراءة الملف: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('خطأ في قراءة الملف'));
            reader.readAsArrayBuffer(file);
        });
    }

    // Validate Product Data
    validateProductData(data) {
        const errors = [];
        const warnings = [];

        data.forEach((item, index) => {
            const row = index + 2; // Excel row number (header is row 1)

            // Check required fields
            if (!item.name || item.name.toString().trim() === '') {
                errors.push(`الصف ${row}: اسم المنتج مفقود`);
            }

            if (!item.category || item.category.toString().trim() === '') {
                errors.push(`الصف ${row}: الفئة مفقودة`);
            }

            // Check price format
            const price = parseFloat(item.price);
            if (isNaN(price) || price <= 0) {
                errors.push(`الصف ${row}: السعر غير صحيح`);
            }

            // Check cost format
            const cost = parseFloat(item.cost);
            if (isNaN(cost) || cost <= 0) {
                errors.push(`الصف ${row}: التكلفة غير صحيحة`);
            }

            // Check min/max stock
            const minStock = parseInt(item.minStock) || 0;
            const maxStock = parseInt(item.maxStock) || 100;

            if (minStock >= maxStock) {
                warnings.push(`الصف ${row}: الحد الأدنى أكبر من أو يساوي الحد الأقصى`);
            }

            // Margin check
            if (cost >= price) {
                warnings.push(`الصف ${row}: التكلفة مساوية أو أكبر من السعر`);
            }
        });

        return { errors, warnings };
    }

    // Import Products to Database
    async importProducts(data) {
        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            details: []
        };

        for (let i = 0; i < data.length; i++) {
            try {
                const item = data[i];
                const row = i + 2;

                // Validate required fields
                if (!item.name || !item.category) {
                    results.skipped++;
                    results.details.push({
                        row,
                        status: 'skipped',
                        message: 'بيانات ناقصة'
                    });
                    continue;
                }

                // Create product object
                const product = {
                    name: item.name.toString().trim(),
                    category: item.category.toString().trim(),
                    price: parseFloat(item.price) || 0,
                    cost: parseFloat(item.cost) || 0,
                    minStock: parseInt(item.minStock) || 10,
                    maxStock: parseInt(item.maxStock) || 100,
                    description: item.description || '',
                    sku: item.sku || `SKU-${Date.now()}-${i}`,
                    createdAt: new Date().toISOString()
                };

                // Calculate margin
                product.margin = ((product.price - product.cost) / product.price * 100).toFixed(2);

                // Add to database
                const productId = await this.db.add('products', product);

                results.success++;
                results.details.push({
                    row,
                    status: 'success',
                    productId,
                    name: product.name,
                    message: 'تم الاستيراد بنجاح'
                });
            } catch (error) {
                results.failed++;
                results.details.push({
                    row: i + 2,
                    status: 'failed',
                    message: error.message
                });
            }
        }

        return results;
    }

    // Export Template Excel File
    exportTemplate() {
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

        const ws = XLSX.utils.json_to_sheet(template, {
            header: ['name', 'category', 'price', 'cost', 'minStock', 'maxStock', 'description', 'sku'],
            defval: ''
        });

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
    }

    // Generate Import Report
    generateImportReport(results) {
        const report = `
╔════════════════════════════════════════╗
║      📊 تقرير استيراد المنتجات 📊      ║
╚════════════════════════════════════════╝

✅ تم استيراده:    ${results.success}
❌ فشل:           ${results.failed}
⏭️  تم تخطيه:      ${results.skipped}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

التفاصيل:
${results.details.map(d =>
    `  الصف ${d.row}: ${d.status === 'success' ? '✅' : d.status === 'failed' ? '❌' : '⏭️'} ${d.message}`
).join('\n')}
        `;
        return report;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExcelImporterManager;
}
