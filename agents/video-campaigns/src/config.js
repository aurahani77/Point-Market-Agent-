import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  // Node Environment
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // APIs
  apis: {
    claude: {
      key: process.env.CLAUDE_API_KEY,
      baseUrl: 'https://api.anthropic.com/v1',
    },
    openrouter: {
      key: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
    },
  },

  // Brand Configuration
  brand: {
    name: process.env.BRAND_NAME || 'Default Brand',
    primaryColor: process.env.PRIMARY_COLOR || '#0066CC',
    secondaryColor: process.env.SECONDARY_COLOR || '#FFB400',
    logoPath: process.env.LOGO_PATH,
    ctaText: 'Learn More',
  },

  // Platform APIs
  platforms: {
    meta: {
      enabled: process.env.ENABLE_META_PUBLISHING === 'true',
      accessToken: process.env.META_ACCESS_TOKEN,
      businessId: process.env.META_BUSINESS_ID,
      pageId: process.env.META_PAGE_ID,
    },
    googleAds: {
      enabled: process.env.ENABLE_GOOGLE_ADS_PUBLISHING === 'true',
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
      oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    },
    twitter: {
      enabled: process.env.ENABLE_TWITTER_PUBLISHING === 'true',
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    },
  },

  // Video Analysis
  videoAnalysis: {
    minQualityScore: parseFloat(process.env.MIN_VIDEO_QUALITY_SCORE || '0.6'),
    minAudioQuality: parseFloat(process.env.MIN_AUDIO_QUALITY_SCORE || '0.7'),
    minResolutionHeight: parseInt(process.env.MIN_RESOLUTION_HEIGHT || '720'),
    maxVideoSizeMB: parseInt(process.env.MAX_VIDEO_SIZE_MB || '2000'),
  },

  // Video Editing
  videoEditing: {
    outputFormat: process.env.VIDEO_OUTPUT_FORMAT || 'mp4',
    introDuration: parseInt(process.env.INTRO_DURATION_SECONDS || '3'),
    outroDuration: parseInt(process.env.OUTRO_DURATION_SECONDS || '2'),
    resolutions: {
      vertical: { width: 1080, height: 1920, aspect: '9:16' },
      square: { width: 1080, height: 1080, aspect: '1:1' },
      horizontal: { width: 1920, height: 1080, aspect: '16:9' },
    },
  },

  // Agent Settings
  agent: {
    maxVideos: parseInt(process.env.MAX_VIDEOS || '20'),
    videosToSelect: parseInt(process.env.VIDEOS_TO_SELECT || '3'),
    versionsPerVideo: parseInt(process.env.VERSIONS_PER_VIDEO || '3'),
    autoPublish: process.env.AUTO_PUBLISH === 'true',
    enableLogging: process.env.ENABLE_LOGGING === 'true',
  },

  // Feature Flags
  features: {
    introGeneration: process.env.ENABLE_INTRO_GENERATION === 'true',
    outroGeneration: process.env.ENABLE_OUTRO_GENERATION === 'true',
    autoBranding: process.env.ENABLE_AUTO_BRANDING === 'true',
    aiDesign: process.env.ENABLE_AI_DESIGN === 'true',
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.SERVER_PORT || '3000'),
    host: process.env.SERVER_HOST || 'localhost',
  },

  // Paths
  paths: {
    root: path.resolve(__dirname, '..'),
    src: path.resolve(__dirname),
    output: process.env.STORAGE_PATH || path.resolve(__dirname, '..', 'output'),
    temp: process.env.TEMP_PATH || path.resolve(__dirname, '..', 'temp'),
    templates: path.resolve(__dirname, '..', 'templates'),
  },
};

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors = [];

  if (!config.apis.claude.key) {
    errors.push('CLAUDE_API_KEY is required');
  }

  if (config.platforms.meta.enabled) {
    if (!config.platforms.meta.accessToken) {
      errors.push('META_ACCESS_TOKEN is required when Meta publishing is enabled');
    }
    if (!config.platforms.meta.businessId) {
      errors.push('META_BUSINESS_ID is required when Meta publishing is enabled');
    }
  }

  if (config.platforms.googleAds.enabled) {
    if (!config.platforms.googleAds.developerToken) {
      errors.push('GOOGLE_ADS_DEVELOPER_TOKEN is required when Google Ads publishing is enabled');
    }
  }

  if (config.platforms.twitter.enabled) {
    if (!config.platforms.twitter.bearerToken) {
      errors.push('TWITTER_BEARER_TOKEN is required when Twitter publishing is enabled');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }

  return true;
}

/**
 * Get config summary for logging
 */
export function getConfigSummary() {
  return {
    environment: config.env,
    brand: config.brand.name,
    platforms: {
      meta: config.platforms.meta.enabled,
      googleAds: config.platforms.googleAds.enabled,
      twitter: config.platforms.twitter.enabled,
    },
    agent: {
      maxVideos: config.agent.maxVideos,
      videosToSelect: config.agent.videosToSelect,
      versionsPerVideo: config.agent.versionsPerVideo,
    },
  };
}

export default config;
