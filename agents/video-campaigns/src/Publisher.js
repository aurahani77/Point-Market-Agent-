/**
 * Publisher.js - Handle Uploading Videos to Platforms
 *
 * Supports:
 * - Meta (Facebook, Instagram, Reels)
 * - Google Ads
 * - Twitter/X
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { logger, taskLogger } from './logger.js';
import config from './config.js';

/**
 * Base Publisher class for all platforms
 */
export class Publisher {
  constructor() {
    this.logger = logger;
    this.config = config;
  }

  /**
   * Publish video to Meta (Facebook/Instagram)
   * @param {string} videoPath - Path to video file
   * @param {string} caption - Video caption/description
   * @param {string} platform - 'reels' or 'feed' (default: 'reels')
   * @returns {Promise<string>} URL of published video
   */
  async publishToMeta(videoPath, caption = '', platform = 'reels') {
    taskLogger.start('publish_meta', { video: videoPath, caption: caption.substring(0, 50), platform });

    try {
      if (!this.config.platforms.meta.enabled) {
        this.logger.warn('Meta publishing is disabled in config');
        return null;
      }

      const metaPublisher = new MetaPublisher(
        this.config.platforms.meta.accessToken,
        this.config.platforms.meta.businessId
      );

      let url;
      if (platform === 'reels') {
        url = await metaPublisher.publishReels(videoPath, caption);
      } else {
        url = await metaPublisher.publishFeed(videoPath, caption);
      }

      taskLogger.complete('publish_meta', { url });
      return url;
    } catch (error) {
      taskLogger.failed('publish_meta', error);
      this.logger.error({ error: error.message }, 'Meta publishing failed');
      throw error;
    }
  }

  /**
   * Publish video to Google Ads
   * @param {string} videoPath - Path to video file
   * @param {string} campaignName - Campaign name
   * @returns {Promise<string>} Campaign/Ad URL
   */
  async publishToGoogleAds(videoPath, campaignName = '') {
    taskLogger.start('publish_google_ads', { video: videoPath, campaign: campaignName });

    try {
      if (!this.config.platforms.googleAds.enabled) {
        this.logger.warn('Google Ads publishing is disabled in config');
        return null;
      }

      const googlePublisher = new GoogleAdsPublisher(
        this.config.platforms.googleAds.developerToken,
        this.config.platforms.googleAds.customerId
      );

      const assetId = await googlePublisher.uploadVideo(videoPath);
      const campaign = await googlePublisher.createVideoAd(assetId, campaignName);

      taskLogger.complete('publish_google_ads', { campaignId: campaign.campaignId });
      return campaign.url;
    } catch (error) {
      taskLogger.failed('publish_google_ads', error);
      this.logger.error({ error: error.message }, 'Google Ads publishing failed');
      throw error;
    }
  }

  /**
   * Publish video to Twitter/X
   * @param {string} videoPath - Path to video file
   * @param {string} text - Tweet text
   * @returns {Promise<string>} Tweet URL
   */
  async publishToTwitter(videoPath, text = '') {
    taskLogger.start('publish_twitter', { video: videoPath, text: text.substring(0, 50) });

    try {
      if (!this.config.platforms.twitter.enabled) {
        this.logger.warn('Twitter publishing is disabled in config');
        return null;
      }

      const twitterPublisher = new TwitterPublisher(this.config.platforms.twitter.bearerToken);
      const url = await twitterPublisher.postVideo(videoPath, text);

      taskLogger.complete('publish_twitter', { url });
      return url;
    } catch (error) {
      taskLogger.failed('publish_twitter', error);
      this.logger.error({ error: error.message }, 'Twitter publishing failed');
      throw error;
    }
  }
}

/**
 * Meta-specific Publisher (Facebook, Instagram)
 */
export class MetaPublisher {
  constructor(accessToken, businessId) {
    this.accessToken = accessToken;
    this.businessId = businessId;
    this.logger = logger;
    this.graphApiUrl = 'https://graph.instagram.com/v18.0';
  }

  /**
   * Publish to Instagram Reels
   * @param {string} videoPath - Path to video file
   * @param {string} caption - Caption
   * @returns {Promise<string>} URL to published reel
   */
  async publishReels(videoPath, caption = '') {
    this.logger.debug('Publishing to Instagram Reels');

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      const videoStream = fs.createReadStream(videoPath);
      const formData = new FormData();
      formData.append('video_data', videoStream);
      formData.append('caption', caption);
      formData.append('media_type', 'REELS');
      formData.append('access_token', this.accessToken);

      const response = await axios.post(
        `${this.graphApiUrl}/${this.businessId}/media`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 120000,
        }
      );

      if (response.data.id) {
        const mediaId = response.data.id;
        const url = `https://instagram.com/reel/${mediaId}/`;
        this.logger.info({ mediaId, url }, 'Instagram Reels published successfully');
        return url;
      }

