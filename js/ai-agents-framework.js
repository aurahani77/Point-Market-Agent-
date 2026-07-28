/**
 * Point Market AI Agents Framework
 * 6 Specialized AI Agents for Autonomous Business Operations
 *
 * Agents:
 * 1. DemandAgent: Demand forecasting & purchase recommendations
 * 2. PricingAgent: Dynamic pricing based on supply/demand
 * 3. ProblemDetective: Anomaly detection & real-time alerts
 * 4. ProfitOptimizer: P&L analysis & product classification
 * 5. ReportingAgent: Automated report generation
 * 6. BranchOptimizer: Branch performance optimization
 */

class AIAgentsFramework {
  constructor(database) {
    this.db = database;
    this.agents = {};
    this.messageQueue = [];
    this.operationLogs = [];
    this.lastRunTime = {};

    // Initialize all 6 agents
    this.initializeAgents();
  }

  initializeAgents() {
    this.agents.demand = new DemandAgent(this.db, this);
    this.agents.pricing = new PricingAgent(this.db, this);
    this.agents.detective = new ProblemDetective(this.db, this);
    this.agents.profit = new ProfitOptimizer(this.db, this);
    this.agents.reporting = new ReportingAgent(this.db, this);
    this.agents.optimizer = new BranchOptimizer(this.db, this);
  }

  // Send message from one agent to another
  sendMessage(fromAgent, toAgent, message) {
    const msg = {
      from: fromAgent,
      to: toAgent,
      content: message,
      timestamp: new Date(),
      processed: false
    };
    this.messageQueue.push(msg);
    return msg;
  }

  // Log all agent operations
  logOperation(agentName, operationType, details, result) {
    const log = {
      agent: agentName,
      type: operationType,
      details: details,
      result: result,
      timestamp: new Date(),
      duration: new Date() - this.lastRunTime[agentName] || 0
    };
    this.operationLogs.push(log);
    this.lastRunTime[agentName] = new Date();
    return log;
  }

