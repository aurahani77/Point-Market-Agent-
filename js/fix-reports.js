/* ========== Reports Page Implementation Fix ========== */
/*
   This file replaces the placeholder loadReports() function in app.js
   Install this by copying the loadReports() function to app.js replacing the TODO
*/

// Add this method to the PointMarketApp class in app.js (replace the TODO version)
async loadReports() {
    try {
        // Clear previous content
        const pageContainer = domUtils.getElementById('pageContainer');
        pageContainer.innerHTML = `
            <div class="reports-container">
                <!-- Sales Report Section -->
                <div class="report-section">
                    <h3>📊 تقرير المبيعات</h3>
                    <div class="report-filters">
                        <input type="date" id="salesStartDate" class="filter-select">
                        <input type="date" id="salesEndDate" class="filter-select">
                        <button class="btn btn-primary" id="generateSalesReportBtn">عرض التقرير</button>
                        <button class="btn btn-secondary" id="exportSalesReportBtn">تصدير PDF</button>
                    </div>
                    <div id="salesReportContent" class="report-content"></div>
                </div>

                <!-- Inventory Report Section -->
                <div class="report-section">
                    <h3>📦 تقرير المخزون</h3>
                    <button class="btn btn-primary" id="generateInventoryReportBtn">عرض التقرير</button>
                    <button class="btn btn-secondary" id="exportInventoryReportBtn">تصدير PDF</button>
                    <div id="inventoryReportContent" class="report-content"></div>
                </div>

                <!-- Product Report Section -->
                <div class="report-section">
                    <h3>🛍️ تقرير المنتجات</h3>
                    <button class="btn btn-primary" id="generateProductReportBtn">عرض التقرير</button>
                    <button class="btn btn-secondary" id="exportProductReportBtn">تصدير PDF</button>
                    <div id="productReportContent" class="report-content"></div>
                </div>

                <!-- Branch Report Section -->
                <div class="report-section">
                    <h3>🏪 تقرير الفروع</h3>
                    <button class="btn btn-primary" id="generateBranchReportBtn">عرض التقرير</button>
                    <button class="btn btn-secondary" id="exportBranchReportBtn">تصدير PDF</button>
                    <div id="branchReportContent" class="report-content"></div>
                </div>

                <!-- Forecast Report Section -->
                <div class="report-section">
                    <h3>📈 تقرير التنبؤات</h3>
                    <button class="btn btn-primary" id="generateForecastReportBtn">عرض التقرير</button>
                    <button class="btn btn-secondary" id="exportForecastReportBtn">تصدير PDF</button>
                    <div id="forecastReportContent" class="report-content"></div>
                </div>
            </div>
        `;

        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        domUtils.getElementById('salesStartDate').valueAsDate = thirtyDaysAgo;
        domUtils.getElementById('salesEndDate').valueAsDate = today;

        // Attach event listeners
        domUtils.getElementById('generateSalesReportBtn')?.addEventListener('click', () => this.generateAndDisplaySalesReport());
        domUtils.getElementById('exportSalesReportBtn')?.addEventListener('click', () => this.exportReportToPDF('sales'));

        domUtils.getElementById('generateInventoryReportBtn')?.addEventListener('click', () => this.generateAndDisplayInventoryReport());
        domUtils.getElementById('exportInventoryReportBtn')?.addEventListener('click', () => this.exportReportToPDF('inventory'));

        domUtils.getElementById('generateProductReportBtn')?.addEventListener('click', () => this.generateAndDisplayProductReport());
        domUtils.getElementById('exportProductReportBtn')?.addEventListener('click', () => this.exportReportToPDF('product'));

        domUtils.getElementById('generateBranchReportBtn')?.addEventListener('click', () => this.generateAndDisplayBranchReport());
        domUtils.getElementById('exportBranchReportBtn')?.addEventListener('click', () => this.exportReportToPDF('branch'));

        domUtils.getElementById('generateForecastReportBtn')?.addEventListener('click', () => this.generateAndDisplayForecastReport());
        domUtils.getElementById('exportForecastReportBtn')?.addEventListener('click', () => this.exportReportToPDF('forecast'));

        // Load all reports by default
        this.generateAndDisplaySalesReport();
        this.generateAndDisplayInventoryReport();
        this.generateAndDisplayProductReport();
        this.generateAndDisplayBranchReport();
        this.generateAndDisplayForecastReport();

    } catch (error) {
        console.error('Error loading reports:', error);
        notificationUtils.showToast('خطأ في تحميل التقارير: ' + error.message, 'danger');
    }
}

