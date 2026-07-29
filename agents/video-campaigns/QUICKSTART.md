# 🚀 Quick Start Guide

Get the Video Editing & Campaign Automation Agent up and running in 5 minutes.

## 1. Installation (2 minutes)

### Prerequisites
- Node.js 16+ (check: `node --version`)
- FFmpeg (check: `ffmpeg -version`)

### Install FFmpeg (if needed)

**macOS**
```bash
brew install ffmpeg
```

**Ubuntu/Debian**
```bash
sudo apt-get install ffmpeg
```

**Windows**
```bash
choco install ffmpeg
```

### Setup Project

```bash
# Navigate to project directory
cd agents/video-campaigns

# Install dependencies
npm install
```

**Output should show:**
```
added 45 packages in 1.23s
```

## 2. Configuration (2 minutes)

### Create .env file

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your API keys (see below)
nano .env  # or use your editor
```

### Minimum Configuration

You need at least Claude API key for the agent to work:

```env
# Required - Claude API for design generation
CLAUDE_API_KEY=sk-ant-...

# Required - Brand settings
BRAND_NAME="Your Brand Name"

# Optional - Platform publishing (can set to false)
ENABLE_META_PUBLISHING=false
ENABLE_GOOGLE_ADS_PUBLISHING=false
ENABLE_TWITTER_PUBLISHING=false
```

**To enable platform publishing**, see [PUBLISHER_GUIDE.md](./PUBLISHER_GUIDE.md) for detailed setup.

## 3. Prepare Videos (1 minute)

```bash
# Create input directory
mkdir test-videos

