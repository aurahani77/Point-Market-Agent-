# 🎬 Video Editing & Campaign Automation Agent (Node.js)

A modern, production-ready **JavaScript/Node.js agent** for analyzing, editing, and publishing video campaigns across Meta, Google Ads, and Twitter.

## 🚀 Features

### Video Analysis
- ✅ Analyze 20+ videos in batch
- ✅ Score videos based on quality metrics (resolution, fps, bitrate, audio)
- ✅ Automatic selection of top 3 videos
- ✅ Detailed quality reports (JSON export)
- ✅ FFprobe-based metadata extraction

### Video Editing (🚧 Coming Soon)
- 🚧 Extract best segments from videos
- 🚧 Generate AI-powered Intro/Outro sequences
- 🚧 Add branding (logos, watermarks, colors)
- 🚧 Optimize for multiple platforms

### Design & Branding (🚧 Coming Soon)
- 🚧 Apply consistent brand identity
- 🚧 Generate design templates with Claude
- 🚧 Multiple design styles (professional, energetic, minimal, playful)
- 🚧 Customizable colors, fonts, and logos

### Version Generation (🚧 Coming Soon)
- 🚧 **Vertical (9:16)**: Instagram Stories, Reels, TikTok
- 🚧 **Square (1:1)**: Instagram Feed, Facebook Feed
- 🚧 **Horizontal (16:9)**: YouTube, Google Ads

### Publishing (🚧 Coming Soon)
- 🚧 Meta (Facebook/Instagram) - via Graph API
- 🚧 Google Ads - via Google Ads API
- 🚧 Twitter/X - via Twitter API v2
- 🚧 Batch uploading with status tracking
- 🚧 Automatic link generation

---

## 📋 Installation

### Prerequisites
- Node.js 16+ (LTS recommended)
- FFmpeg (for video processing)
- npm or yarn

### Setup

1. **Navigate to project**
```bash
cd agents/video-campaigns
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

4. **Verify installation**
```bash
npm run dev -- --mode analyze --input-dir ./test-videos
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Claude API (required)
CLAUDE_API_KEY=sk-ant-xxx

# Brand Configuration
BRAND_NAME="Your Brand"
PRIMARY_COLOR="#0066CC"
SECONDARY_COLOR="#FFB400"

# Platform APIs
META_ACCESS_TOKEN=xxx
META_BUSINESS_ID=xxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxx
TWITTER_BEARER_TOKEN=xxx

# Agent Settings
AUTO_PUBLISH=true
VIDEOS_TO_SELECT=3
VERSIONS_PER_VIDEO=3
```

---

## 🎯 Quick Start

### Basic Usage (CLI)

```bash
# Analyze videos only
npm run analyze -- --input-dir ./videos

# Run full pipeline
npm run pipeline -- --input-dir ./videos --campaign-id my-campaign

# With development watch mode
npm run dev -- --mode analyze --input-dir ./videos
```

### Programmatic Usage (JavaScript)

```javascript
import VideoEditingAgent from './src/index.js';

const agent = new VideoEditingAgent('my-campaign');
const result = await agent.runAnalysisOnly('./videos');

console.log(result);
// {
//   status: 'success',
//   videosAnalyzed: 20,
//   videosSelected: 3,
//   report: { ... },
//   analysisFile: './output/..._analysis.json'
// }
```

---

## 📂 Project Structure

```
agents/video-campaigns/
├── src/
│   ├── index.js              # Main agent (CLI entry point)
│   ├── config.js             # ✅ Configuration management
│   ├── logger.js             # ✅ Logging & tracking
│   ├── VideoAnalyzer.js      # ✅ Video analysis & scoring
│   ├── VideoEditor.js        # 🚧 Video editing (stub)
│   ├── DesignGenerator.js    # 🚧 AI design generation (stub)
│   ├── VersionCreator.js     # 🚧 Multi-format versions (stub)
│   └── Publisher.js          # 🚧 Platform publishing (stub)
│
├── templates/
│   ├── intro.json            # Intro animation specs
│   ├── outro.json            # Outro animation specs
│   └── brand-defaults.json   # Default branding
│
├── tests/
│   └── *.test.js             # Test files
│
├── output/                   # Generated reports (git-ignored)
├── temp/                     # Temporary files (git-ignored)
├── logs/                     # Log files (git-ignored)
│
├── package.json
├── .env.example
├── README.md (this file)
└── IMPLEMENTATION_PLAN.md    # Technical roadmap

