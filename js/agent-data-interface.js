/**
 * Agent Data Interface
 * Manages data flow between Point Market system and AI Agents
 *
 * Handles:
 * - Real-time data updates from sales transactions
 * - Agent configuration and parameters
 * - Agent operation history and metrics
 * - Agent-to-agent communication
 * - External data input (weather, holidays, events)
 */

class AgentDataInterface {
  constructor(database) {
    this.db = database;
    this.agentConfig = this.loadAgentConfig();
    this.externalData = {};
    this.operationMetrics = {};
  }

  loadAgentConfig() {
    return {
      demand: {
        enabled: true,
        forecastAccuracy: 0.85,
        lookbackDays: 90,
        updateFrequency: 'daily',
        considerSeasons: true,
        seasonalFactors: {
          ramadan: 1.5,
          summer: 0.9,
          winter: 1.1,
          eid: 2.0,
          backToSchool: 1.8,
          newYear: 1.3
        }
      },
      pricing: {
        enabled: true,
        maxAdjustmentPercent: 10,
        minMarginPercent: 15,
        dynamicPricingEnabled: true,
        elasticityFactor: 0.5,
        updateFrequency: 'daily'
      },
      detective: {
        enabled: true,
        anomalyThreshold: 2.0, // Standard deviations
        monitoringInterval: 60000, // 1 minute
        alertSeverityLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        autoAlertManager: true
      },
      profit: {
        enabled: true,
        analysisFrequency: 'daily',
        breakEvenThreshold: 10, // Percent margin
        productClassification: {
          star: { profitMin: 0.3, demandMin: 'high' },
          cashCow: { profitMin: 0.3, demandMax: 'medium' },
          questionMark: { profitMax: 0.3, demandMin: 'high' },
          dog: { profitMax: 0.3, demandMax: 'medium' }
        }
      },
      reporting: {
        enabled: true,
        reportTypes: ['daily', 'weekly', 'monthly'],
        sendTime: { daily: '17:00', weekly: '17:00 Friday', monthly: '17:00 last day' },
        recipients: ['manager@pointmarket.com'],
        autoSendAlerts: true
      },
      optimizer: {
        enabled: true,
        comparisonMetrics: ['sales', 'profit', 'efficiency', 'satisfaction'],
        benchmarkingEnabled: true,
        suggestionsEnabled: true
      }
    };
  }

  // Register a new sale in real-time
  async registerSale(sale) {
    const enrichedSale = {
      ...sale,
      timestamp: new Date(),
      registeredByAgent: 'System'
    };

    // Store in database
    await this.db.recordSale(enrichedSale);

    // Notify problem detective for real-time monitoring
    if (this.agentConfig.detective.enabled) {
      await this.notifyAnomalyDetection(enrichedSale);
    }

    // Update running metrics
    this.updateOperationMetrics('sales', enrichedSale);

    return enrichedSale;
  }

  // Register inventory change
  async registerInventoryChange(productId, branchId, change, reason) {
    const transaction = {
      productId,
      branchId,
      change,
      reason,
      timestamp: new Date(),
      balanceBefore: await this.db.getInventory(productId, branchId),
      balanceAfter: await this.db.getInventory(productId, branchId) + change
    };

    await this.db.recordInventoryTransaction(transaction);

    // Check for anomalies
    if (Math.abs(change) > this.agentConfig.detective.anomalyThreshold) {
      await this.alertAnomalyDetected({
        type: 'INVENTORY_CHANGE',
        severity: 'MEDIUM',
        details: transaction
      });
    }

    return transaction;
  }

  // Register price change
  async registerPriceChange(productId, oldPrice, newPrice, reason) {
    const change = {
      productId,
      oldPrice,
      newPrice,
      changePercent: ((newPrice - oldPrice) / oldPrice) * 100,
      reason,
      timestamp: new Date()
    };

    await this.db.recordPriceChange(change);

    // Check for anomalies
    if (Math.abs(change.changePercent) > 30) {
      await this.alertAnomalyDetected({
        type: 'PRICE_ANOMALY',
        severity: 'HIGH',
        details: change
      });
    }

    return change;
  }