# Copy your videos (MP4, MOV, AVI)
cp /path/to/videos/* test-videos/
```

**Required**: At least 3 videos (MP4 format recommended)

## 4. Run Agent (1 minute)

### Analysis Only (Quick Test)

```bash
npm run analyze -- --input-dir ./test-videos
```

**Output**:
```
✅ [INFO] Phase 1: Video Analysis
✅ [INFO] Analyzed 5 videos
✅ [INFO] Selected top 3 videos
Analysis saved to: output/campaign_*.json
```

### Full Pipeline (Complete Campaign)

```bash
npm run pipeline -- --input-dir ./test-videos --campaign-id my-first-campaign
```

**Output** (takes 5-15 minutes depending on video length):
```
🎬 Starting FULL mode...

🎨 Phase 0: Design Template Generation
✅ Brand template generated

📊 Phase 1: Video Analysis
✅ 20 videos analyzed

🎯 Phase 2: Video Selection
✅ Top 3 videos selected

✂️  Phase 3: Video Editing
✅ Video 1 edited successfully
✅ Video 2 edited successfully
✅ Video 3 edited successfully

🎬 Phase 4: Version Generation
✅ 9 versions created (3 videos × 3 formats)

✍️  Phase 5: Marketing Copy Generation
✅ Marketing copy for Instagram, TikTok, YouTube

📤 Phase 6: Publishing
[Skipped - Auto-publish disabled]

✅ Campaign complete!
```

## 5. Check Results

### Output Files

All results saved to `output/` directory:

```bash
ls -la output/
```

**Files created**:
- `campaign_*.json` - Full campaign report
- `*_analysis.json` - Video analysis details
- `*_brand_template.json` - Brand design specs
- `*_marketing_copy.json` - Platform-specific copy
- `*.mp4` - Edited videos and versions

### View Results

```bash
# See campaign summary
cat output/campaign_*.json | jq '.'

# See analysis details
cat output/*_analysis.json | jq '.report'

# Check logs
tail -f logs/campaign_*.log
```

## 6. Enable Publishing (Optional)

To automatically publish videos to platforms:

### Setup Platform APIs

See [PUBLISHER_GUIDE.md](./PUBLISHER_GUIDE.md) for:
- Meta (Instagram/Facebook)
- Google Ads
- Twitter/X

### Enable in .env

```env
ENABLE_META_PUBLISHING=true
ENABLE_GOOGLE_ADS_PUBLISHING=true
ENABLE_TWITTER_PUBLISHING=true

AUTO_PUBLISH=true
```

### Add Credentials to .env

```env
# Meta
META_ACCESS_TOKEN=your_token_here
META_BUSINESS_ID=your_id_here

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=your_token_here
GOOGLE_ADS_CUSTOMER_ID=123-456-7890

# Twitter
TWITTER_BEARER_TOKEN=your_token_here
```

### Run with Publishing

```bash
npm run pipeline -- --input-dir ./test-videos --campaign-id published-campaign
```

**Output** now includes:
```
📤 Phase 6: Publishing
✅ Published to Instagram Reels: https://instagram.com/reel/...
✅ Published to Instagram Feed: https://instagram.com/p/...
✅ Published to Google Ads: https://ads.google.com/...
✅ Published to Twitter: https://twitter.com/user/status/...
```

## Command Reference

```bash
# Analyze videos only
npm run analyze -- --input-dir ./videos

# Run full pipeline
npm run pipeline -- --input-dir ./videos

# Custom campaign ID
npm run pipeline -- --input-dir ./videos --campaign-id my-campaign

# Disable auto-publishing
npm run pipeline -- --input-dir ./videos --no-publish

# Development mode (watch for changes)
npm run dev -- --mode analyze --input-dir ./videos
```

## Common Issues

### FFmpeg not found
```bash
# Install FFmpeg
brew install ffmpeg  # macOS
sudo apt-get install ffmpeg  # Linux

# Verify installation
ffmpeg -version
```

### Node modules not installed
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CLAUDE_API_KEY missing
```bash
# Get your API key from:
# https://console.anthropic.com

# Add to .env
CLAUDE_API_KEY=sk-ant-your-key-here
```

### Videos not found
```bash
# Verify videos exist
ls -la test-videos/

# Use correct input directory
npm run analyze -- --input-dir ./test-videos
```

### Out of disk space
```bash
# Clean up old outputs
rm -rf output/* temp/*
```

## Next Steps

1. **Process your own videos**
   ```bash
   npm run pipeline -- --input-dir /path/to/your/videos
   ```

2. **Set up platform publishing** (see [PUBLISHER_GUIDE.md](./PUBLISHER_GUIDE.md))
   - Get API credentials
   - Configure .env
   - Enable auto-publish

3. **Customize branding**
   - Edit .env with your brand colors and name
   - Add your logo with `LOGO_PATH`

4. **Schedule campaigns**
   - Use cron job or GitHub Actions
   - Run agent daily/weekly
   - Automate brand publishing

## Example Workflow

```bash
# 1. Setup (first time only)
mkdir test-videos
cp ~/my-videos/*.mp4 test-videos/
cp .env.example .env
# Edit .env with CLAUDE_API_KEY

# 2. Test with analysis
npm run analyze -- --input-dir ./test-videos

# 3. Run full pipeline
npm run pipeline -- --input-dir ./test-videos --campaign-id test-001

# 4. Check results
ls -la output/
cat output/campaign_*.json

# 5. Enable publishing (optional)
# Edit .env: ENABLE_META_PUBLISHING=true, etc.
# Add platform credentials to .env

# 6. Run with publishing
npm run pipeline -- --input-dir ./test-videos --campaign-id prod-001

# 7. Monitor progress
tail -f logs/campaign_*.log
```

## Performance Guide

| Action | Time | Notes |
|--------|------|-------|
| Analyze 20 videos | 2-3 min | Metadata extraction only |
| Edit 3 videos | 5-10 min | Depends on video length |
| Generate versions | 3-5 min | 3 formats per video |
| Publish | 1-2 min | Parallel API uploads |
| **Total** | **15-30 min** | Full campaign with 3 videos |

## Architecture

```
Input Videos (20)
    ↓
Phase 0: Brand Template (Claude AI)
    ↓
Phase 1: Analysis (FFprobe)
    ↓
Phase 2: Selection (Quality Filtering)
    ↓
Phase 3: Editing (FFmpeg)
    ↓
Phase 4: Design Generation (Claude AI)
    ↓
Phase 5: Version Creation (FFmpeg - 9:16, 1:1, 16:9)
    ↓
Phase 6: Marketing Copy (Claude AI)
    ↓
Phase 7: Publishing (Meta Graph API, Google Ads API, Twitter API v2)
    ↓
Output (Campaign Report + URLs)
```

## Support

- 📖 Full documentation: [README.md](./README.md)
- 📤 Publishing guide: [PUBLISHER_GUIDE.md](./PUBLISHER_GUIDE.md)
- 🐛 Troubleshooting: [README.md#troubleshooting](./README.md#troubleshooting)
- 💻 Code examples: See PUBLISHER_GUIDE.md

---

**Ready to get started?** Run: `npm run analyze -- --input-dir ./test-videos` 🚀
