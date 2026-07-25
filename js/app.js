/* ========== Main Application Controller ========== */
class PointMarketApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.chartInstances = {};
        this.map = null;
    }

    async initialize() {
        console.log('🚀 Point Market System Initializing...');

        try {
            // Initialize Database
            await db.init();
            console.log('✓ Database initialized');

            // Initialize Auth
            await auth.initialize();
            console.log('✓ Auth initialized');

            // Initialize Notifications
            await notifications.initialize();
            console.log('✓ Notifications initialized');

            // Keep the header badge in sync with unread notifications
            notifications.addListener(() => this.updateNotificationBadge());

            // Initialize Data Managers
            await products.initialize();
            await branches.initialize();
            await inventory.initialize();
            await sales.initialize();
            console.log('✓ All data managers initialized');

            // Seed database with sample data
            const seeder = new SeedersManager(db, products, branches, inventory, sales);
            await seeder.seedAll();

            // Reload sales into memory since seeding adds sales after sales.initialize() ran
            await sales.initialize();

            // Setup UI
            this.setupEventListeners();
            this.setupDarkMode();
            console.log('✓ Event listeners setup');

            // Load theme
            this.loadTheme();

            // Check Authentication
            if (auth.isAuthenticated) {
                this.showMainApp();
            } else {
                this.showLoginPage();
            }

            console.log('✅ Application ready');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            notificationUtils.showToast('خطأ في تحميل التطبيق', 'danger');
        }
    }

    // ========== Authentication ==========
    setupLoginForm() {
        const form = domUtils.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = domUtils.getElementById('username').value;
            const password = domUtils.getElementById('password').value;
            const userType = domUtils.getElementById('userType').value;

            const result = auth.login(username, password, userType);

            if (result.success) {
                notificationUtils.showToast(result.message, 'success');
                setTimeout(() => {
                    this.showMainApp();
                }, 500);
            } else {
                notificationUtils.showToast(result.message, 'danger');
            }
        });
    }

    showLoginPage() {
        domUtils.getElementById('loginPage').style.display = 'block';
        domUtils.getElementById('mainApp').style.display = 'none';
        this.setupLoginForm();
    }

    showMainApp() {
        domUtils.getElementById('loginPage').style.display = 'none';
        domUtils.getElementById('mainApp').style.display = 'flex';
        this.updateUserInfo();
        this.updateNotificationBadge();
        this.loadDashboard();
    }

    updateUserInfo() {
        const user = auth.getCurrentUser();
        if (!user) return;

        domUtils.getElementById('userName').textContent = user.name;
        domUtils.getElementById('userRole').textContent = auth.getRoleLabel(user.role);
    }

    // ========== Navigation ==========
    setupEventListeners() {
        // Navigation Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Logout
        domUtils.getElementById('logoutBtn')?.addEventListener('click', () => {
            auth.logout();
            window.location.reload();
        });

        // Dark Mode Toggle
        domUtils.getElementById('darkModeToggle')?.addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Notification Button
        domUtils.getElementById('notificationBtn')?.addEventListener('click', () => {
            this.toggleNotificationPanel();
        });

        // Close Notifications
        domUtils.getElementById('closeNotifications')?.addEventListener('click', () => {
            this.toggleNotificationPanel();
        });

        // Sidebar Toggle (Mobile)
        domUtils.getElementById('sidebarToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Page-specific event listeners
        this.setupPageListeners();
    }

    setupPageListeners() {
        // Products Page
        domUtils.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.showProductModal();
        });

        domUtils.getElementById('importExcelBtn')?.addEventListener('click', () => {
            document.getElementById('excelFileInput').click();
        });

        domUtils.getElementById('exportTemplateBtn')?.addEventListener('click', () => {
            this.exportProductTemplate();
        });

        domUtils.getElementById('exportProductsExcelBtn')?.addEventListener('click', () => {
            this.exportProductsToExcel();
        });

        document.getElementById('excelFileInput')?.addEventListener('change', (e) => {
            this.handleExcelImport(e);
        });

        domUtils.getElementById('productSearch')?.addEventListener('input', (e) => {
            this.filterProducts(e.target.value);
        });

        domUtils.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.filterProductsByCategory(e.target.value);
        });

        // Inventory Page
        domUtils.getElementById('inventorySearch')?.addEventListener('input', (e) => {
            this.searchInventory(e.target.value);
        });

        domUtils.getElementById('branchFilter')?.addEventListener('change', (e) => {
            this.filterInventoryByBranch(e.target.value);
        });

        domUtils.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filterInventoryByStatus(e.target.value);
        });

        domUtils.getElementById('exportInventoryBtn')?.addEventListener('click', () => {
            this.exportInventory();
        });

        // Sales Page
        domUtils.getElementById('newInvoiceBtn')?.addEventListener('click', () => {
            this.startNewInvoice();
        });

        // Settings Page
        domUtils.getElementById('backupBtn')?.addEventListener('click', () => {
            this.performBackup();
        });

        // Reports Page
        domUtils.getElementById('refreshReportsBtn')?.addEventListener('click', () => {
            this.loadReports();
        });

        domUtils.getElementById('exportReportsJsonBtn')?.addEventListener('click', () => {
            this.exportReports('json');
        });

        domUtils.getElementById('exportReportsCsvBtn')?.addEventListener('click', () => {
            this.exportReports('csv');
        });

        domUtils.getElementById('exportSalesExcelBtn')?.addEventListener('click', () => {
            if (this.lastReports && this.lastReports.salesReport) {
                exporter.exportSalesReport(this.lastReports.salesReport);
            } else {
                notificationUtils.showToast('حمّل التقارير أولاً', 'info');
            }
        });

        domUtils.getElementById('exportInventoryExcelBtn')?.addEventListener('click', () => {
            if (this.lastReports && this.lastReports.inventoryReport) {
                exporter.exportInventoryReport(this.lastReports.inventoryReport);
            } else {
                notificationUtils.showToast('حمّل التقارير أولاً', 'info');
            }
        });

        domUtils.getElementById('exportBranchExcelBtn')?.addEventListener('click', () => {
            if (this.lastReports && this.lastReports.branchReport) {
                exporter.exportBranchReport(this.lastReports.branchReport);
            } else {
                notificationUtils.showToast('حمّل التقارير أولاً', 'info');
            }
        });

        domUtils.getElementById('exportProductExcelBtn')?.addEventListener('click', () => {
            if (this.lastReports && this.lastReports.productReport) {
                exporter.exportProductReport(this.lastReports.productReport);
            } else {
                notificationUtils.showToast('حمّل التقارير أولاً', 'info');
            }
        });

        domUtils.getElementById('restoreBtn')?.addEventListener('click', () => {
            this.performRestore();
        });

        // Dark Mode Checkbox
        domUtils.getElementById('darkModeCheckbox')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.enableDarkMode();
            } else {
                this.disableDarkMode();
            }
        });
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            domUtils.removeClass(p, 'active');
        });

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            domUtils.removeClass(link, 'active');
        });

        // Show selected page
        const selectedPage = domUtils.getElementById(page + 'Page');
        if (selectedPage) {
            domUtils.addClass(selectedPage, 'active');
        }

        // Update nav link
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

        // Update header
        const titles = {
            dashboard: 'لوحة التحكم',
            products: 'إدارة المنتجات',
            inventory: 'إدارة المخزون',
            branches: 'إدارة الفروع',
            sales: 'إدارة المبيعات',
            reports: 'التقارير والتحليلات',
            aiIntelligence: 'لوحة الذكاء الاصطناعي',
            settings: 'الإعدادات'
        };

        domUtils.getElementById('pageTitle').textContent = titles[page] || 'الصفحة';

        this.currentPage = page;

        // Load page content
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'branches':
                this.loadBranches();
                break;
            case 'sales':
                this.loadSales();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'aiIntelligence':
                this.loadAIDashboard();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // ========== Dashboard ==========
    async loadDashboard() {
        try {
            // Load KPIs
            domUtils.getElementById('kpiProducts').textContent = products.products.length;
            domUtils.getElementById('kpiBranches').textContent = branches.branches.length;
            domUtils.getElementById('kpiInventoryValue').textContent = numberUtils.formatCurrency(inventory.getTotalInventoryValue());
            domUtils.getElementById('kpiSales').textContent = numberUtils.formatCurrency(sales.getTotalSales());

            // Load Charts
            this.loadCharts();

            // Load Alerts
            this.loadAlerts();

            // Load AI Recommendations
            await this.loadAIRecommendations();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    loadCharts() {
        try {
            // Products Distribution Chart
            const productCtx = domUtils.getElementById('productsChart');
            if (productCtx) {
                const productsByCategory = arrayUtils.groupBy(products.products, 'category');
                const labels = Object.keys(productsByCategory);
                const data = labels.map(cat => productsByCategory[cat].length);

                if (this.chartInstances.productsChart) {
                    this.chartInstances.productsChart.destroy();
                }

                this.chartInstances.productsChart = new Chart(productCtx, {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: [
                                '#2563eb', '#60a5fa', '#93c5fd', '#dbeafe',
                                '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12 }
                            }
                        }
                    }
                });
            }

            // Sales Chart
            const salesCtx = domUtils.getElementById('salesChart');
            if (salesCtx) {
                const topItems = sales.getTopSellingItems(6);
                const labels = topItems.map(item => item.productName);
                const data = topItems.map(item => item.total);

                if (this.chartInstances.salesChart) {
                    this.chartInstances.salesChart.destroy();
                }

                this.chartInstances.salesChart = new Chart(salesCtx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: 'إجمالي المبيعات',
                            data,
                            backgroundColor: '#10b981',
                            borderColor: '#059669',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading charts:', error);
        }
    }

    async loadAlerts() {
        const alertsList = domUtils.getElementById('alertsList');
        if (!alertsList) return;

        const alerts = notifications.getNotifications(10);

        if (alerts.length === 0) {
            alertsList.innerHTML = '<div class="empty-state">لا توجد تنبيهات</div>';
            return;
        }

        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.color}">
                <div class="alert-content">
                    <div class="alert-title">${alert.icon} ${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${dateUtils.formatTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    async loadAIRecommendations() {
        const recsList = domUtils.getElementById('aiRecommendations');
        if (!recsList) return;

        try {
            const recommendations = await aiAgent.generateRecommendations();

            if (recommendations.length === 0) {
                recsList.innerHTML = '<div class="empty-state">جاري التحليل...</div>';
                return;
            }

            recsList.innerHTML = recommendations.slice(0, 5).map(rec => `
                <div class="recommendation-item">
                    <div class="alert-content">
                        <div class="alert-title">${rec.icon} ${rec.title}</div>
                        <div class="alert-message">${rec.message}</div>
                        <div class="alert-message" style="color: var(--primary); font-weight: 600;">💡 ${rec.action}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading AI recommendations:', error);
        }
    }

    // ========== Products Management ==========
    async loadProducts() {
        const productList = domUtils.getElementById('productsList');
        if (!productList) return;

        const allProducts = products.getProducts();
        const categoryFilter = domUtils.getElementById('categoryFilter');

        // Update category filter
        categoryFilter.innerHTML = '<option value="">جميع الفئات</option>';
        products.getCategories().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        if (allProducts.length === 0) {
            productList.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد منتجات</td></tr>';
            return;
        }

        productList.innerHTML = allProducts.map((p, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${numberUtils.formatCurrency(p.price)}</td>
                <td>${numberUtils.formatCurrency(p.cost)}</td>
                <td>${numberUtils.formatPercent(numberUtils.calculateMargin(p.price, p.cost))}</td>
                <td>${p.minStock}</td>
                <td>${p.maxStock}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="app.editProduct(${p.id})">تعديل</button>
                        <button class="btn-delete" onclick="app.deleteProduct(${p.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterProducts(query) {
        const productList = domUtils.getElementById('productsList');
        const filtered = products.searchProducts(query);

        productList.innerHTML = filtered.map((p, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${numberUtils.formatCurrency(p.price)}</td>
                <td>${numberUtils.formatCurrency(p.cost)}</td>
                <td>${numberUtils.formatPercent(numberUtils.calculateMargin(p.price, p.cost))}</td>
                <td>${p.minStock}</td>
                <td>${p.maxStock}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="app.editProduct(${p.id})">تعديل</button>
                        <button class="btn-delete" onclick="app.deleteProduct(${p.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterProductsByCategory(category) {
        const productList = domUtils.getElementById('productsList');
        const filtered = products.getProductsByCategory(category);

        productList.innerHTML = filtered.map((p, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${numberUtils.formatCurrency(p.price)}</td>
                <td>${numberUtils.formatCurrency(p.cost)}</td>
                <td>${numberUtils.formatPercent(numberUtils.calculateMargin(p.price, p.cost))}</td>
                <td>${p.minStock}</td>
                <td>${p.maxStock}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="app.editProduct(${p.id})">تعديل</button>
                        <button class="btn-delete" onclick="app.deleteProduct(${p.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showProductModal(productId = null) {
        // Create modal from template
        const template = document.getElementById('productModalTemplate');
        if (!template) return;

        let modal = document.getElementById('productModal');
        if (modal) modal.remove();

        modal = template.content.cloneNode(true).querySelector('.modal');
        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        const closeBtn = modal.querySelector('.close-btn');

        if (productId) {
            const product = products.getProduct(productId);
            if (product) {
                modal.querySelector('[name="name"]').value = product.name;
                modal.querySelector('[name="category"]').value = product.category;
                modal.querySelector('[name="price"]').value = product.price;
                modal.querySelector('[name="cost"]').value = product.cost;
                modal.querySelector('[name="minStock"]').value = product.minStock;
                modal.querySelector('[name="maxStock"]').value = product.maxStock;
                modal.querySelector('.modal-header h2').textContent = 'تعديل منتج';
            }
        }

        modal.classList.add('active');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            if (productId) {
                await products.updateProduct(productId, data);
            } else {
                await products.addProduct(data);
            }

            notificationUtils.showToast('تم حفظ المنتج بنجاح', 'success');
            modal.remove();
            this.loadProducts();
        });

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.close-modal')?.addEventListener('click', () => {
            modal.remove();
        });
    }

    editProduct(productId) {
        this.showProductModal(productId);
    }

    async deleteProduct(productId) {
        if (confirm('هل تأكد من حذف هذا المنتج؟')) {
            await products.deleteProduct(productId);
            notificationUtils.showToast('تم حذف المنتج', 'success');
            this.loadProducts();
        }
    }

    // ========== Inventory Management ==========
    async loadInventory() {
        const inventoryList = domUtils.getElementById('inventoryList');
        const branchFilter = domUtils.getElementById('branchFilter');

        if (!inventoryList) return;

        // Update branch filter
        branchFilter.innerHTML = '<option value="">جميع الفروع</option>';
        branches.branches.forEach(b => {
            const option = document.createElement('option');
            option.value = b.id;
            option.textContent = b.name;
            branchFilter.appendChild(option);
        });

        const items = inventory.getInventoryWithDetails();

        if (items.length === 0) {
            inventoryList.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد بيانات</td></tr>';
            return;
        }

        inventoryList.innerHTML = items.map((item, idx) => {
            const statusClass = `status-${item.status}`;
            const statusText = { low: 'منخفض', balanced: 'متوازن', high: 'زائد', 'out-of-stock': 'انقطع' };

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.branchName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.minStock}</td>
                    <td>${item.maxStock}</td>
                    <td><span class="status-badge ${statusClass}">${statusText[item.status] || item.status}</span></td>
                    <td>${dateUtils.formatDate(item.lastUpdated)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="app.updateInventoryQuantity(${item.productId}, ${item.branchId}, ${item.quantity})">تحديث</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async updateInventoryQuantity(productId, branchId, currentQuantity) {
        const newQuantity = prompt(`أدخل الكمية الجديدة (الحالية: ${currentQuantity}):`, currentQuantity);
        if (newQuantity === null) return;

        if (!validationUtils.isPositiveNumber(newQuantity)) {
            notificationUtils.showToast('أدخل عدد صحيح موجب', 'danger');
            return;
        }

        await inventory.updateQuantity(productId, branchId, parseInt(newQuantity));
        notificationUtils.showToast('تم تحديث المخزون', 'success');
        this.loadInventory();
    }

    exportInventory() {
        const items = inventory.getInventoryWithDetails();
        if (items.length === 0) {
            notificationUtils.showToast('لا توجد بيانات مخزون لتصديرها', 'info');
            return;
        }

        const headers = ['المنتج', 'الفئة', 'الفرع', 'الكمية', 'الحد الأدنى', 'الحد الأقصى', 'الحالة', 'القيمة', 'آخر تحديث'];
        const statusText = { low: 'منخفض', balanced: 'متوازن', high: 'زائد', 'out-of-stock': 'انقطع' };
        const rows = items.map(item => [
            item.productName,
            item.productCategory,
            item.branchName,
            item.quantity,
            item.minStock,
            item.maxStock,
            statusText[item.status] || item.status,
            item.value.toFixed(2),
            dateUtils.formatDate(item.lastUpdated)
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory-${dateUtils.getCurrentDate()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        notificationUtils.showToast('تم تصدير المخزون بنجاح', 'success');
    }

    searchInventory(query) {
        const inventoryList = domUtils.getElementById('inventoryList');
        const filtered = inventory.searchInventory(query);

        if (filtered.length === 0) {
            inventoryList.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد نتائج</td></tr>';
            return;
        }

        inventoryList.innerHTML = filtered.map((item, idx) => {
            const statusClass = `status-${item.status}`;
            const statusText = { low: 'منخفض', balanced: 'متوازن', high: 'زائد', 'out-of-stock': 'انقطع' };

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.branchName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.minStock}</td>
                    <td>${item.maxStock}</td>
                    <td><span class="status-badge ${statusClass}">${statusText[item.status] || item.status}</span></td>
                    <td>${dateUtils.formatDate(item.lastUpdated)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="app.updateInventoryQuantity(${item.productId}, ${item.branchId}, ${item.quantity})">تحديث</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterInventoryByBranch(branchId) {
        const inventoryList = domUtils.getElementById('inventoryList');
        let filtered = inventory.getInventoryWithDetails();

        if (branchId) {
            filtered = filtered.filter(i => i.branchId == branchId);
        }

        inventoryList.innerHTML = filtered.map((item, idx) => {
            const statusClass = `status-${item.status}`;
            const statusText = { low: 'منخفض', balanced: 'متوازن', high: 'زائد', 'out-of-stock': 'انقطع' };

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.branchName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.minStock}</td>
                    <td>${item.maxStock}</td>
                    <td><span class="status-badge ${statusClass}">${statusText[item.status] || item.status}</span></td>
                    <td>${dateUtils.formatDate(item.lastUpdated)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="app.updateInventoryQuantity(${item.productId}, ${item.branchId}, ${item.quantity})">تحديث</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterInventoryByStatus(status) {
        const inventoryList = domUtils.getElementById('inventoryList');
        let filtered = inventory.getInventoryWithDetails();

        if (status) {
            filtered = filtered.filter(i => i.status === status);
        }

        inventoryList.innerHTML = filtered.map((item, idx) => {
            const statusClass = `status-${item.status}`;
            const statusText = { low: 'منخفض', balanced: 'متوازن', high: 'زائد', 'out-of-stock': 'انقطع' };

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.branchName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.minStock}</td>
                    <td>${item.maxStock}</td>
                    <td><span class="status-badge ${statusClass}">${statusText[item.status] || item.status}</span></td>
                    <td>${dateUtils.formatDate(item.lastUpdated)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="app.updateInventoryQuantity(${item.productId}, ${item.branchId}, ${item.quantity})">تحديث</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ========== Branches Management ==========
    async loadBranches() {
        const branchesList = domUtils.getElementById('branchesList');
        if (!branchesList) return;

        const allBranches = branches.getBranches();

        branchesList.innerHTML = allBranches.map(branch => `
            <div class="branch-card">
                <div class="branch-name">📍 ${branch.name}</div>
                <div class="branch-stat">
                    <span class="branch-stat-label">المدينة:</span>
                    <span class="branch-stat-value">${branch.city}</span>
                </div>
                <div class="branch-stat">
                    <span class="branch-stat-label">الموظفون:</span>
                    <span class="branch-stat-value">${branch.staff}</span>
                </div>
                <div class="branch-stat">
                    <span class="branch-stat-label">التكلفة:</span>
                    <span class="branch-stat-value">${numberUtils.formatCurrency(branch.cost)}</span>
                </div>
                <div class="branch-stat">
                    <span class="branch-stat-label">الإيرادات:</span>
                    <span class="branch-stat-value" style="color: var(--success);">${numberUtils.formatCurrency(branch.revenue)}</span>
                </div>
            </div>
        `).join('');

        // Load map
        this.loadBranchMap();
    }

    loadBranchMap() {
        const mapContainer = document.getElementById('branchMap');
        if (!mapContainer) return;

        // Initialize Leaflet map
        try {
            if (this.map) {
                this.map.remove();
            }

            this.map = L.map('branchMap').setView([24.7136, 46.6753], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

            branches.getBranches().forEach(branch => {
                L.marker([branch.lat, branch.lng])
                    .bindPopup(`<strong>${branch.name}</strong><br>${branch.city}`)
                    .addTo(this.map);
            });
        } catch (error) {
            console.error('Error loading map:', error);
        }
    }

    // ========== Sales Management ==========
    async loadSales() {
        const salesList = domUtils.getElementById('salesList');
        if (!salesList) return;

        const allSales = sales.getSales();

        if (allSales.length === 0) {
            salesList.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد مبيعات</td></tr>';
            return;
        }

        salesList.innerHTML = allSales.map((sale, idx) => {
            const branch = branches.getBranch(sale.branchId);
            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${sale.invoiceNumber}</td>
                    <td>${dateUtils.formatDate(sale.date)}</td>
                    <td>${branch?.name || '-'}</td>
                    <td>${sale.items.length}</td>
                    <td>${numberUtils.formatCurrency(sale.subtotal)}</td>
                    <td>${numberUtils.formatCurrency(sale.discount)}</td>
                    <td style="color: var(--primary); font-weight: 600;">${numberUtils.formatCurrency(sale.total)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-view" onclick="app.viewSale(${sale.id})">عرض</button>
                            <button class="btn-edit" onclick="app.printSale(${sale.id})">طباعة</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    startNewInvoice() {
        const branchId = branches.getBranches()[0]?.id;
        if (!branchId) {
            notificationUtils.showToast('لا توجد فروع', 'danger');
            return;
        }

        sales.startInvoice(branchId);
        this.showInvoiceModal(branchId);
    }

    showInvoiceModal(branchId) {
        const template = domUtils.getElementById('invoiceModalTemplate');
        if (!template) return;

        let modal = domUtils.getElementById('invoiceModal');
        if (modal) modal.remove();

        modal = template.content.cloneNode(true).querySelector('.modal');
        document.body.appendChild(modal);
        this.invoiceModal = modal;

        // Populate branch select
        const branchSelect = modal.querySelector('#invoiceBranchSelect');
        branchSelect.innerHTML = branches.getBranches().map(b =>
            `<option value="${b.id}">${b.name}</option>`
        ).join('');
        branchSelect.value = branchId;

        // Populate product select
        const productSelect = modal.querySelector('#invoiceProductSelect');
        productSelect.innerHTML = products.getProducts().map(p =>
            `<option value="${p.id}">${p.name} — ${numberUtils.formatCurrency(p.price)}</option>`
        ).join('');

        this.updateInvoiceStockHint(modal);
        this.renderInvoiceCart(modal);

        branchSelect.addEventListener('change', (e) => {
            if (sales.currentInvoice && sales.currentInvoice.items.length > 0) {
                if (!confirm('تغيير الفرع سيبدأ فاتورة جديدة وسيتم فقدان الأصناف الحالية. متابعة؟')) {
                    branchSelect.value = sales.currentInvoice.branchId;
                    return;
                }
            }
            sales.startInvoice(Number(e.target.value));
            this.updateInvoiceStockHint(modal);
            this.renderInvoiceCart(modal);
        });

        productSelect.addEventListener('change', () => this.updateInvoiceStockHint(modal));

        modal.querySelector('#addInvoiceItemBtn').addEventListener('click', () => {
            const productId = Number(productSelect.value);
            const quantity = Number(modal.querySelector('#invoiceQuantityInput').value);

            if (!productId || !quantity || quantity <= 0) {
                notificationUtils.showToast('اختر منتج وكمية صحيحة', 'danger');
                return;
            }

            const invBranchId = sales.currentInvoice.branchId;
            const stockItem = inventory.getInventoryItem(productId, invBranchId);
            const existingQty = sales.currentInvoice.items.find(i => i.productId === productId)?.quantity || 0;

            if (stockItem && (existingQty + quantity) > stockItem.quantity) {
                notificationUtils.showToast(`الكمية المتاحة في المخزون: ${stockItem.quantity}`, 'danger');
                return;
            }

            try {
                sales.addItemToInvoice(productId, quantity);
                this.renderInvoiceCart(modal);
                this.updateInvoiceStockHint(modal);
            } catch (error) {
                notificationUtils.showToast(error.message, 'danger');
            }
        });

        modal.querySelector('#invoiceDiscountInput').addEventListener('input', (e) => {
            sales.setDiscount(Number(e.target.value) || 0);
            this.renderInvoiceTotals(modal);
        });

        modal.querySelector('#completeInvoiceBtn').addEventListener('click', async () => {
            if (!sales.currentInvoice || sales.currentInvoice.items.length === 0) {
                notificationUtils.showToast('أضف صنفاً واحداً على الأقل', 'danger');
                return;
            }

            const result = await sales.completeInvoice();
            if (result.success) {
                notificationUtils.showToast(`تم إنشاء الفاتورة #${result.sale.invoiceNumber}`, 'success');
                modal.remove();
                this.loadSales();
                if (this.currentPage === 'dashboard') this.loadDashboard();
                if (this.currentPage === 'inventory') this.loadInventory();
            } else {
                notificationUtils.showToast('خطأ: ' + result.error, 'danger');
            }
        });

        const closeInvoiceModal = () => {
            sales.cancelInvoice();
            modal.remove();
        };

        modal.querySelector('.close-btn').addEventListener('click', closeInvoiceModal);
        modal.querySelector('.close-modal').addEventListener('click', closeInvoiceModal);

        modal.classList.add('active');
    }

    updateInvoiceStockHint(modal) {
        const productSelect = modal.querySelector('#invoiceProductSelect');
        const hint = modal.querySelector('#invoiceStockHint');
        const productId = Number(productSelect.value);
        if (!productId || !sales.currentInvoice) {
            hint.textContent = '';
            return;
        }
        const stockItem = inventory.getInventoryItem(productId, sales.currentInvoice.branchId);
        hint.textContent = stockItem
            ? `📦 المتاح في هذا الفرع: ${stockItem.quantity} وحدة`
            : '📦 لا توجد بيانات مخزون لهذا المنتج في الفرع المختار';
    }

    removeInvoiceItem(productId) {
        sales.removeItemFromInvoice(productId);
        if (this.invoiceModal) {
            this.renderInvoiceCart(this.invoiceModal);
            this.updateInvoiceStockHint(this.invoiceModal);
        }
    }

    renderInvoiceCart(modal) {
        const list = modal.querySelector('#invoiceItemsList');
        const items = sales.currentInvoice?.items || [];

        list.innerHTML = items.length === 0
            ? '<tr><td colspan="5" class="text-center">لا توجد أصناف بعد</td></tr>'
            : items.map(item => `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${numberUtils.formatCurrency(item.price)}</td>
                    <td>${numberUtils.formatCurrency(item.total)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="app.removeInvoiceItem(${item.productId})">حذف</button>
                        </div>
                    </td>
                </tr>
            `).join('');

        this.renderInvoiceTotals(modal);
    }

    renderInvoiceTotals(modal) {
        const invoice = sales.currentInvoice;
        modal.querySelector('#invoiceSubtotal').textContent = numberUtils.formatCurrency(invoice?.subtotal || 0);
        modal.querySelector('#invoiceTax').textContent = numberUtils.formatCurrency(invoice?.tax || 0);
        modal.querySelector('#invoiceDiscountDisplay').textContent = numberUtils.formatCurrency(invoice?.discount || 0);
        modal.querySelector('#invoiceTotal').textContent = numberUtils.formatCurrency(invoice?.total || 0);
    }

    viewSale(saleId) {
        const sale = sales.getSale(saleId);
        if (!sale) {
            notificationUtils.showToast('البيع غير موجود', 'danger');
            return;
        }

        const itemsHTML = sale.items.map(item => `
            <div style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <div><strong>${item.productName}</strong></div>
                <div>الكمية: ${item.quantity} × ${numberUtils.formatCurrency(item.price)}</div>
                <div style="color: var(--primary);">الإجمالي: ${numberUtils.formatCurrency(item.total)}</div>
            </div>
        `).join('');

        alert(`الفاتورة #${sale.invoiceNumber}\n\nالتاريخ: ${dateUtils.formatDate(sale.date)}\n\nالإجمالي: ${numberUtils.formatCurrency(sale.total)}`);
    }

    printSale(saleId) {
        const sale = sales.getSale(saleId);
        if (!sale) return;

        const printContent = `
            <h1>الفاتورة #${sale.invoiceNumber}</h1>
            <p>التاريخ: ${dateUtils.formatDate(sale.date)}</p>
            <table border="1" cellpadding="10" cellspacing="0" style="width: 100%;">
                <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>الإجمالي</th>
                </tr>
                ${sale.items.map(item => `
                    <tr>
                        <td>${item.productName}</td>
                        <td>${item.quantity}</td>
                        <td>${numberUtils.formatCurrency(item.price)}</td>
                        <td>${numberUtils.formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </table>
            <p>المجموع: ${numberUtils.formatCurrency(sale.subtotal)}</p>
            <p>الضريبة: ${numberUtils.formatCurrency(sale.tax)}</p>
            <p><strong>الإجمالي: ${numberUtils.formatCurrency(sale.total)}</strong></p>
        `;

        const printWindow = window.open('', '', 'height=400,width=600');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    // ========== Reports ==========
    async loadReports() {
        try {
            const startInput = domUtils.getElementById('reportStartDate');
            const endInput = domUtils.getElementById('reportEndDate');

            // Default range: last 90 days -> today (only set once)
            if (startInput && !startInput.value) {
                const start = new Date();
                start.setDate(start.getDate() - 90);
                startInput.value = start.toISOString().split('T')[0];
            }
            if (endInput && !endInput.value) {
                endInput.value = dateUtils.getCurrentDate();
            }

            const startDate = startInput ? startInput.value : dateUtils.getCurrentDate();
            const endDate = endInput ? endInput.value : dateUtils.getCurrentDate();
            const endDateInclusive = endDate + 'T23:59:59.999Z';

            const salesReport = reports.generateSalesReport(startDate, endDateInclusive);
            const branchReport = reports.generateBranchReport();
            const inventoryReport = reports.generateInventoryReport();
            const productReport = reports.generateProductReport();
            const forecastReport = reports.generateDemandForecast();

            this.lastReports = { salesReport, branchReport, inventoryReport, productReport, forecastReport };

            this.renderSalesReport(salesReport);
            this.renderBranchReport(branchReport);
            this.renderInventoryProductReport(inventoryReport, productReport);
            this.renderForecastReport(forecastReport);
        } catch (error) {
            console.error('Error loading reports:', error);
            notificationUtils.showToast('حدث خطأ أثناء تحميل التقارير', 'danger');
        }
    }

    renderSalesReport(report) {
        const el = domUtils.getElementById('salesReport');
        if (!el) return;
        const { totalSales, totalProfit, transactionCount, topItems, byBranch } = report.data;

        const topItemsHtml = topItems.length
            ? topItems.map(item => `
                <div class="metric">
                    <span>${item.productName}</span>
                    <span>${item.quantity} وحدة — ${numberUtils.formatCurrency(item.total)}</span>
                </div>
            `).join('')
            : '<div class="empty-state">لا توجد بيانات مبيعات ضمن هذه الفترة</div>';

        const byBranchHtml = Object.entries(byBranch).map(([name, data]) => `
            <div class="metric">
                <span>${name}</span>
                <span>${data.sales} عملية — ${numberUtils.formatCurrency(data.revenue)}</span>
            </div>
        `).join('');

        el.innerHTML = `
            <div class="ai-content">
                <div class="metric"><span>إجمالي المبيعات</span><span>${numberUtils.formatCurrency(totalSales)}</span></div>
                <div class="metric"><span>إجمالي الأرباح</span><span>${numberUtils.formatCurrency(totalProfit)}</span></div>
                <div class="metric"><span>عدد العمليات</span><span>${numberUtils.formatNumber(transactionCount)}</span></div>
            </div>
            <h4 style="margin-top: var(--spacing-4);">🏆 الأكثر مبيعاً</h4>
            <div class="ai-content">${topItemsHtml}</div>
            <h4 style="margin-top: var(--spacing-4);">🏬 حسب الفرع</h4>
            <div class="ai-content">${byBranchHtml || '<div class="empty-state">لا توجد فروع</div>'}</div>
        `;
    }

    renderBranchReport(report) {
        const el = domUtils.getElementById('branchReport');
        if (!el) return;
        const { branchCount, totalMetrics, topPerformers, needsAttention } = report.data;

        const topHtml = topPerformers.map(b => `
            <div class="metric"><span>${b.name}</span><span>${numberUtils.formatCurrency(b.revenue)}</span></div>
        `).join('');

        const lowHtml = needsAttention.map(b => `
            <div class="metric"><span>${b.name}</span><span>${numberUtils.formatCurrency(b.revenue)}</span></div>
        `).join('');

        el.innerHTML = `
            <div class="ai-content">
                <div class="metric"><span>عدد الفروع</span><span>${numberUtils.formatNumber(branchCount)}</span></div>
                <div class="metric"><span>إجمالي الإيرادات</span><span>${numberUtils.formatCurrency(totalMetrics.totalRevenue)}</span></div>
                <div class="metric"><span>إجمالي التكاليف</span><span>${numberUtils.formatCurrency(totalMetrics.totalCost)}</span></div>
                <div class="metric"><span>إجمالي الموظفين</span><span>${numberUtils.formatNumber(totalMetrics.totalStaff)}</span></div>
            </div>
            <h4 style="margin-top: var(--spacing-4);">📈 الأفضل أداءً</h4>
            <div class="ai-content">${topHtml || '<div class="empty-state">لا توجد بيانات</div>'}</div>
            <h4 style="margin-top: var(--spacing-4);">📉 يحتاج متابعة</h4>
            <div class="ai-content">${lowHtml || '<div class="empty-state">لا توجد بيانات</div>'}</div>
        `;
    }

    renderInventoryProductReport(inventoryReport, productReport) {
        const el = domUtils.getElementById('inventoryProductReport');
        if (!el) return;
        const { totalValue, stats } = inventoryReport.data;
        const { totalProducts, categories, stats: productStats } = productReport.data;

        el.innerHTML = `
            <div class="ai-content">
                <div class="metric"><span>عدد المنتجات</span><span>${numberUtils.formatNumber(totalProducts)}</span></div>
                <div class="metric"><span>عدد الفئات</span><span>${numberUtils.formatNumber(categories.length)}</span></div>
                <div class="metric"><span>متوسط سعر البيع</span><span>${numberUtils.formatCurrency(productStats.averagePrice)}</span></div>
                <div class="metric"><span>قيمة المخزون الإجمالية</span><span>${numberUtils.formatCurrency(totalValue)}</span></div>
            </div>
            <h4 style="margin-top: var(--spacing-4);">📦 حالة المخزون</h4>
            <div class="ai-recommendation ${stats.outOfStock > 0 ? 'high' : 'low'}">
                ${stats.outOfStock} منتج نفدت كميته بالكامل
            </div>
            <div class="ai-recommendation ${stats.lowStock > 0 ? 'medium' : 'low'}">
                ${stats.lowStock} منتج بمخزون منخفض
            </div>
            <div class="ai-recommendation low">
                ${stats.highStock} منتج بمخزون زائد
            </div>
        `;
    }

    renderForecastReport(report) {
        const el = domUtils.getElementById('forecastReport');
        if (!el) return;
        const { predictedTrends, recommendations, seasonalAnalysis } = report.data;

        const trendsHtml = predictedTrends.length
            ? predictedTrends.map(t => `
                <div class="metric">
                    <span>${t.trend} ${t.product}</span>
                    <span>طلب متوقع: ${numberUtils.formatNumber(t.predictedDemand)} وحدة</span>
                </div>
            `).join('')
            : '<div class="empty-state">لا توجد بيانات كافية للتنبؤ</div>';

        const recHtml = recommendations.length
            ? recommendations.map(r => `
                <div class="ai-recommendation ${r.priority === 'critical' ? 'high' : r.priority}">${r.message}</div>
            `).join('')
            : '<div class="empty-state">لا توجد توصيات حالياً</div>';

        el.innerHTML = `
            <h4>📈 اتجاهات الطلب</h4>
            <div class="ai-content">${trendsHtml}</div>
            <h4 style="margin-top: var(--spacing-4);">💡 التوصيات</h4>
            ${recHtml}
            <h4 style="margin-top: var(--spacing-4);">🗓️ التحليل الموسمي</h4>
            <div class="ai-content">
                <div class="metric"><span>موسم الذروة</span><span>${seasonalAnalysis.peak}</span></div>
                <div class="metric"><span>الموسم المنخفض</span><span>${seasonalAnalysis.low}</span></div>
            </div>
        `;
    }

    exportReports(format) {
        if (!this.lastReports) {
            notificationUtils.showToast('حمّل التقارير أولاً', 'info');
            return;
        }

        const { salesReport, branchReport, inventoryReport, productReport } = this.lastReports;
        let content, mime, filename;

        if (format === 'json') {
            content = JSON.stringify({ salesReport, branchReport, inventoryReport, productReport }, null, 2);
            mime = 'application/json';
            filename = `reports-${dateUtils.getCurrentDate()}.json`;
        } else {
            content = [salesReport, branchReport, inventoryReport, productReport]
                .map(r => reports.exportReportAsCSV(r))
                .join('\n\n');
            mime = 'text/csv';
            filename = `reports-${dateUtils.getCurrentDate()}.csv`;
        }

        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        notificationUtils.showToast('تم تنزيل التقرير', 'success');
    }

    // ========== Settings ==========
    async loadSettings() {
        const user = auth.getCurrentUser();
        const profileEl = domUtils.getElementById('userProfile');

        if (user && profileEl) {
            const permissions = auth.getPermissions();
            const permissionLabels = {
                read: 'عرض', write: 'إضافة/تعديل', delete: 'حذف',
                export: 'تصدير', import: 'استيراد', 'manage-users': 'إدارة المستخدمين',
                'delete-own': 'حذف (خاص)', 'write-own': 'إضافة/تعديل (خاص)'
            };

            profileEl.innerHTML = `
                <div style="display:flex; align-items:center; gap: var(--spacing-4); margin-bottom: var(--spacing-4);">
                    <div style="font-size: 2.5rem;">${user.avatar || '👤'}</div>
                    <div>
                        <div style="font-weight:700; font-size:1.1rem;">${user.name}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">${auth.getRoleLabel(user.role)}</div>
                    </div>
                </div>
                <div class="metric"><span>اسم المستخدم</span><span>${user.username}</span></div>
                <div class="metric"><span>البريد الإلكتروني</span><span>${user.email}</span></div>
                <div class="metric"><span>الصلاحيات</span><span>${permissions.map(p => permissionLabels[p] || p).join('، ')}</span></div>
            `;
        }

        const activityEl = domUtils.getElementById('activityLog');
        if (activityEl) {
            try {
                const log = await auth.getActivityLog(10);
                activityEl.innerHTML = log.length === 0
                    ? '<div class="empty-state">لا يوجد نشاط مسجل</div>'
                    : log.map(entry => `
                        <div class="metric">
                            <span>${entry.description}</span>
                            <span style="color: var(--text-secondary); font-size: 0.8rem;">${dateUtils.formatDateTime(entry.timestamp)}</span>
                        </div>
                    `).join('');
            } catch (error) {
                console.error('Error loading activity log:', error);
                activityEl.innerHTML = '<div class="empty-state">تعذر تحميل سجل النشاط</div>';
            }
        }
    }

    async performBackup() {
        try {
            const backup = await db.exportData();
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup-${dateUtils.getCurrentDate()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            notificationUtils.showToast('تم تنزيل النسخة الاحتياطية', 'success');
        } catch (error) {
            console.error('Backup error:', error);
            notificationUtils.showToast('خطأ في النسخ الاحتياطية', 'danger');
        }
    }

    async performRestore() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const backup = JSON.parse(text);
                await db.importData(backup);
                notificationUtils.showToast('تم استعادة البيانات', 'success');
                window.location.reload();
            } catch (error) {
                console.error('Restore error:', error);
                notificationUtils.showToast('خطأ في استعادة البيانات', 'danger');
            }
        };
        input.click();
    }

    // ========== Dark Mode ==========
    setupDarkMode() {
        const darkModeCheckbox = domUtils.getElementById('darkModeCheckbox');
        if (darkModeCheckbox) {
            darkModeCheckbox.checked = this.isDarkMode();
        }
    }

    toggleDarkMode() {
        if (this.isDarkMode()) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }

    enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        storageUtils.setItem('darkMode', true);
        const checkbox = domUtils.getElementById('darkModeCheckbox');
        if (checkbox) checkbox.checked = true;
    }

    disableDarkMode() {
        document.documentElement.removeAttribute('data-theme');
        storageUtils.setItem('darkMode', false);
        const checkbox = domUtils.getElementById('darkModeCheckbox');
        if (checkbox) checkbox.checked = false;
    }

    isDarkMode() {
        return storageUtils.getItem('darkMode') === true;
    }

    loadTheme() {
        if (this.isDarkMode()) {
            this.enableDarkMode();
        }
    }

    // ========== Notifications Panel ==========
    toggleNotificationPanel() {
        const panel = domUtils.getElementById('notificationPanel');
        domUtils.toggleClass(panel, 'active');

        if (domUtils.hasClass(panel, 'active')) {
            this.updateNotificationsList();
            notifications.markAllAsRead().then(() => this.updateNotificationBadge());
        }
    }

    updateNotificationBadge() {
        const badge = domUtils.getElementById('notificationBadge');
        if (!badge) return;
        const count = notifications.getUnreadCount();
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.style.display = count === 0 ? 'none' : '';
    }

    updateNotificationsList() {
        const list = domUtils.getElementById('notificationsList');
        const notifs = notifications.getNotifications(20);

        if (notifs.length === 0) {
            list.innerHTML = '<div class="empty-state">لا توجد إشعارات</div>';
            return;
        }

        list.innerHTML = notifs.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}">
                <div>${n.icon} ${n.title}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${n.message}</div>
                <div style="font-size: 0.75rem; color: var(--text-light);">${dateUtils.formatTime(n.timestamp)}</div>
            </div>
        `).join('');
    }

    // ========== Sidebar ==========
    toggleSidebar() {
        const sidebar = domUtils.getElementById('sidebar');
        domUtils.toggleClass(sidebar, 'collapsed');
    }

    // ========== Excel Import/Export ==========
    async handleExcelImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            notificationUtils.showToast('جاري معالجة الملف...', 'info');

            const excelImporter = new ExcelImporterManager(db, products);
            const data = await excelImporter.parseExcelFile(file);

            // Validate data
            const validation = excelImporter.validateProductData(data);
            if (validation.errors.length > 0) {
                const errorMsg = validation.errors.join('\n');
                notificationUtils.showToast('أخطاء في البيانات:\n' + errorMsg, 'danger');
                return;
            }

            if (validation.warnings.length > 0) {
                const warningMsg = validation.warnings.join('\n');
                console.warn('تحذيرات:', warningMsg);
            }

            // Import products
            const results = await excelImporter.importProducts(data);

            // Show results
            this.displayImportResults(results);
            notificationUtils.showToast(`تم استيراد ${results.success} منتج بنجاح`, 'success');

            // Reload products list
            this.loadProducts();

            // Reset file input
            event.target.value = '';
        } catch (error) {
            console.error('خطأ في الاستيراد:', error);
            notificationUtils.showToast('خطأ: ' + error.message, 'danger');
        }
    }

    displayImportResults(results) {
        const modal = domUtils.getElementById('importResultsModal');
        domUtils.getElementById('successCount').textContent = results.success;
        domUtils.getElementById('failedCount').textContent = results.failed;
        domUtils.getElementById('skippedCount').textContent = results.skipped;

        const detailsHTML = results.details.map(detail => {
            const statusClass = detail.status === 'success' ? 'success' : detail.status === 'failed' ? 'failed' : 'skipped';
            const statusIcon = detail.status === 'success' ? '✅' : detail.status === 'failed' ? '❌' : '⏭️';
            return `
                <div class="detail-item ${statusClass}">
                    ${statusIcon} الصف ${detail.row}: ${detail.message}
                    ${detail.name ? ` - ${detail.name}` : ''}
                </div>
            `;
        }).join('');

        domUtils.getElementById('importDetails').innerHTML = detailsHTML;
        modal.style.display = 'flex';
    }

    exportProductTemplate() {
        try {
            const excelImporter = new ExcelImporterManager(db, products);
            excelImporter.exportTemplate();
            notificationUtils.showToast('تم تنزيل النموذج بنجاح', 'success');
        } catch (error) {
            notificationUtils.showToast('خطأ: ' + error.message, 'danger');
        }
    }

    exportProductsToExcel() {
        try {
            const allProducts = products.getProducts();
            if (allProducts.length === 0) {
                notificationUtils.showToast('لا توجد منتجات لتصديرها', 'info');
                return;
            }
            const excelImporter = new ExcelImporterManager(db, products);
            excelImporter.exportProducts(allProducts);
            notificationUtils.showToast('تم تصدير المنتجات بنجاح', 'success');
        } catch (error) {
            notificationUtils.showToast('خطأ: ' + error.message, 'danger');
        }
    }

    // ========== AI Intelligence Dashboard ==========
    async loadAIDashboard() {
        const aiAgent = new AdvancedAIAgent(db, products, inventory, sales, branches);
        const dashboard = await aiAgent.getAIDashboard();

        // Display forecast
        this.displayForecast(dashboard.forecast);

        // Display risks
        this.displayRisks(dashboard.risks);

        // Display recommendations
        this.displayInventoryRecommendations(dashboard.inventory);
        this.displayPricingRecommendations(dashboard.pricing);
        this.displayBranchAnalysis(dashboard.branches);
        this.displayCustomerBehavior(dashboard.customer);

        notificationUtils.showToast('✅ تم تحديث لوحة الذكاء الاصطناعي', 'success');
    }

    displayForecast(forecast) {
        const content = domUtils.getElementById('aiForecaust');
        const avgForecast = forecast.forecast.length > 0
            ? (forecast.forecast.reduce((a, b) => a + b, 0) / forecast.forecast.length).toFixed(0)
            : 0;

        content.innerHTML = `
            <div class="metric">
                <span class="metric-label">المتوسط المتوقع (30 يوم):</span>
                <span class="metric-value">${numberUtils.formatCurrency(avgForecast)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">الثقة:</span>
                <span class="metric-value">${forecast.confidence}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">المتوسط اليومي:</span>
                <span class="metric-value">${numberUtils.formatCurrency(forecast.avgDaily)}</span>
            </div>
        `;
    }

    displayRisks(risks) {
        const content = domUtils.getElementById('aiRisks');
        if (risks.length === 0) {
            content.innerHTML = '<p style="color: var(--success); font-weight: 600;">✅ لا توجد مخاطر</p>';
            return;
        }

        content.innerHTML = risks.slice(0, 3).map(risk => `
            <div class="ai-recommendation ${risk.level}">
                <div class="recommendation-title">${risk.type}: ${risk.title}</div>
                <div class="recommendation-desc">${risk.description}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">
                    💡 ${risk.action}
                </div>
            </div>
        `).join('');
    }

    displayInventoryRecommendations(inventory) {
        const content = domUtils.getElementById('aiInventory');
        if (inventory.length === 0) {
            content.innerHTML = '<p>لا توجد توصيات</p>';
            return;
        }

        content.innerHTML = inventory.slice(0, 3).map(rec => `
            <div class="ai-recommendation ${rec.priority}">
                <div class="recommendation-title">${rec.action}</div>
                <div class="recommendation-desc">${rec.reason}</div>
                <div style="font-size: 0.8rem; margin-top: 5px;">📊 ${rec.expectedImpact}</div>
            </div>
        `).join('');
    }

    displayPricingRecommendations(pricing) {
        const content = domUtils.getElementById('aiPricing');
        if (pricing.length === 0) {
            content.innerHTML = '<p>الأسعار محسّنة</p>';
            return;
        }

        content.innerHTML = pricing.slice(0, 3).map(rec => `
            <div class="ai-recommendation">
                <div class="recommendation-title">${rec.productName}</div>
                <div class="metric" style="border: none; padding: 5px 0;">
                    <span>السعر الحالي:</span>
                    <span>${numberUtils.formatCurrency(rec.currentPrice)}</span>
                </div>
                <div class="metric" style="border: none; padding: 5px 0;">
                    <span>السعر المقترح:</span>
                    <span style="color: var(--success);">${numberUtils.formatCurrency(rec.suggestedPrice)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">💡 ${rec.reason}</div>
            </div>
        `).join('');
    }

    displayBranchAnalysis(branches) {
        const content = domUtils.getElementById('aiBranches');
        content.innerHTML = branches.slice(0, 3).map(branch => `
            <div class="ai-recommendation" style="border-left-color: var(--info);">
                <div class="recommendation-title">${branch.branchName}</div>
                <div class="metric" style="border: none; padding: 3px 0; font-size: 0.9rem;">
                    <span>الإيراد:</span>
                    <span>${numberUtils.formatCurrency(branch.totalRevenue)}</span>
                </div>
                <div class="metric" style="border: none; padding: 3px 0; font-size: 0.9rem;">
                    <span>الربح:</span>
                    <span style="color: ${branch.monthlyProfit > 0 ? 'var(--success)' : 'var(--danger)'}">${numberUtils.formatCurrency(branch.monthlyProfit)}</span>
                </div>
                <div style="font-size: 0.8rem; margin-top: 5px;">📊 ${branch.recommendation}</div>
            </div>
        `).join('');
    }

    displayCustomerBehavior(customer) {
        const content = domUtils.getElementById('aiCustomer');
        content.innerHTML = `
            <div class="metric">
                <span class="metric-label">عدد العملاء:</span>
                <span class="metric-value">${customer.totalCustomers}</span>
            </div>
            <div class="metric">
                <span class="metric-label">متوسط المبلغ:</span>
                <span class="metric-value">${numberUtils.formatCurrency(customer.avgTransactionValue)}</span>
            </div>
            <div style="margin-top: var(--spacing-4); border-top: 1px solid var(--border-color); padding-top: var(--spacing-3);">
                <div style="font-weight: 600; margin-bottom: var(--spacing-2);">🏆 المنتجات الأكثر مبيعاً:</div>
                ${customer.mostPopularProducts.map(p => `
                    <div style="padding: 5px 0; font-size: 0.9rem;">
                        ${p.name}: <span style="color: var(--primary);">${p.count} وحدة</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize App
const app = new PointMarketApp();
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});
