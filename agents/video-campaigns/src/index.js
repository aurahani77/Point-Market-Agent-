#!/usr/bin/env node

import { VideoAnalyzer } from './VideoAnalyzer.js';
import { logger, CampaignTracker, taskLogger } from './logger.js';
import { config, validateConfig, getConfigSummary } from './config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Video Editing & Campaign Automation Agent
 */
export class VideoEditingAgent {
  constructor(campaignId) {
    this.campaignId = campaignId || `campaign_${Date.now()}`;
    this.tracker = new CampaignTracker(this.campaignId);
    this.analyzer = new VideoAnalyzer();

    logger.info({ campaignId: this.campaignId, config: getConfigSummary() }, '🤖 Agent initialized');
  }

  /**
   * Run full pipeline: analyze → edit → version → publish
   */
  async runFullPipeline(inputDir, autoPublish = true) {
    taskLogger.start('full_pipeline', { inputDir });

    try {
      // Phase 1: Analyze videos
      logger.info({}, '📊 Phase 1: Video Analysis');
      const videos = await this.analyzer.analyzeDirectory(inputDir);

      if (videos.length === 0) {
        throw new Error('No videos found in directory');
      }

      // Phase 2: Select top videos
      logger.info({}, '🎯 Phase 2: Video Selection');
      const topVideos = this.analyzer.selectTopVideos(config.agent.videosToSelect);

      if (topVideos.length === 0) {
        throw new Error('No videos passed quality threshold');
      }

      // Export analysis
      const analysisPath = path.resolve(config.paths.output, `${this.campaignId}_analysis.json`);
      this.analyzer.exportAnalysis(analysisPath);

      // TODO: Phase 3: Edit videos
      logger.info({ count: topVideos.length }, '✂️  Phase 3: Video Editing');

      // TODO: Phase 4: Create versions
      logger.info({ versionsPerVideo: config.agent.versionsPerVideo }, '🎬 Phase 4: Version Generation');

      // TODO: Phase 5: Publish
      if (autoPublish && config.agent.autoPublish) {
        logger.info({}, '📤 Phase 5: Publishing');
      }

      taskLogger.complete('full_pipeline', this.tracker.toJSON());

      return {
        status: 'success',
        campaignId: this.campaignId,
        videosAnalyzed: videos.length,
        videosSelected: topVideos.length,
        analysisFile: analysisPath,
      };
    } catch (error) {
      taskLogger.failed('full_pipeline', error);
      this.tracker.addError('full_pipeline', error);
      throw error;
    }
  }

  /**
   * Run analysis only
   */
  async runAnalysisOnly(inputDir) {
    taskLogger.start('analysis_only', { inputDir });

    try {
      const videos = await this.analyzer.analyzeDirectory(inputDir);
      const topVideos = this.analyzer.selectTopVideos(config.agent.videosToSelect);

      const analysisPath = path.resolve(config.paths.output, `${this.campaignId}_analysis.json`);
      this.analyzer.exportAnalysis(analysisPath);

      const report = this.analyzer.getAnalysisReport();

      taskLogger.complete('analysis_only', report);

      return {
        status: 'success',
        phase: 'analysis',
        videosAnalyzed: videos.length,
        videosSelected: topVideos.length,
        report,
        analysisFile: analysisPath,
      };
    } catch (error) {
      taskLogger.failed('analysis_only', error);
      throw error;
    }
  }

  /**
   * Display campaign status
   */
  showStatus() {
    const status = this.tracker.toJSON();

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Campaign Status: ${this.campaignId}`);
    console.log('='.repeat(60));
    console.log(`Duration: ${status.duration.toFixed(1)}s`);
    console.log(`Videos Analyzed: ${status.videosAnalyzed}`);
    console.log(`Videos Selected: ${status.videosSelected}`);
    console.log(`Videos Edited: ${status.videosEdited}`);
    console.log(`Versions Created: ${status.versionsCreated}`);

    if (status.links.meta.length > 0) {
      console.log(`\nMeta Links (${status.links.meta.length}):`);
      status.links.meta.forEach(url => console.log(`  - ${url}`));
    }

    if (status.links.googleAds.length > 0) {
      console.log(`\nGoogle Ads Links (${status.links.googleAds.length}):`);
      status.links.googleAds.forEach(url => console.log(`  - ${url}`));
    }

    if (status.links.twitter.length > 0) {
      console.log(`\nTwitter Links (${status.links.twitter.length}):`);
      status.links.twitter.forEach(url => console.log(`  - ${url}`));
    }

    if (Object.keys(status.errors).length > 0) {
      console.log(`\n❌ Errors:`);
      Object.entries(status.errors).forEach(([component, error]) => {
        console.log(`  - ${component}: ${error}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    // Validate configuration
    validateConfig();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const modeIndex = args.indexOf('--mode');
    const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'full';
    const inputDirIndex = args.indexOf('--input-dir');
    const inputDir = inputDirIndex !== -1 ? args[inputDirIndex + 1] : './videos';
    const campaignIdIndex = args.indexOf('--campaign-id');
    const campaignId = campaignIdIndex !== -1 ? args[campaignIdIndex + 1] : null;
    const autoPublish = !args.includes('--no-publish');

    // Create agent
    const agent = new VideoEditingAgent(campaignId);

    // Run requested mode
    console.log(`\n🎬 Starting ${mode.toUpperCase()} mode...\n`);

    let result;
    if (mode === 'full') {
      result = await agent.runFullPipeline(inputDir, autoPublish);
    } else if (mode === 'analyze') {
      result = await agent.runAnalysisOnly(inputDir);
    } else {
      logger.error({ mode }, 'Unknown mode');
      process.exit(1);
    }

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log(`Campaign ID: ${result.campaignId}`);
    console.log(`Status: ${result.status.toUpperCase()}`);

    if (result.status === 'success') {
      console.log(`Videos Analyzed: ${result.videosAnalyzed}`);
      console.log(`Videos Selected: ${result.videosSelected}`);
      if (result.analysisFile) {
        console.log(`Analysis Report: ${result.analysisFile}`);
      }
    } else {
      console.log(`Error: ${result.error}`);
    }

    console.log('='.repeat(60) + '\n');

    if (agent.tracker) {
      agent.showStatus();
    }

    process.exit(result.status === 'success' ? 0 : 1);
  } catch (error) {
    logger.error({ error: error.message }, 'Fatal error');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default VideoEditingAgent;
