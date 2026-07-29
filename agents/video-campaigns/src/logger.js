import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure log directory exists
const logDir = path.resolve(config.paths.root, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create logger
const logger = pino(
  {
    level: config.logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        messageFormat: '{levelLabel} - {msg}',
        singleLine: false,
      },
    },
  },
  pino.destination(path.resolve(logDir, `campaign_${Date.now()}.log`))
);

/**
 * Campaign Tracker - Track campaign progress and metrics
 */
export class CampaignTracker {
  constructor(campaignId) {
    this.campaignId = campaignId;
    this.startTime = new Date();
    this.videosAnalyzed = 0;
    this.videosSelected = 0;
    this.videosEdited = 0;
    this.versionsCreated = 0;
    this.platformsPublished = [];
    this.errors = {};
    this.links = {
      meta: [],
      googleAds: [],
      twitter: [],
    };
  }

  addVideoAnalysis(videoName, score) {
    this.videosAnalyzed++;
    logger.debug({ video: videoName, score }, 'Video analyzed');
  }

  addSelectedVideo(videoName) {
    this.videosSelected++;
    logger.debug({ video: videoName }, 'Video selected');
  }

  addEditedVideo(videoName) {
    this.videosEdited++;
    logger.debug({ video: videoName }, 'Video edited');
  }

  addVersion(versionType) {
    this.versionsCreated++;
    logger.debug({ type: versionType }, 'Version created');
  }

  addPublishedLink(platform, url) {
    if (this.links[platform]) {
      this.links[platform].push(url);
      logger.info({ platform, url }, 'Link published');
    }
  }

  addError(component, error) {
    this.errors[component] = error.message || error;
    logger.error({ component, error }, 'Error occurred');
  }

  getDuration() {
    return (new Date() - this.startTime) / 1000; // seconds
  }

  toJSON() {
    return {
      campaignId: this.campaignId,
      startTime: this.startTime.toISOString(),
      duration: this.getDuration(),
      videosAnalyzed: this.videosAnalyzed,
      videosSelected: this.videosSelected,
      videosEdited: this.videosEdited,
      versionsCreated: this.versionsCreated,
      links: this.links,
      errors: this.errors,
    };
  }

  toString() {
    const status = this.toJSON();
    return JSON.stringify(status, null, 2);
  }
}

/**
 * Task tracking functions
 */
export const taskLogger = {
  start(taskName, data = {}) {
    logger.info({ task: taskName, ...data }, '🚀 Task started');
  },

  complete(taskName, results = {}) {
    logger.info({ task: taskName, ...results }, '✅ Task complete');
  },

  failed(taskName, error, data = {}) {
    logger.error({ task: taskName, error: error.message || error, ...data }, '❌ Task failed');
  },

  step(stepName, details = {}) {
    logger.info({ step: stepName, ...details }, '→ Step');
  },
};

export { logger };
export default logger;