// Generate and Display Sales Report
async generateAndDisplaySalesReport() {
    try {
        const startDate = domUtils.getElementById('salesStartDate')?.value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = domUtils.getElementById('salesEndDate')?.value || new Date().toISOString().split('T')[0];

        const report = reports.generateSalesReport(startDate, endDate);

        let html = `
            <div class="stat-row">
                <span>إجمالي المبيعات:</span>
                <span class="stat-value">${numberUtils.formatCurrency(report.data.totalSales)}</span>
            </div>
            <div class="stat-row">
                <span>إجمالي الربح:</span>
                <span class="stat-value">${numberUtils.formatCurrency(report.data.totalProfit)}</span>
            </div>
            <div class="stat-row">
                <span>عدد المعاملات:</span>
                <span class="stat-value">${report.data.transactionCount}</span>
            </div>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--border-color);">
            <h4 style="margin: 15px 0 10px 0;">أفضل المنتجات المباعة:</h4>
        `;

        if (report.data.topItems && report.data.topItems.length > 0) {
            html += report.data.topItems.slice(0, 5).map(item => `
                <div class="stat-row">
                    <span>${item.productName}</span>
                    <span>${item.quantity} وحدة - ${numberUtils.formatCurrency(item.totalValue)}</span>
                </div>
            `).join('');
        } else {
            html += '<p>لا توجد بيانات مبيعات</p>';
        }

        if (report.data.byBranch) {
            html += `<hr style="margin: 15px 0;"><h4 style="margin: 15px 0 10px 0;">المبيعات حسب الفرع:</h4>`;
            Object.entries(report.data.byBranch).forEach(([branchName, data]) => {
                html += `
                    <div style="background: var(--bg-secondary); padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                        <div style="font-weight: 600; margin-bottom: 5px;">${branchName}</div>
                        <div class="stat-row">
                            <span>عدد المبيعات:</span>
                            <span>${data.sales}</span>
                        </div>
                        <div class="stat-row">
                            <span>الإيراد:</span>
                            <span>${numberUtils.formatCurrency(data.revenue)}</span>
                        </div>
                        <div class="stat-row">
                            <span>الربح:</span>
                            <span style="color: var(--success);">${numberUtils.formatCurrency(data.profit)}</span>
                        </div>
                    </div>
                `;
            });
        }

        domUtils.getElementById('salesReportContent').innerHTML = html;
        notificationUtils.showToast('✅ تم تحديث تقرير المبيعات', 'success');
    } catch (error) {
        console.error('Error generating sales report:', error);
        domUtils.getElementById('salesReportContent').innerHTML = `<p style="color: var(--danger);">خطأ: ${error.message}</p>`;
    }
}

// Generate and Display Inventory Report
async generateAndDisplayInventoryReport() {
    try {
        const report = reports.generateInventoryReport();

        let html = `
            <div class="stat-row">
                <span>القيمة الإجمالية للمخزون:</span>
                <span class="stat-value">${numberUtils.formatCurrency(report.data.totalValue)}</span>
            </div>
        `;

        if (report.data.stats) {
            html += `
                <div class="stat-row">
                    <span>عدد المنتجات:</span>
                    <span>${report.data.stats.totalItems || 0}</span>
                </div>
                <div class="stat-row">
                    <span>متوسط السعر:</span>
                    <span>${numberUtils.formatCurrency(report.data.stats.avgPrice || 0)}</span>
                </div>
            `;
        }

        if (report.data.lowStockItems && report.data.lowStockItems.length > 0) {
            html += `
                <hr style="margin: 15px 0;">
                <h4 style="margin: 15px 0 10px 0; color: var(--warning);">⚠️ منتجات بمخزون منخفض (${report.data.lowStockItems.length}):</h4>
                ${report.data.lowStockItems.slice(0, 5).map(item => `
                    <div class="stat-row" style="color: var(--warning);">
                        <span>${item.productName}</span>
                        <span>${item.quantity} وحدة</span>
                    </div>
                `).join('')}
            `;
        }

        if (report.data.outOfStockItems && report.data.outOfStockItems.length > 0) {
            html += `
                <hr style="margin: 15px 0;">
                <h4 style="margin: 15px 0 10px 0; color: var(--danger);">🔴 منتجات انقطعت (${report.data.outOfStockItems.length}):</h4>
                ${report.data.outOfStockItems.slice(0, 5).map(item => `
                    <div class="stat-row" style="color: var(--danger);">
                        <span>${item.productName}</span>
                        <span>0 وحدة</span>
                    </div>
                `).join('')}
            `;
        }

        if (report.data.highStockItems && report.data.highStockItems.length > 0) {
            html += `
                <hr style="margin: 15px 0;">
                <h4 style="margin: 15px 0 10px 0; color: var(--info);">ℹ️ منتجات مخزون عالي (${report.data.highStockItems.length}):</h4>
                ${report.data.highStockItems.slice(0, 5).map(item => `
                    <div class="stat-row" style="color: var(--info);">
                        <span>${item.productName}</span>
                        <span>${item.quantity} وحدة</span>
                    </div>
                `).join('')}
            `;
        }

        domUtils.getElementById('inventoryReportContent').innerHTML = html;
    } catch (error) {
        console.error('Error generating inventory report:', error);
        domUtils.getElementById('inventoryReportContent').innerHTML = `<p style="color: var(--danger);">خطأ: ${error.message}</p>`;
    }
}