  // Get data for Demand Agent
  async getDemandAgentData() {
    return {
      historicalSales: await this.db.getSalesLast(this.agentConfig.demand.lookbackDays),
      currentInventory: await this.db.getAllInventory(),
      products: await this.db.getAllProducts(),
      branches: await this.db.getAllBranches(),
      externalFactors: this.getExternalFactors(),
      config: this.agentConfig.demand
    };
  }

  // Get data for Pricing Agent
  async getPricingAgentData() {
    return {
      currentPrices: await this.db.getAllPrices(),
      inventory: await this.db.getAllInventory(),
      sales: await this.db.getSalesLast(7), // Last 7 days
      demands: await this.getDemandAgentData(),
      config: this.agentConfig.pricing
    };
  }

  // Get data for Problem Detective
  async getProblemDetectiveData() {
    return {
      recentSales: await this.db.getSalesLast24Hours(),
      inventory: await this.db.getAllInventory(),
      prices: await this.db.getAllPrices(),
      alerts: await this.db.getAlerts(24), // Last 24 hours
      anomalies: await this.db.getAnomalies(24),
      config: this.agentConfig.detective
    };
  }

  // Get data for Profit Optimizer
  async getProfitOptimizerData() {
    return {
      sales: await this.db.getSalesLast(30),
      products: await this.db.getAllProducts(),
      prices: await this.db.getAllPrices(),
      config: this.agentConfig.profit
    };
  }

  // Get data for Reporting Agent
  async getReportingAgentData() {
    return {
      today: {
        sales: await this.db.getSalesByDate(new Date()),
        branches: await this.db.getAllBranches()
      },
      week: {
        sales: await this.db.getSalesLast(7)
      },
      month: {
        sales: await this.db.getSalesLast(30)
      },
      alerts: this.operationMetrics.alerts || [],
      config: this.agentConfig.reporting
    };
  }

  // Get data for Branch Optimizer
  async getBranchOptimizerData() {
    const branches = await this.db.getAllBranches();
    const metricsPerBranch = {};

    for (const branch of branches) {
      metricsPerBranch[branch.id] = {
        branch: branch,
        sales: await this.db.getSalesByBranch(branch.id),
        inventory: await this.db.getInventoryByBranch(branch.id),
        staff: branch.staffCount,
        revenue: await this.db.getBranchRevenue(branch.id)
      };
    }

    return {
      branches: metricsPerBranch,
      config: this.agentConfig.optimizer
    };
  }

  // External data (weather, holidays, events)
  setExternalFactors(factors) {
    this.externalData = {
      ...this.externalData,
      ...factors,
      timestamp: new Date()
    };

    return this.externalData;
  }

  getExternalFactors() {
    return this.externalData;
  }

  // Set external data for special events
  setSpecialEvent(eventName, impact, duration) {
    if (!this.externalData.events) {
      this.externalData.events = [];
    }

    this.externalData.events.push({
      name: eventName,
      impact: impact, // e.g., 1.5 = 50% increase in demand
      duration: duration, // days
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
    });

    return this.externalData.events;
  }

  // Set weather data
  setWeather(temperature, condition, humidity) {
    this.externalData.weather = {
      temperature,
      condition, // 'sunny', 'rainy', 'cloudy', 'hot', 'cold'
      humidity,
      timestamp: new Date()
    };

    return this.externalData.weather;
  }

  // Real-time anomaly detection notification
  async notifyAnomalyDetection(data) {
    // This would trigger the Problem Detective to check for anomalies
    const message = {
      type: 'ANOMALY_CHECK_TRIGGER',
      data: data,
      timestamp: new Date()
    };

    await this.db.addToMessageQueue('detective', message);
  }

  // Alert manager about anomalies
  async alertAnomalyDetected(alert) {
    alert.alertId = this.generateAlertId();
    alert.status = 'unread';

    await this.db.saveAlert(alert);

    // Log for reporting agent
    if (!this.operationMetrics.alerts) {
      this.operationMetrics.alerts = [];
    }
    this.operationMetrics.alerts.push(alert);

    return alert;
  }