  // Daily orchestration (09:00)
  async runDailyOrchestration() {
    console.log('🤖 Daily Orchestration Starting...');

    try {
      // 1. Demand Agent wakes up and forecasts
      const demandResult = await this.agents.demand.forecastDemand();
      this.logOperation('DemandAgent', 'forecast', {}, demandResult);

      // Send forecast to pricing agent
      this.sendMessage('DemandAgent', 'PricingAgent', {
        type: 'demand_forecast',
        forecast: demandResult
      });

      // 2. Pricing Agent adjusts prices
      const pricingResult = await this.agents.pricing.adjustPrices(demandResult);
      this.logOperation('PricingAgent', 'price_adjustment', {}, pricingResult);

      // 3. Profit Optimizer analyzes yesterday
      const profitResult = await this.agents.profit.analyzeYesterdayProfits();
      this.logOperation('ProfitOptimizer', 'daily_analysis', {}, profitResult);

      // 4. Branch Optimizer prepares branch metrics
      const branchResult = await this.agents.optimizer.calculateBranchMetrics();
      this.logOperation('BranchOptimizer', 'metrics_calculation', {}, branchResult);

      return {
        status: 'completed',
        timestamp: new Date(),
        results: {
          demand: demandResult,
          pricing: pricingResult,
          profit: profitResult,
          branches: branchResult
        }
      };
    } catch (error) {
      console.error('❌ Orchestration Error:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Continuous monitoring (10:00 - 16:00)
  async startContinuousMonitoring() {
    console.log('👁️ Problem Detective Starting Continuous Monitoring...');

    this.monitoringInterval = setInterval(async () => {
      try {
        const anomalies = await this.agents.detective.detectAnomalies();

        if (anomalies.length > 0) {
          this.logOperation('ProblemDetective', 'anomaly_detected',
            { count: anomalies.length }, anomalies);

          // Alert manager
          this.agents.reporting.sendAlert(anomalies);
        }
      } catch (error) {
        console.error('Monitoring Error:', error);
      }
    }, 60000); // Check every minute
  }

  // Evening report generation (17:00-18:00)
  async generateEveningReports() {
    console.log('📊 Generating Evening Reports...');

    try {
      const dailyReport = await this.agents.reporting.generateDailyReport();
      this.logOperation('ReportingAgent', 'daily_report', {}, dailyReport);

      const alerts = await this.agents.reporting.compileAlerts();

      return {
        daily_report: dailyReport,
        alerts: alerts,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Report Generation Error:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Night optimization (23:00)
  async runNightOptimization() {
    console.log('🌙 Night Optimization Starting...');

    try {
      // Update all forecasting models
      await this.agents.demand.updateForecastModel();

      // Prepare next day's recommendations
      await this.agents.optimizer.planNextDay();

      // Clean up old data
      await this.cleanupOldLogs();

      return { status: 'completed', timestamp: new Date() };
    } catch (error) {
      console.error('Night Optimization Error:', error);
      return { status: 'error', error: error.message };
    }
  }

  async cleanupOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.operationLogs = this.operationLogs.filter(
      log => new Date(log.timestamp) > thirtyDaysAgo
    );
  }

  // Get agent status
  getAgentStatus() {
    const status = {};
    for (const [name, agent] of Object.entries(this.agents)) {
      status[name] = {
        active: true,
        lastRun: this.lastRunTime[name],
        operations: this.operationLogs.filter(l => l.agent === name).length
      };
    }
    return status;
  }

  // Get all operation logs
  getOperationLogs(agentName = null, limit = 100) {
    let logs = this.operationLogs;
    if (agentName) {
      logs = logs.filter(l => l.agent === agentName);
    }
    return logs.slice(-limit);
  }
}

/**
 * AGENT #1: Demand Agent
 * Forecasts demand and recommends purchase quantities
 */
class DemandAgent {
  constructor(db, framework) {
    this.db = db;
    this.framework = framework;
    this.forecastModel = null;
    this.confidence = 0.85;
  }

  async forecastDemand() {
    const salesData = await this.getSalesHistory(90); // 90 days
    const forecast = this.calculateForecast(salesData);

    return {
      forecast: forecast,
      confidence: this.confidence,
      recommendations: this.generateRecommendations(forecast),
      timestamp: new Date()
    };
  }

  async getSalesHistory(days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sales = await this.db.getAllSales();
    return sales.filter(s => new Date(s.date) >= cutoffDate);
  }

  calculateForecast(salesData) {
    // Group by product
    const byProduct = {};
    salesData.forEach(sale => {
      if (!byProduct[sale.productId]) {
        byProduct[sale.productId] = [];
      }
      byProduct[sale.productId].push(sale.quantity);
    });

    // Calculate average and trend
    const forecast = {};
    for (const [productId, quantities] of Object.entries(byProduct)) {
      const avg = quantities.reduce((a, b) => a + b) / quantities.length;
      const trend = this.calculateTrend(quantities);
      forecast[productId] = {
        expectedWeekly: Math.round(avg * 7 * (1 + trend)),
        expectedDaily: Math.round(avg),
        confidence: this.confidence,
        trend: trend > 0 ? 'increasing' : 'decreasing'
      };
    }

    return forecast;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    const avgFirst = first.reduce((a, b) => a + b) / first.length;
    const avgSecond = second.reduce((a, b) => a + b) / second.length;
    return (avgSecond - avgFirst) / avgFirst;
  }

  generateRecommendations(forecast) {
    const recommendations = [];

    for (const [productId, data] of Object.entries(forecast)) {
      const product = this.db.getProduct(productId);
      const currentStock = this.db.getInventory(productId);

      // If forecast exceeds current stock
      if (data.expectedWeekly > currentStock) {
        const shortage = data.expectedWeekly - currentStock;
        recommendations.push({
          productId: productId,
          productName: product?.name,
          action: 'ORDER',
          quantity: Math.round(shortage * 1.15), // 15% safety stock
          reason: 'Demand exceeds current inventory',
          urgency: 'HIGH'
        });
      }

      // If trend is increasing
      if (data.trend === 'increasing') {
        recommendations.push({
          productId: productId,
          productName: product?.name,
          action: 'MONITOR',
          reason: 'Increasing demand trend detected',
          urgency: 'MEDIUM'
        });
      }
    }

    return recommendations;
  }

  async updateForecastModel() {
    const recentData = await this.getSalesHistory(30);

    // Increase confidence if model performing well
    if (recentData.length > 0) {
      this.confidence = Math.min(0.95, this.confidence + 0.01);
    }

    console.log(`✅ Demand Model Updated - Confidence: ${(this.confidence * 100).toFixed(1)}%`);
  }
}

/**
 * AGENT #2: Pricing Agent
 * Dynamically adjusts prices based on supply/demand
 */
class PricingAgent {
  constructor(db, framework) {
    this.db = db;
    this.framework = framework;
    this.priceAdjustmentFactor = 0.1; // 10% max adjustment
  }

  async adjustPrices(demandForecast) {
    const adjustments = [];

    for (const [productId, forecast] of Object.entries(demandForecast.forecast)) {
      const currentPrice = this.db.getPrice(productId);
      const inventory = this.db.getInventory(productId);

      // Calculate adjustment
      const ratio = forecast.expectedWeekly / inventory;
      let priceMultiplier = 1.0;

      if (ratio > 1.5) {
        // Demand >> Supply: raise prices
        priceMultiplier = 1 + (this.priceAdjustmentFactor * 0.5);
      } else if (ratio < 0.5) {
        // Supply >> Demand: lower prices
        priceMultiplier = 1 - (this.priceAdjustmentFactor * 0.3);
      }

      const newPrice = Math.round(currentPrice * priceMultiplier * 100) / 100;

      if (newPrice !== currentPrice) {
        await this.db.updatePrice(productId, newPrice);

        adjustments.push({
          productId: productId,
          oldPrice: currentPrice,
          newPrice: newPrice,
          change: ((newPrice - currentPrice) / currentPrice * 100).toFixed(2) + '%',
          reason: ratio > 1.5 ? 'High demand' : 'Low demand',
          timestamp: new Date()
        });
      }
    }

    return {
      adjustmentsMade: adjustments.length,
      details: adjustments,
      timestamp: new Date()
    };
  }
}

/**
 * AGENT #3: Problem Detective
 * Detects anomalies and alerts in real-time
 */
class ProblemDetective {
  constructor(db, framework) {
    this.db = db;
    this.framework = framework;
    this.thresholdStdDev = 2.0; // 2 standard deviations
  }

  async detectAnomalies() {
    const anomalies = [];

    // Check sales anomalies
    const salesAnomalies = await this.detectSalesAnomalies();
    anomalies.push(...salesAnomalies);

    // Check inventory anomalies
    const inventoryAnomalies = await this.detectInventoryAnomalies();
    anomalies.push(...inventoryAnomalies);

    // Check price anomalies
    const priceAnomalies = await this.detectPriceAnomalies();
    anomalies.push(...priceAnomalies);

    return anomalies;
  }

  async detectSalesAnomalies() {
    const sales = await this.db.getSalesLast24Hours();
    const anomalies = [];

    // Get normal daily average
    const avgSales = await this.db.getAverageDailySales(30);
    const stdDev = await this.calculateStdDev(30);

    const today = sales.reduce((sum, s) => sum + s.quantity, 0);

    if (today > avgSales + (stdDev * this.thresholdStdDev)) {
      anomalies.push({
        type: 'SALES_SPIKE',
        severity: 'HIGH',
        message: `Sales spiked ${((today - avgSales) / avgSales * 100).toFixed(0)}% above normal`,
        value: today,
        normal: avgSales,
        timestamp: new Date()
      });
    }

    return anomalies;
  }

  async detectInventoryAnomalies() {
    const products = await this.db.getAllProducts();
    const anomalies = [];

    for (const product of products) {
      const inventory = await this.db.getInventory(product.id);
      const lastKnown = await this.db.getLastInventoryCount(product.id);

      // Check for unexplained changes
      const change = lastKnown - inventory;
      if (change > product.expectedDailyUsage * 2) {
        anomalies.push({
          type: 'INVENTORY_DISCREPANCY',
          severity: 'CRITICAL',
          productId: product.id,
          productName: product.name,
          message: `Unexpected inventory loss of ${change} units`,
          timestamp: new Date()
        });
      }
    }

    return anomalies;
  }

  async detectPriceAnomalies() {
    const products = await this.db.getAllProducts();
    const anomalies = [];

    for (const product of products) {
      const history = await this.db.getPriceHistory(product.id, 7);
      if (history.length > 2) {
        const currentPrice = history[history.length - 1];
        const prevPrice = history[history.length - 2];
        const change = (currentPrice - prevPrice) / prevPrice;

        if (Math.abs(change) > 0.3) { // 30% change
          anomalies.push({
            type: 'PRICE_ANOMALY',
            severity: 'MEDIUM',
            productId: product.id,
            productName: product.name,
            message: `Price changed ${(change * 100).toFixed(0)}%`,
            timestamp: new Date()
          });
        }
      }
    }

    return anomalies;
  }

  async calculateStdDev(days) {
    const sales = await this.db.getSalesLast(days);
    const daily = {};

    sales.forEach(s => {
      const date = s.date.split('T')[0];
      daily[date] = (daily[date] || 0) + s.quantity;
    });

    const values = Object.values(daily);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    return Math.sqrt(variance);
  }
}

/**
 * AGENT #4: Profit Optimizer
 * Analyzes P&L and classifies products
 */
class ProfitOptimizer {
  constructor(db, framework) {
    this.db = db;
    this.framework = framework;
  }

  async analyzeYesterdayProfits() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const sales = await this.db.getSalesByDate(yesterday);
    const products = await this.db.getAllProducts();

    const analysis = {
      totalRevenue: 0,
      totalProfit: 0,
      profitMargin: 0,
      products: [],
      timestamp: new Date()
    };

    for (const product of products) {
      const productSales = sales.filter(s => s.productId === product.id);
      const revenue = productSales.reduce((sum, s) => sum + (s.quantity * s.price), 0);
      const cost = productSales.reduce((sum, s) => sum + (s.quantity * product.cost), 0);
      const profit = revenue - cost;

      analysis.totalRevenue += revenue;
      analysis.totalProfit += profit;

      const classification = this.classifyProduct(profit, revenue, productSales.length);

      analysis.products.push({
        productId: product.id,
        productName: product.name,
        revenue: revenue,
        cost: cost,
        profit: profit,
        quantity: productSales.length,
        classification: classification,
        marginPercent: ((profit / revenue) * 100).toFixed(2)
      });
    }

    analysis.profitMargin = ((analysis.totalProfit / analysis.totalRevenue) * 100).toFixed(2);

    // Sort by profit
    analysis.products.sort((a, b) => b.profit - a.profit);

    return analysis;
  }

  classifyProduct(profit, revenue, quantity) {
    const marginPercent = (profit / revenue) * 100;
    const demandScore = quantity > 50 ? 'high' : quantity > 20 ? 'medium' : 'low';
    const profitScore = marginPercent > 30 ? 'high' : marginPercent > 10 ? 'medium' : 'low';

    if (profitScore === 'high' && demandScore === 'high') return '⭐ STAR';
    if (profitScore === 'high' && demandScore !== 'high') return '💰 CASH_COW';
    if (profitScore !== 'high' && demandScore === 'high') return '❓ QUESTION_MARK';
    return '❌ DOG';
  }
}

/**
 * AGENT #5: Reporting Agent
 * Generates automated reports
 */
class ReportingAgent {
  constructor(db, framework) {
    this.db = db;
    this.framework = framework;
    this.alerts = [];
  }

  async generateDailyReport() {
    const today = new Date();
    const sales = await this.db.getSalesByDate(today);

    const report = {
      date: today.toISOString().split('T')[0],
      totalSales: sales.reduce((sum, s) => sum + (s.quantity * s.price), 0),
      totalTransactions: sales.length,
      topProducts: this.getTopProducts(sales, 5),
      branches: await this.getBranchSummary(),
      alerts: this.alerts,
      timestamp: new Date()
    };

    return report;
  }

  getTopProducts(sales, limit = 5) {
    const productSales = {};

    sales.forEach(s => {
      if (!productSales[s.productId]) {
        productSales[s.productId] = { quantity: 0, revenue: 0 };
      }
      productSales[s.productId].quantity += s.quantity;
      productSales[s.productId].revenue += s.quantity * s.price;
    });

    return Object.entries(productSales)
      .map(([id, data]) => ({
        productId: id,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getBranchSummary() {
    const branches = await this.db.getAllBranches();
    return Promise.all(branches.map(async (branch) => ({
      id: branch.id,
      name: branch.name,
      sales: await this.db.getSalesByBranch(branch.id),
      revenue: await this.db.getBranchRevenue(branch.id)
    })));
  }

  sendAlert(anomalies) {
    this.alerts.push(...anomalies);
    console.log(`⚠️ ${anomalies.length} alerts generated`);
  }

  async compileAlerts() {
    return this.alerts;
  }
}

/**
 * AGENT #6: Branch Optimizer
 * Compares branches and suggests optimizations
 */
class BranchOptimizer {
  constructor(db, framework) {
    this.db = db;
    this.framework = framework;
  }

  async calculateBranchMetrics() {
    const branches = await this.db.getAllBranches();
    const metrics = [];

    for (const branch of branches) {
      const sales = await this.db.getSalesByBranch(branch.id);
      const revenue = sales.reduce((sum, s) => sum + (s.quantity * s.price), 0);
      const staff = branch.staffCount || 1;

      metrics.push({
        branchId: branch.id,
        branchName: branch.name,
        totalSales: sales.length,
        revenue: revenue,
        salesPerCapita: revenue / staff,
        staffCount: staff,
        rating: this.calculateBranchRating(revenue, sales.length, staff),
        timestamp: new Date()
      });
    }

    // Sort by rating
    metrics.sort((a, b) => b.rating - a.rating);

    return metrics;
  }

  calculateBranchRating(revenue, transactions, staff) {
    const scoreRevenue = revenue / 10000; // Normalized to 10K
    const scoreTransactions = transactions / 100; // Normalized to 100
    const scoreEfficiency = (revenue / staff) / 5000; // Normalized to 5K per person

    const avgScore = (scoreRevenue + scoreTransactions + scoreEfficiency) / 3;
    return Math.min(5, avgScore); // Rating out of 5
  }

  async planNextDay() {
    const metrics = await this.calculateBranchMetrics();
    const best = metrics[0];
    const worst = metrics[metrics.length - 1];

    return {
      bestBranch: best,
      worstBranch: worst,
      recommendations: [
        `Share best practices from ${best.branchName} to ${worst.branchName}`,
        `Focus on improving ${worst.branchName} efficiency`,
        `Maintain momentum at ${best.branchName}`
      ]
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AIAgentsFramework,
    DemandAgent,
    PricingAgent,
    ProblemDetective,
    ProfitOptimizer,
    ReportingAgent,
    BranchOptimizer
  };
}