// Generate and Display Product Report
async generateAndDisplayProductReport() {
    try {
        const report = reports.generateProductReport();

        let html = `
            <div class="stat-row">
                <span>إجمالي المنتجات:</span>
                <span class="stat-value">${report.data.totalProducts}</span>
            </div>
            <div class="stat-row">
                <span>القيمة الإجمالية للمنتجات:</span>
                <span class="stat-value">${numberUtils.formatCurrency(report.data.totalValue)}</span>
            </div>
        `;

        if (report.data.categories && report.data.categories.length > 0) {
            html += `
                <hr style="margin: 15px 0;">
                <h4 style="margin: 15px 0 10px 0;">الفئات:</h4>
                ${report.data.categories.map(cat => `
                    <div class="stat-row">
                        <span>${cat}</span>
                        <span>${products.products.filter(p => p.category === cat).length} منتج</span>
                    </div>
                `).join('')}
            `;
        }

        if (report.data.topProducts && report.data.topProducts.length > 0) {
            html += `
                <hr style="margin: 15px 0;">
                <h4 style="margin: 15px 0 10px 0;">أفضل المنتجات:</h4>
                ${report.data.topProducts.slice(0, 5).map(item => `
                    <div class="stat-row">
                        <span>${item.productName || item.name}</span>
                        <span>${numberUtils.formatCurrency(item.totalValue || 0)}</span>
                    </div>
                `).join('')}
            `;
        }

        domUtils.getElementById('productReportContent').innerHTML = html;
    } catch (error) {
        console.error('Error generating product report:', error);
        domUtils.getElementById('productReportContent').innerHTML = `<p style="color: var(--danger);">خطأ: ${error.message}</p>`;
    }
}

// Generate and Display Branch Report
async generateAndDisplayBranchReport() {
    try {
        const report = reports.generateBranchReport();

        let html = `
            <div class="stat-row">
                <span>عدد الفروع:</span>
                <span class="stat-value">${report.data.branchCount}</span>
            </div>
        `;

        if (report.data.topPerformers && report.data.topPerformers.length > 0) {
            html += `
                <hr style="margin: 15px 0;">
                <h4 style="margin: 15px 0 10px 0; color: var(--success);">🏆 أفضل الفروع الأداء:</h4>
                ${report.data.topPerformers.slice(0, 5).map(branch => `
                    <div style="background: var(--bg-secondary); padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                        <div style="font-weight: 600; color: var(--success);">${branch.name}</div>
                        <div class="stat-row">
                            <span>الإيراد:</span>
                            <span>${numberUtils.formatCurrency(branch.totalRevenue || 0)}</span>
                        </div>
                        <div class="stat-row">
                            <span>الربح:</span>
                            <span>${numberUtils.formatCurrency(branch.monthlyProfit || 0)}</span>
                        </div>
                    </div>
                `).join('')}
            `;
        }

        if (report.data.needsAttention && report.data.needsAttention.length > 0) {
            html += `
                <hr style="margin: 15px 0;">
                <h4 style="margin: 15px 0 10px 0; color: var(--warning);">⚠️ الفروع التي تحتاج انتباه:</h4>
                ${report.data.needsAttention.slice(0, 5).map(branch => `
                    <div style="background: var(--bg-secondary); padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                        <div style="font-weight: 600; color: var(--warning);">${branch.name}</div>
                        <div class="stat-row">
                            <span>الإيراد:</span>
                            <span>${numberUtils.formatCurrency(branch.totalRevenue || 0)}</span>
                        </div>
                        <div class="stat-row">
                            <span>الربح:</span>
                            <span>${numberUtils.formatCurrency(branch.monthlyProfit || 0)}</span>
                        </div>
                    </div>
                `).join('')}
            `;
        }

        domUtils.getElementById('branchReportContent').innerHTML = html;
    } catch (error) {
        console.error('Error generating branch report:', error);
        domUtils.getElementById('branchReportContent').innerHTML = `<p style="color: var(--danger);">خطأ: ${error.message}</p>`;
    }
}