  // Update operational metrics
  updateOperationMetrics(metric, data) {
    if (!this.operationMetrics[metric]) {
      this.operationMetrics[metric] = [];
    }

    this.operationMetrics[metric].push({
      ...data,
      timestamp: new Date()
    });

    // Keep only last 1000 records per metric
    if (this.operationMetrics[metric].length > 1000) {
      this.operationMetrics[metric] = this.operationMetrics[metric].slice(-1000);
    }
  }

  getOperationMetrics(metric, limit = 100) {
    if (!this.operationMetrics[metric]) {
      return [];
    }
    return this.operationMetrics[metric].slice(-limit);
  }

  // Generate unique alert ID
  generateAlertId() {
    return `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save agent decision/recommendation
  async saveAgentDecision(agentName, decisionType, details, result) {
    const decision = {
      agentName,
      decisionType,
      details,
      result,
      timestamp: new Date(),
      status: 'executed'
    };

    await this.db.saveAgentDecision(decision);
    this.updateOperationMetrics('decisions', decision);

    return decision;
  }

  // Get agent performance metrics
  async getAgentPerformanceMetrics(agentName, days = 30) {
    const decisions = await this.db.getAgentDecisions(agentName, days);

    return {
      agentName,
      totalDecisions: decisions.length,
      successRate: this.calculateSuccessRate(decisions),
      averageImpact: this.calculateAverageImpact(decisions),
      lastExecution: decisions[decisions.length - 1]?.timestamp,
      trend: this.calculateTrend(decisions)
    };
  }

  calculateSuccessRate(decisions) {
    const successful = decisions.filter(d => d.status === 'executed' && d.result?.success).length;
    return ((successful / decisions.length) * 100).toFixed(2) + '%';
  }

  calculateAverageImpact(decisions) {
    const impacts = decisions
      .filter(d => d.result?.impact)
      .map(d => d.result.impact);

    if (impacts.length === 0) return 0;
    return (impacts.reduce((a, b) => a + b) / impacts.length).toFixed(2);
  }

  calculateTrend(decisions) {
    if (decisions.length < 2) return 'neutral';

    const recent = decisions.slice(-Math.ceil(decisions.length / 2));
    const older = decisions.slice(0, Math.ceil(decisions.length / 2));

    const recentSuccess = this.getSuccessCount(recent) / recent.length;
    const olderSuccess = this.getSuccessCount(older) / older.length;

    if (recentSuccess > olderSuccess) return 'improving';
    if (recentSuccess < olderSuccess) return 'declining';
    return 'stable';
  }

  getSuccessCount(decisions) {
    return decisions.filter(d => d.status === 'executed' && d.result?.success).length;
  }

  // Synchronize with external systems (Zoho)
  async syncWithZoho(data) {
    // This would integrate with Zoho API
    const syncRecord = {
      timestamp: new Date(),
      dataType: data.type,
      recordCount: data.records?.length || 0,
      status: 'synced',
      externalSystem: 'zoho'
    };

    await this.db.saveSyncRecord(syncRecord);
    return syncRecord;
  }

  // Export agent data for analytics
  async exportAgentAnalytics(agentName, format = 'json') {
    const decisions = await this.db.getAgentDecisions(agentName, 30);
    const metrics = await this.getAgentPerformanceMetrics(agentName);

    const analytics = {
      agent: agentName,
      metrics: metrics,
      decisions: decisions,
      exportDate: new Date(),
      format: format
    };

    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }

    return analytics;
  }

  convertToCSV(analytics) {
    let csv = 'Agent,Total Decisions,Success Rate,Average Impact,Trend\n';
    csv += `${analytics.metrics.agentName},${analytics.metrics.totalDecisions},${analytics.metrics.successRate},${analytics.metrics.averageImpact},${analytics.metrics.trend}`;
    return csv;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentDataInterface;
}