```

---

## 📊 Analysis Report Format

### JSON Output Example

```json
{
  "timestamp": "2026-07-29T14:30:22.123Z",
  "totalVideos": 20,
  "selectedVideos": 3,
  "videos": [
    {
      "filename": "video_1.mp4",
      "duration": 45.3,
      "resolution": "1920x1080",
      "fps": 30,
      "bitrate": 5000000,
      "qualityScore": 0.92,
      "audioScore": 0.75,
      "overallScore": 0.877
    },
    // ... more videos
  ],
  "selected": ["video_1.mp4", "video_2.mp4", "video_3.mp4"],
  "report": {
    "overallStats": {
      "avgScore": 0.78,
      "maxScore": 0.92,
      "minScore": 0.45
    },
    "qualityStats": {
      "avgQuality": 0.82,
      "avgAudio": 0.71
    },
    "resolutionDistribution": {
      "1080p+": 15,
      "720p": 5
    },
    "durationRange": {
      "min": 5.2,
      "max": 298.5,
      "avg": 45.3
    }
  }
}
```

---

## 🔄 Workflow

### Step 1: Video Intake
```
Input: 20 videos (various formats, quality)
    ↓
Process: Load, validate, extract metadata
    ↓
Output: Validated video list with file info
```

### Step 2: Analysis & Scoring
```
Input: Video list
    ↓
Process: 
  - Quality analysis (resolution, fps, bitrate)
  - Audio quality estimation
  - Calculate overall score
    ↓
Output: Ranked video list (top 3 selected)
```

### Step 3: Video Editing (Coming Soon)
```
Input: Top 3 videos + brand guidelines
    ↓
Process:
  - Extract best segments
  - Generate Intro/Outro (AI-powered)
  - Apply branding (logo, watermark, colors)
    ↓
Output: 3 branded, edited videos
```

### Step 4: Version Generation (Coming Soon)
```
Input: 3 edited videos
    ↓
Process:
  - Vertical (9:16) - 1080x1920
  - Square (1:1) - 1080x1080
  - Horizontal (16:9) - 1920x1080
    ↓
Output: 9 video files (3 videos × 3 versions)
```

### Step 5: Publishing (Coming Soon)
```
Input: 9 video files
    ↓
Process:
  - Upload to Meta (Graph API)
  - Upload to Google Ads
  - Upload to Twitter/X
  - Track URLs & status
    ↓
Output: 
  - 3 Meta links (Reels, Posts)
  - 3 Google Ads campaign links
  - 3 Twitter/X post links
```

---

## 🎨 Design Styles (Coming Soon)

### Intro/Outro Options

#### Professional
- Clean, minimalist design
- Gradient background
- Fade-in animations
- Low music intensity

#### Energetic
- Dynamic animations
- Animated patterns
- Zoom & bounce effects
- High music intensity

#### Minimal
- Ultra-minimal (black background)
- Typewriter text animation
- Silent (no music)
- Focus on text

#### Playful
- Colorful shapes
- Pop-in animations
- Fun effects
- Medium music intensity

---

## 📈 Logging & Monitoring

### Log Files

Logs are automatically saved to `logs/` directory:
- Structured JSON format
- Timestamps for all events
- Color-coded console output
- File persistence

### Log Levels

- 🔍 **debug**: Detailed diagnostic information
- ℹ️ **info**: General informational messages
- ✅ **success**: Task completion
- ⚠️ **warning**: Warning messages
- ❌ **error**: Error messages

### Example Log Output

```
✅ [INFO] 🤖 Agent initialized
→ [INFO] 📊 Phase 1: Video Analysis
ℹ️ [INFO] Found videos: 20
→ [INFO] Analyzing video
✅ [INFO] Video scored: video_1.mp4
→ [INFO] 🎯 Phase 2: Video Selection
✅ [INFO] Task complete: video_selection
```

---

## 🔧 API Configuration

### Meta (Facebook/Instagram)

```javascript
import { MetaPublisher } from './src/Publisher.js';

const publisher = new MetaPublisher(
  config.platforms.meta.accessToken,
  config.platforms.meta.businessId
);

// Publish to Instagram Reels
const url = await publisher.publishReels(videoPath, caption);

// Publish to Facebook Feed
const url = await publisher.publishFeed(videoPath, caption);
```

### Google Ads

```javascript
import { GoogleAdsPublisher } from './src/Publisher.js';

const publisher = new GoogleAdsPublisher(
  config.platforms.googleAds.developerToken,
  config.platforms.googleAds.customerId
);

// Upload video asset
const assetId = await publisher.uploadVideo(videoPath);

// Create video ad
const campaign = await publisher.createVideoAd(assetId, campaignName);
```

### Twitter/X

```javascript
import { TwitterPublisher } from './src/Publisher.js';

const publisher = new TwitterPublisher(
  config.platforms.twitter.bearerToken
);

// Tweet with video
const tweetId = await publisher.postVideo(videoPath, text);
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Video Analysis