// Generate and Display Forecast Report
async generateAndDisplayForecastReport() {
    try {
        const report = reports.generateDemandForecast();

        let html = `<h4 style="margin: 15px 0 10px 0;">📊 التنبؤات والتوصيات:</h4>`;

        if (report.data.predictedTrends && report.data.predictedTrends.length > 0) {
            html += `<h5 style="margin: 10px 0 5px 0;">الاتجاهات المتوقعة:</h5>`;
            html += report.data.predictedTrends.slice(0, 5).map(trend => `
                <div class="stat-row">
                    <span>${trend.product} ${trend.trend}</span>
                    <span>الطلب المتوقع: ${trend.predictedDemand} وحدة</span>
                </div>
            `).join('');
        }

        if (report.data.recommendations && report.data.recommendations.length > 0) {
            html += `<hr style="margin: 15px 0;"><h5 style="margin: 10px 0 5px 0;">التوصيات:</h5>`;
            html += report.data.recommendations.map(rec => `
                <div class="ai-recommendation ${rec.priority === 'high' ? 'high' : rec.priority === 'critical' ? 'danger' : 'medium'}">
                    <div class="recommendation-title">${rec.type}: ${rec.message}</div>
                    <div class="recommendation-desc">الأولوية: ${rec.priority}</div>
                </div>
            `).join('');
        }

        if (report.data.seasonalAnalysis) {
            html += `<hr style="margin: 15px 0;"><h5>تحليل الموسمية:</h5>`;
            html += `
                <div class="stat-row">
                    <span>أوقات الذروة:</span>
                    <span>${report.data.seasonalAnalysis.peak}</span>
                </div>
                <div class="stat-row">
                    <span>أوقات الانخفاض:</span>
                    <span>${report.data.seasonalAnalysis.low}</span>
                </div>
            `;
        }

        domUtils.getElementById('forecastReportContent').innerHTML = html;
    } catch (error) {
        console.error('Error generating forecast report:', error);
        domUtils.getElementById('forecastReportContent').innerHTML = `<p style="color: var(--danger);">خطأ: ${error.message}</p>`;
    }
}

// Export Report to PDF
exportReportToPDF(reportType) {
    try {
        let content = '';
        let title = '';

        switch(reportType) {
            case 'sales':
                content = domUtils.getElementById('salesReportContent').innerText;
                title = 'تقرير المبيعات';
                break;
            case 'inventory':
                content = domUtils.getElementById('inventoryReportContent').innerText;
                title = 'تقرير المخزون';
                break;
            case 'product':
                content = domUtils.getElementById('productReportContent').innerText;
                title = 'تقرير المنتجات';
                break;
            case 'branch':
                content = domUtils.getElementById('branchReportContent').innerText;
                title = 'تقرير الفروع';
                break;
            case 'forecast':
                content = domUtils.getElementById('forecastReportContent').innerText;
                title = 'تقرير التنبؤات';
                break;
        }

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    h1 { text-align: center; color: #333; }
                    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
                    .stat-value { font-weight: bold; color: #2563eb; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <p>التاريخ: ${dateUtils.getCurrentDateTime()}</p>
                <hr>
                <pre style="white-space: pre-wrap; word-wrap: break-word;">${content}</pre>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        notificationUtils.showToast('✅ تم طباعة التقرير', 'success');
    } catch (error) {
        console.error('Error exporting report:', error);
        notificationUtils.showToast('❌ خطأ في تصدير التقرير', 'danger');
    }
}
