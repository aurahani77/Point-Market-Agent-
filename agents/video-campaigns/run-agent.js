#!/usr/bin/env node

/**
 * Video Editing & Campaign Automation Agent
 * Main entry point - Full pipeline orchestration
 */

import VideoEditingAgent from './src/index.js';
import { parseArgs } from 'util';

const options = {
  'input-dir': { type: 'string', short: 'i' },
  'campaign-id': { type: 'string', short: 'c' },
  'mode': { type: 'string', short: 'm', default: 'full' },
  'no-publish': { type: 'boolean' },
  'help': { type: 'boolean', short: 'h' }
};

const { values, positionals } = parseArgs({ options, allowPositionals: true });

if (values.help) {
  console.log(`
Video Editing & Campaign Automation Agent

Usage:
  node run-agent.js [options]

Options:
  -i, --input-dir <path>      Directory with input videos (required)
  -c, --campaign-id <id>      Campaign ID (default: auto-generated)
  -m, --mode <mode>           Mode: 'full' (default) or 'analyze'
  --no-publish                Skip publishing phase
  -h, --help                  Show this help

Examples:
  node run-agent.js -i ./videos -c my-campaign
  node run-agent.js -i ./videos --mode analyze
  node run-agent.js -i ./videos -c prod-001 --no-publish
  `);
  process.exit(0);
}

async function main() {
  try {
    const inputDir = values['input-dir'] || './test-videos';
    const campaignId = values['campaign-id'] || `campaign-${Date.now()}`;
    const mode = values.mode || 'full';
    const skipPublish = values['no-publish'] || false;

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🎬 Video Editing & Campaign Automation Agent                 ║
║  Campaign: ${campaignId.padEnd(50)} ║
║  Mode: ${mode.padEnd(58)} ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    const agent = new VideoEditingAgent(campaignId);

    if (mode === 'analyze') {
      console.log('\n📊 Running ANALYSIS mode...\n');
      const result = await agent.runAnalysisOnly(inputDir);
      console.log('\n✅ Analysis Complete!');
      console.log(JSON.stringify(result, null, 2));
    } else if (mode === 'full') {
      console.log('\n🎬 Running FULL pipeline mode...\n');
      const result = await agent.runFullPipeline(inputDir, !skipPublish);
      console.log('\n✅ Pipeline Complete!');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(`❌ Unknown mode: ${mode}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
