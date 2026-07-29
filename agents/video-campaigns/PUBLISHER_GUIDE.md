# 📤 Publisher Module Guide

Complete guide for publishing videos to Meta, Google Ads, and Twitter/X using the Video Editing & Campaign Automation Agent.

## Table of Contents

- [Overview](#overview)
- [Meta (Facebook/Instagram)](#meta-facebookinstagram)
- [Google Ads](#google-ads)
- [Twitter/X](#twitterx)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Overview

The Publisher module handles uploading and publishing videos to multiple platforms automatically. It supports:

- **Meta**: Instagram Reels & Feed posts
- **Google Ads**: Video asset management and ad campaign creation
- **Twitter/X**: Video tweets with custom text

### Architecture

```
Publisher (Base class)
├── MetaPublisher
│   ├── publishReels()
│   └── publishFeed()
├── GoogleAdsPublisher
│   ├── uploadVideo()
│   └── createVideoAd()
└── TwitterPublisher
    └── postVideo()
```

---

## Meta (Facebook/Instagram)

### Prerequisites

1. **Facebook Business Account** (required)
2. **Instagram Business Account** (connected to Facebook)
3. **API Credentials**:
   - Access Token (Page or User token with appropriate scopes)
   - Business ID (Account Business Manager ID)

### Setup

#### Step 1: Get API Credentials

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app (type: Business)
3. Add "Instagram Graph API" product
4. Go to Settings > Basic, copy:
   - App ID
   - App Secret

#### Step 2: Generate Access Token

```bash
# Using Facebook Graph API Explorer:
1. Navigate to Graph API Explorer
2. Select your app from dropdown
3. Select "Get User Access Token"
4. Request permissions: pages_manage_metadata, pages_read_engagement, pages_manage_posts
5. Copy the access token

# Or use cURL:
curl "https://graph.instagram.com/oauth/authorize?client_id=YOUR_APP_ID&redirect_uri=https://localhost&scope=instagram_business_content_publish,pages_manage_posts"
```

#### Step 3: Get Business ID

```bash
# Using Graph API:
curl "https://graph.instagram.com/v18.0/me/accounts?access_token=YOUR_ACCESS_TOKEN"

# Response includes business_id
```

#### Step 4: Configure .env

```env
ENABLE_META_PUBLISHING=true
META_ACCESS_TOKEN=your_access_token_here
META_BUSINESS_ID=your_business_id_here
META_PAGE_ID=your_page_id_here  # Optional, for Facebook posts
```

### Instagram Reels

**Endpoint**: `POST /v18.0/{business-account-id}/media`

**Parameters**:
- `video_data` (binary): Video file
- `media_type` (string): "REELS"
- `caption` (string): Reel description
- `access_token` (string): Your access token

**Example**:
```javascript
import { MetaPublisher } from './src/Publisher.js';

const publisher = new MetaPublisher(accessToken, businessId);
const url = await publisher.publishReels('./video.mp4', 'Check out our latest content! 🎥');
// Returns: https://instagram.com/reel/MEDIA_ID/
```

### Instagram Feed

**Endpoint**: `POST /v18.0/{business-account-id}/media`

**Parameters**:
- `video_data` (binary): Video file
- `media_type` (string): "VIDEO"
- `caption` (string): Post description
- `access_token` (string): Your access token

**Example**:
```javascript
const publisher = new MetaPublisher(accessToken, businessId);
const url = await publisher.publishFeed('./video.mp4', 'Our latest video post');
// Returns: https://instagram.com/p/MEDIA_ID/
```

### Video Requirements (Meta)

- **Format**: MP4 (H.264 video codec, AAC audio codec)
- **Resolution**: 
  - Reels: 1080x1920 (vertical), 1920x1080 (horizontal)
  - Feed: 600x600 to 1080x1350
- **Duration**: 3 seconds to 90 minutes (Reels), 3 seconds to 60 minutes (Feed)
- **File Size**: Max 4GB
- **Bitrate**: Recommended 5000-10000 kbps
- **Frame Rate**: 23-60 fps

---

## Google Ads

### Prerequisites

1. **Google Ads Account** (MCC Account recommended)
2. **Google Cloud Project** with Ads API enabled
3. **API Credentials**:
   - Developer Token
   - Customer ID
   - OAuth 2.0 credentials (optional, for authentication)

### Setup

#### Step 1: Enable Google Ads API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Google Ads API"
4. Create OAuth 2.0 credentials (Desktop application)
5. Download credentials JSON

#### Step 2: Get Developer Token

1. Go to [Google Ads Account](https://ads.google.com)
2. Navigate to Tools & Settings > API Center
3. Click "Get Started" for Google Ads API
4. Request a developer token (may take 24-48 hours)

#### Step 3: Get Customer ID

1. In Google Ads account, click Help (?) icon
2. Copy your customer ID (10-digit number)
3. Format with hyphens: `123-456-7890`

#### Step 4: Configure .env

```env
ENABLE_GOOGLE_ADS_PUBLISHING=true
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
```

### Upload Video Asset

**Endpoint**: `POST /v15/customers/{customer-id}/mediaFiles`

**Parameters**:
- `type` (string): "VIDEO"
- `video.data` (base64): Video file as base64-encoded string
- `developer_token` (header): Your developer token

**Example**:
```javascript
import { GoogleAdsPublisher } from './src/Publisher.js';

const publisher = new GoogleAdsPublisher(developerToken, customerId);
const assetId = await publisher.uploadVideo('./video.mp4');
// Returns: 'asset_id_12345'
```

### Create Video Ad Campaign

**Endpoint**: `POST /v15/customers/{customer-id}/campaigns`

**Parameters**:
- `campaign.name` (string): Campaign name
- `campaign.advertising_channel_type` (string): "VIDEO"
- `campaign.status` (string): "ENABLED"
- `campaign.budget_config.budget_id` (string): Budget ID

**Example**:
```javascript
const campaign = await publisher.createVideoAd(assetId, 'My Video Campaign');
// Returns: {
//   campaignId: 'campaign_12345',
//   url: 'https://ads.google.com/aw/campaigns/...'
// }
```

### Video Requirements (Google Ads)

- **Format**: MP4, MOV, AVI
- **Resolution**: Min 320x180, Max 1920x1080
- **Duration**: 5 seconds to 30 seconds (for bumper ads), unlimited for skippable
- **File Size**: Max 1GB
- **Codec**: H.264 (video), AAC (audio)
- **Bitrate**: 500-2500 kbps
- **Frame Rate**: 23.976, 24, 25, 29.97, or 30 fps

---

## Twitter/X

### Prerequisites

1. **Twitter/X Developer Account**
2. **API Credentials**:
   - Bearer Token (for API v2)
   - API Key & Secret (for v1.1 media upload)
   - Access Token & Secret

### Setup

#### Step 1: Create Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Apply for developer access
3. Create a new project
4. Create an app within the project

#### Step 2: Generate API Credentials

1. Go to App Settings
2. Navigate to "Keys and tokens"
3. Generate or copy:
   - **API Key** (API_KEY)
   - **API Secret** (API_SECRET)
   - **Bearer Token** (BEARER_TOKEN)
   - **Access Token** (ACCESS_TOKEN)
   - **Access Token Secret** (ACCESS_TOKEN_SECRET)

#### Step 3: Set Permissions

In App Settings > Permissions:
- Change to "Read and Write and Direct Messages"
- Set API permissions to "Elevated"

#### Step 4: Configure .env

```env
ENABLE_TWITTER_PUBLISHING=true
TWITTER_BEARER_TOKEN=your_bearer_token_here
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

### Post Video to Twitter/X

**Endpoints**:
- Upload: `POST https://upload.twitter.com/1.1/media/upload.json`
- Tweet: `POST /2/tweets`

**Parameters**:
- Upload: `media_data` (binary), `media_category` ("tweet_video")
- Tweet: `text` (string), `media.media_ids` (array)

**Example**:
```javascript
import { TwitterPublisher } from './src/Publisher.js';

const publisher = new TwitterPublisher(bearerToken);
const tweetUrl = await publisher.postVideo('./video.mp4', 'Check out our new video! 🎥');
// Returns: 'https://twitter.com/user/status/1234567890'
```

### Video Requirements (Twitter/X)

- **Format**: MP4, MOV, WEBM
- **Resolution**: Min 600x400, Max 1920x1200
- **Duration**: Max 2 hours 20 minutes
- **File Size**: Max 512MB
- **Codec**: H.264 (video), AAC/MP3 (audio)
- **Bitrate**: Max 25 Mbps
- **Frame Rate**: 23-60 fps

---

## Configuration

### Enable/Disable Publishing

Control publishing per platform via `.env`:

```env
# Enable all platforms
ENABLE_META_PUBLISHING=true
ENABLE_GOOGLE_ADS_PUBLISHING=true
ENABLE_TWITTER_PUBLISHING=true

# Or disable specific platforms
ENABLE_TWITTER_PUBLISHING=false
```

### Auto-Publish Setting

```env
# Enable automatic publishing in Phase 6
AUTO_PUBLISH=true

# Or disable and publish manually later
AUTO_PUBLISH=false
```

### Programmatic Configuration

```javascript
import config from './src/config.js';

// Check if platform is enabled
if (config.platforms.meta.enabled) {
  console.log('Meta publishing is enabled');
}

// Access platform credentials
console.log(config.platforms.meta.accessToken);
console.log(config.platforms.googleAds.developerToken);
console.log(config.platforms.twitter.bearerToken);
```

---

## API Integration

### Base Publisher Class

The `Publisher` class provides a unified interface:

```javascript
import { Publisher } from './src/Publisher.js';

const publisher = new Publisher();

// Publish to Meta
const metaUrl = await publisher.publishToMeta(videoPath, caption, 'reels');

// Publish to Google Ads
const adsUrl = await publisher.publishToGoogleAds(videoPath, campaignName);

// Publish to Twitter
const tweetUrl = await publisher.publishToTwitter(videoPath, text);
```

### Individual Platform Publishers

Use specific publishers for advanced control:

```javascript
import { MetaPublisher, GoogleAdsPublisher, TwitterPublisher } from './src/Publisher.js';

// Meta
const meta = new MetaPublisher(accessToken, businessId);
const reelsUrl = await meta.publishReels(videoPath, caption);
const feedUrl = await meta.publishFeed(videoPath, caption);

// Google Ads
const ads = new GoogleAdsPublisher(devToken, customerId);
const assetId = await ads.uploadVideo(videoPath);
const campaign = await ads.createVideoAd(assetId, campaignName);

// Twitter
const twitter = new TwitterPublisher(bearerToken);
const tweetUrl = await twitter.postVideo(videoPath, text);
```

---

## Error Handling

### Common Errors

#### 401 Unauthorized
- **Cause**: Invalid or expired API credentials
- **Solution**: Verify token in `.env`, regenerate if expired

#### 403 Forbidden
- **Cause**: Missing permissions/scopes
- **Solution**: 
  - Meta: Ensure page_access_token has pages_manage_posts scope
  - Google Ads: Verify developer token is approved
  - Twitter: Enable "Write" permissions

#### 429 Rate Limited
- **Cause**: Too many API requests
- **Solution**: Implement exponential backoff (built-in retry logic coming soon)

#### 400 Bad Request
- **Cause**: Invalid video format or parameters
- **Solution**: Check video requirements for each platform (see above)

### Graceful Fallbacks

The agent includes error handling:

```javascript
try {
  const url = await publisher.publishToMeta(videoPath, caption);
  tracker.addPublishedLink('meta', url);
} catch (error) {
  logger.error({ error: error.message }, 'Failed to publish to Meta');
  tracker.addError(`publish_meta_${videoName}`, error.message);
  // Continue with other platforms
}
```

### Logging

All publishing operations are logged:

```bash
# View logs
tail -f logs/campaign_*.log

# Example log output:
✅ [INFO] Published to Instagram Reels
   mediaId: "12345678901234567"
   url: "https://instagram.com/reel/12345678901234567/"
```

---

## Examples

### Example 1: Publish Single Video

```javascript
import { Publisher } from './src/Publisher.js';

const publisher = new Publisher();

try {
  // Publish to all platforms
  const metaUrl = await publisher.publishToMeta(
    './output/video_1_vertical.mp4',
    'Check out our latest content! 🎥'
  );
  
  const adsUrl = await publisher.publishToGoogleAds(
    './output/video_1_horizontal.mp4',
    'Q3 Product Launch Campaign'
  );
  
  const tweetUrl = await publisher.publishToTwitter(
    './output/video_1_vertical.mp4',
    'New video alert! Watch our latest update 📹'
  );
  
  console.log(`Published to Meta: ${metaUrl}`);
  console.log(`Published to Ads: ${adsUrl}`);
  console.log(`Published to Twitter: ${tweetUrl}`);
} catch (error) {
  console.error('Publishing failed:', error.message);
}
```

### Example 2: Batch Publish Multiple Versions

```javascript
import { Publisher } from './src/Publisher.js';
import { CampaignTracker } from './src/logger.js';

const publisher = new Publisher();
const tracker = new CampaignTracker('batch-campaign');

const videos = [
  { vertical: './video_1_vertical.mp4', square: './video_1_square.mp4', horizontal: './video_1_horizontal.mp4' },
  { vertical: './video_2_vertical.mp4', square: './video_2_square.mp4', horizontal: './video_2_horizontal.mp4' },
  { vertical: './video_3_vertical.mp4', square: './video_3_square.mp4', horizontal: './video_3_horizontal.mp4' },
];

const copy = {
  instagram: 'Follow us for more amazing content! 🌟',
  googleAds: 'Special Promotion - Limited Time Offer',
  twitter: 'Don\'t miss our latest video! 🎬'
};

for (const video of videos) {
  try {
    // Meta Reels (vertical)
    const reelsUrl = await publisher.publishToMeta(video.vertical, copy.instagram, 'reels');
    tracker.addPublishedLink('meta', reelsUrl);
    
    // Meta Feed (square)
    const feedUrl = await publisher.publishToMeta(video.square, copy.instagram, 'feed');
    tracker.addPublishedLink('meta', feedUrl);
    
    // Google Ads (horizontal)
    const adsUrl = await publisher.publishToGoogleAds(video.horizontal, copy.googleAds);
    tracker.addPublishedLink('googleAds', adsUrl);
    
    // Twitter (vertical)
    const tweetUrl = await publisher.publishToTwitter(video.vertical, copy.twitter);
    tracker.addPublishedLink('twitter', tweetUrl);
  } catch (error) {
    console.error('Video publishing failed:', error);
  }
}

console.log(tracker.toJSON());
```

### Example 3: Conditional Publishing

```javascript
import config from './src/config.js';
import { Publisher } from './src/Publisher.js';

const publisher = new Publisher();
const videoPath = './output/video_final.mp4';

// Only publish to enabled platforms
if (config.platforms.meta.enabled) {
  const url = await publisher.publishToMeta(videoPath, 'New content available');
  console.log(`Meta: ${url}`);
}

if (config.platforms.googleAds.enabled) {
  const url = await publisher.publishToGoogleAds(videoPath, 'Campaign Q3');
  console.log(`Google Ads: ${url}`);
}

if (config.platforms.twitter.enabled) {
  const url = await publisher.publishToTwitter(videoPath, 'Latest update');
  console.log(`Twitter: ${url}`);
}
```

---

## API Response Format

### Success Response (Meta)

```json
{
  "id": "17889458974031293",
  "status": "PROCESSING"
}
```

URL: `https://instagram.com/reel/17889458974031293/`

### Success Response (Google Ads)

```json
{
  "resourceName": "customers/1234567890/mediaFiles/12345678"
}
```

URL: `https://ads.google.com/aw/campaigns/...`

### Success Response (Twitter)

```json
{
  "data": {
    "id": "1234567890123456789",
    "text": "Check out our video!"
  }
}
```

URL: `https://twitter.com/user/status/1234567890123456789`

---

## Best Practices

1. **Test with a single video first** before running full campaigns
2. **Verify video formats** match platform requirements
3. **Keep captions/descriptions short** for better engagement
4. **Use relevant hashtags** for better discoverability
5. **Schedule posts** during peak engagement hours
6. **Monitor analytics** after publishing
7. **Maintain platform-specific posting guidelines**
8. **Implement retry logic** for failed uploads
9. **Track published URLs** for campaign analytics
10. **Keep API credentials secure** in .env files

---

## Troubleshooting

### Videos Won't Upload

1. Check video codec (H.264/AAC required for most platforms)
2. Verify file size is within limits
3. Confirm resolution matches requirements
4. Test with ffprobe: `ffprobe -v error -show_entries frame=pkt_size,pkt_pts_time,pkt_duration_time -select_streams v:0 video.mp4`

### API Authentication Fails

1. Verify tokens in .env are correct
2. Check token expiration (regenerate if needed)
3. Ensure API is enabled in platform dashboard
4. Confirm permissions/scopes are set correctly

### Rate Limiting

1. Reduce number of concurrent uploads
2. Add delays between API calls
3. Use batch upload endpoints when available
4. Request higher rate limits from platform

---

**Last Updated**: 2026-07-29  
**Version**: 1.0.0