      throw new Error('No media ID returned from Instagram API');
    } catch (error) {
      this.logger.error({ error: error.message }, 'Failed to publish to Instagram Reels');
      throw error;
    }
  }

  /**
   * Publish to Instagram/Facebook Feed
   * @param {string} videoPath - Path to video file
   * @param {string} caption - Caption
   * @returns {Promise<string>} URL to published post
   */
  async publishFeed(videoPath, caption = '') {
    this.logger.debug('Publishing to Instagram Feed');

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      const videoStream = fs.createReadStream(videoPath);
      const formData = new FormData();
      formData.append('video_data', videoStream);
      formData.append('caption', caption);
      formData.append('media_type', 'VIDEO');
      formData.append('access_token', this.accessToken);

      const response = await axios.post(
        `${this.graphApiUrl}/${this.businessId}/media`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 120000,
        }
      );

      if (response.data.id) {
        const mediaId = response.data.id;
        const url = `https://instagram.com/p/${mediaId}/`;
        this.logger.info({ mediaId, url }, 'Instagram Feed post published successfully');
        return url;
      }

      throw new Error('No media ID returned from Instagram API');
    } catch (error) {
      this.logger.error({ error: error.message }, 'Failed to publish to Instagram Feed');
      throw error;
    }
  }
}

/**
 * Google Ads specific Publisher
 */
export class GoogleAdsPublisher {
  constructor(developerToken, customerId) {
    this.developerToken = developerToken;
    this.customerId = customerId;
    this.logger = logger;
    this.googleAdsApiUrl = 'https://googleads.googleapis.com/v15';
  }

  /**
   * Upload video asset to Google Ads
   * @param {string} videoPath - Path to video file
   * @returns {Promise<string>} Asset ID
   */
  async uploadVideo(videoPath) {
    this.logger.debug('Uploading video to Google Ads');

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      const videoData = fs.readFileSync(videoPath);
      const base64Video = videoData.toString('base64');

      const response = await axios.post(
        `${this.googleAdsApiUrl}/customers/${this.customerId}/mediaFiles`,
        {
          media_file: {
            type: 'VIDEO',
            video: {
              data: base64Video,
            },
          },
        },
        {
          headers: {
            'developer-token': this.developerToken,
            'content-type': 'application/json',
          },
          timeout: 120000,
        }
      );

      if (response.data.resourceName) {
        const assetId = response.data.resourceName.split('/').pop();
        this.logger.info({ assetId }, 'Video uploaded to Google Ads');
        return assetId;
      }

      throw new Error('No resource name in Google Ads response');
    } catch (error) {
      this.logger.error({ error: error.message }, 'Failed to upload video to Google Ads');
      throw error;
    }
  }

  /**
   * Create video ad campaign
   * @param {string} assetId - Video asset ID
   * @param {string} campaignName - Campaign name
   * @returns {Promise<object>} Campaign info
   */
  async createVideoAd(assetId, campaignName = '') {
    this.logger.debug('Creating video ad campaign');

    try {
      const campaignResponse = await axios.post(
        `${this.googleAdsApiUrl}/customers/${this.customerId}/campaigns`,
        {
          campaign: {
            name: campaignName || `Campaign_${Date.now()}`,
            advertising_channel_type: 'VIDEO',
            status: 'ENABLED',
            budget_config: {
              budget_id: 'temp_budget_id',
            },
          },
        },
        {
          headers: {
            'developer-token': this.developerToken,
            'content-type': 'application/json',
          },
        }
      );

      const campaignId = campaignResponse.data.resourceName.split('/').pop();
      const url = `https://ads.google.com/aw/campaigns/${campaignId}`;

      this.logger.info({ campaignId, url }, 'Video ad campaign created');
      return { campaignId, url };
    } catch (error) {
      this.logger.error({ error: error.message }, 'Failed to create Google Ads campaign');
      throw error;
    }
  }
}

/**
 * Twitter/X specific Publisher
 */
export class TwitterPublisher {
  constructor(bearerToken) {
    this.bearerToken = bearerToken;
    this.logger = logger;
    this.apiUrl = 'https://api.twitter.com/2';
  }

  /**
   * Post video to Twitter/X
   * @param {string} videoPath - Path to video file
   * @param {string} text - Tweet text
   * @returns {Promise<string>} Tweet URL
   */
  async postVideo(videoPath, text = '') {
    this.logger.debug('Posting to Twitter/X');

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      const videoData = fs.readFileSync(videoPath);
      const mediaForm = new FormData();
      mediaForm.append('media_data', videoData);

      const mediaResponse = await axios.post(
        'https://upload.twitter.com/1.1/media/upload.json',
        mediaForm,
        {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
            ...mediaForm.getHeaders(),
          },
          timeout: 120000,
          params: {
            media_category: 'tweet_video',
          },
        }
      );

      if (mediaResponse.data.media_id_string) {
        const mediaId = mediaResponse.data.media_id_string;

        const tweetResponse = await axios.post(
          `${this.apiUrl}/tweets`,
          {
            text: text || 'Check out our latest video!',
            media: {
              media_ids: [mediaId],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.bearerToken}`,
              'content-type': 'application/json',
            },
          }
        );

        if (tweetResponse.data.data.id) {
          const tweetId = tweetResponse.data.data.id;
          const url = `https://twitter.com/user/status/${tweetId}`;
          this.logger.info({ tweetId, url }, 'Tweet posted successfully');
          return url;
        }
      }

      throw new Error('Failed to get media ID from Twitter');
    } catch (error) {
      this.logger.error({ error: error.message }, 'Failed to post to Twitter');
      throw error;
    }
  }
}

export default Publisher;
