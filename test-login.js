const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🧪 Opening login page...\n');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Capture all console messages
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Capture errors
    page.on('pageerror', error => {
        console.error('\n❌ PAGE ERROR:', error.message);
        console.error(error.stack);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
        console.error(`❌ REQUEST FAILED: ${request.url()}`);
    });

    try {
        const filePath = `file://${path.join(__dirname, 'index.html')}`;
        console.log(`📄 Loading: ${filePath}\n`);

        const response = await page.goto(filePath, { waitUntil: 'networkidle' });
        console.log(`✅ Page loaded with status: ${response.status()}\n`);

        // Check DOM elements
        console.log('🔍 Checking DOM elements:');
        const loginForm = await page.$('#loginForm');
        const usernameInput = await page.$('#username');
        const passwordInput = await page.$('#password');
        const userTypeSelect = await page.$('#userType');
        const loginBtn = await page.$('button[type="submit"]');

        console.log(`  - loginForm exists: ${!!loginForm}`);
        console.log(`  - username input exists: ${!!usernameInput}`);
        console.log(`  - password input exists: ${!!passwordInput}`);
        console.log(`  - userType select exists: ${!!userTypeSelect}`);
        console.log(`  - submit button exists: ${!!loginBtn}`);

        // Check if app is initialized
        console.log('\n🔍 Checking app state:');
        const appExists = await page.$('#app');
        const loginPageVisible = await page.$eval('#loginPage', el => el.style.display !== 'none');

        console.log(`  - app container exists: ${!!appExists}`);
        console.log(`  - login page visible: ${loginPageVisible}`);

        // Check window variables
        console.log('\n🔍 Checking window variables:');
        const windowVars = await page.evaluate(() => ({
            auth: typeof auth,
            domUtils: typeof domUtils,
            app: typeof app,
            db: typeof db,
            Chart: typeof Chart,
            XLSX: typeof XLSX,
            L: typeof L
        }));

        console.log(`  - auth: ${windowVars.auth}`);
        console.log(`  - domUtils: ${windowVars.domUtils}`);
        console.log(`  - app: ${windowVars.app}`);
        console.log(`  - db: ${windowVars.db}`);
        console.log(`  - Chart: ${windowVars.Chart}`);
        console.log(`  - XLSX: ${windowVars.XLSX}`);
        console.log(`  - L (Leaflet): ${windowVars.L}`);

        // Take screenshot
        await page.screenshot({ path: '/home/user/login-screenshot.png' });
        console.log('\n📸 Screenshot saved: /home/user/login-screenshot.png');

        // Test login
        console.log('\n🧪 Attempting login...');
        await usernameInput.fill('admin');
        await passwordInput.fill('123456');
        await userTypeSelect.selectOption('admin');
        await loginBtn.click();

        // Wait for navigation
        await page.waitForTimeout(2000);
        const mainAppVisible = await page.$eval('#mainApp', el => el.style.display !== 'none').catch(() => false);
        console.log(`  - Main app visible after login: ${mainAppVisible}`);

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    } finally {
        await browser.close();
        console.log('\n✅ Test complete');
    }
})();