```bash
node src/index.js --mode analyze --input-dir ./test-videos --campaign-id test-001
```

### Check Logs

```bash
cat logs/campaign_*.log
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| axios | 1.6.0 | HTTP requests |
| dotenv | 16.3.1 | Environment variables |
| express | 4.18.2 | Web server (optional) |
| fluent-ffmpeg | 2.1.2 | FFmpeg wrapper |
| pino | 8.15.1 | Structured logging |
| pino-pretty | 10.2.0 | Log formatting |
| sharp | 0.32.6 | Image processing |
| uuid | 9.0.0 | ID generation |
| yargs | 17.7.2 | CLI parsing |

---

## 🚨 Error Handling

The agent handles common issues:
- ✅ Missing video files
- ✅ Invalid API credentials
- ✅ Insufficient disk space
- ✅ Network timeouts
- ✅ Format compatibility issues
- ✅ Permission errors

---

## 📞 Troubleshooting

### FFmpeg Not Found

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
choco install ffmpeg
```

### Out of Disk Space

```bash
rm -rf output/* temp/*
```

### API Authentication Errors

- Verify all tokens in `.env`
- Check token expiration dates
- Ensure OAuth scopes are correct
- Re-authenticate if needed

### Video Encoding Issues

- Ensure input videos are in supported formats (MP4, MOV, AVI)
- Check that resolution is within limits (720p - 4K)
- Verify audio codec is compatible

---

## 🎯 Advanced Usage

### Custom Configuration

```javascript
import config from './src/config.js';

// Access configuration
console.log(config.brand.name);
console.log(config.videoAnalysis.minQualityScore);
console.log(config.paths.output);
```

### Campaign Tracking

```javascript
import { CampaignTracker } from './src/logger.js';

const tracker = new CampaignTracker('my-campaign');
tracker.addSelectedVideo('video.mp4');
tracker.addPublishedLink('meta', 'https://instagram.com/p/...');

console.log(tracker.toJSON());
```

### Custom Analysis

```javascript
import { VideoAnalyzer } from './src/VideoAnalyzer.js';

const analyzer = new VideoAnalyzer();
const videos = await analyzer.analyzeDirectory('./videos');

// Access raw data
videos.forEach(video => {
  console.log(`${video.filename}: ${video.overallScore}`);
});
```

---

## 🚀 Performance

Typical processing times (for 20 videos):
- **Analysis**: 2-3 minutes
- **Editing**: 10-15 minutes (depends on video length)
- **Version Generation**: 5-10 minutes
- **Publishing**: 3-5 minutes
- **Total**: ~30 minutes

---

## 🤝 Integration with Claude

This agent is designed to work with Claude API for:
- **Vision Analysis**: Using Claude to analyze video frames
- **Content Generation**: Creating captions and CTAs
- **Decision Making**: Smart selection and optimization
- **Error Recovery**: Intelligent problem-solving

---

## 📝 Command Line Options

```bash
# Analyze mode
node src/index.js --mode analyze --input-dir ./videos

# Full pipeline
node src/index.js --mode full --input-dir ./videos --campaign-id my-campaign

# Custom campaign ID
node src/index.js --mode full --campaign-id custom-id-123

# Disable auto-publish
node src/index.js --mode full --no-publish

# Development mode (with watch)
npm run dev -- --mode analyze --input-dir ./videos
```

---

## 📚 Next Steps

### Phase 2: Video Editing
- [ ] Implement `VideoEditor` class
- [ ] Add intro/outro generation
- [ ] Implement watermark/logo application
- [ ] Color correction pipeline

### Phase 3: Design Generation
- [ ] Integrate Claude Vision API
- [ ] Implement design template generation
- [ ] Create Intro/Outro videos
- [ ] AI-powered branding

### Phase 4: Version Creation
- [ ] Implement vertical version (9:16)
- [ ] Implement square version (1:1)
- [ ] Implement horizontal version (16:9)
- [ ] Aspect ratio handling

### Phase 5: Publishing
- [ ] Integrate Meta Graph API
- [ ] Integrate Google Ads API
- [ ] Integrate Twitter API v2
- [ ] Batch upload with retry logic
- [ ] Status tracking

### Phase 6: Testing & Optimization
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Error recovery strategies

---

## 📄 License

MIT

---

## 💡 Contributing

Contributions welcome! Please follow Node.js best practices:
- Use ES modules (import/export)
- Add JSDoc comments
- Follow async/await patterns
- Use meaningful variable names
- Write descriptive commit messages

---

**Version**: 1.0.0-alpha  
**Status**: 🟡 Video Analysis Complete (Other modules ready for implementation)  
**Last Updated**: 2026-07-29

Happy coding! 🚀
