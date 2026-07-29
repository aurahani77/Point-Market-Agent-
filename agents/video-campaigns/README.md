# 🎬 Video Editing & Campaign Automation Agent

A comprehensive AI agent for analyzing, editing, and publishing video campaigns across Meta, Google Ads, and Twitter.

## 🚀 Features

### Video Analysis
- ✅ Analyze 20+ videos in batch
- ✅ Score videos based on quality metrics (resolution, fps, bitrate, audio)
- ✅ Automatic selection of top 3 videos
- ✅ Detailed quality reports

### Video Editing
- ✅ Extract best segments from videos
- ✅ Generate AI-powered Intro/Outro sequences
- ✅ Add branding (logos, watermarks, colors)
- ✅ Optimize for multiple platforms

### Design & Branding
- ✅ Apply consistent brand identity
- ✅ Generate design templates with AI
- ✅ Multiple design styles (professional, energetic, minimal, playful)
- ✅ Customizable colors, fonts, and logos

### Version Generation
- ✅ **Vertical (9:16)**: Instagram Stories, Reels, TikTok
- ✅ **Square (1:1)**: Instagram Feed, Facebook Feed
- ✅ **Horizontal (16:9)**: YouTube, Google Ads

### Publishing
- ✅ Meta (Facebook/Instagram) - via Graph API
- ✅ Google Ads - via Google Ads API
- ✅ Twitter/X - via Twitter API v2
- ✅ Batch uploading with status tracking
- ✅ Automatic link generation

---

## 📋 Installation

### Prerequisites
- Python 3.8+
- FFmpeg (for video processing)
- Git

### Setup

1. **Clone & Navigate**
```bash
cd Point-Market-Agent-/agents/video-campaigns
```

2. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

5. **Verify Installation**
```bash
python -c "from modules.video_analyzer import VideoAnalyzer; print('✅ Installation successful')"
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

### Brand Configuration (templates/brand_defaults.json)
```json
{
  "brand_defaults": {
    "colors": {
      "primary": "#0066CC",
      "secondary": "#FFB400",
      "accent": "#FF6B35"
    },
    "typography": {
      "font_family_primary": "Arial",
      "sizes": {
        "heading_1": 72,
        "body": 24
      }
    }
  }
}
```

---

## 🎯 Quick Start

### Basic Usage

```python
from agents.video_campaigns.modules.video_analyzer import VideoAnalyzer
from agents.video_campaigns.modules.video_editor import VideoEditor
from agents.video_campaigns.modules.publisher import Publisher
from pathlib import Path

# 1. Analyze videos
analyzer = VideoAnalyzer()
videos = analyzer.analyze_directory(Path("input_videos/"))
top_videos = analyzer.select_top_videos(count=3)

# 2. Edit videos
editor = VideoEditor()
for video in top_videos:
    edited = editor.add_branding(video)
    editor.add_intro_outro(edited)

# 3. Create versions
for video in top_videos:
    editor.create_vertical_version(video)    # 9:16
    editor.create_square_version(video)      # 1:1
    editor.create_horizontal_version(video)  # 16:9

# 4. Publish
publisher = Publisher()
for video in top_videos:
    publisher.publish_to_meta(video)
    publisher.publish_to_google_ads(video)
    publisher.publish_to_twitter(video)
```

### Command Line Usage

```bash
# Run full pipeline
python agent.py --input-dir ./videos --mode full --auto-publish

# Analyze only
python agent.py --input-dir ./videos --mode analyze

# Edit only
python agent.py --input-dir ./videos --mode edit

# Publish only
python agent.py --input-dir ./videos --mode publish
```

---

## 📂 Project Structure

```
agents/video-campaigns/
├── agent.py                 # Main orchestration script
├── requirements.txt         # Python dependencies
├── .env.example             # Environment template
├── README.md               # This file
│
├── modules/
│   ├── video_analyzer.py    # Video analysis & scoring
│   ├── video_editor.py      # Editing, branding, effects
│   ├── design_generator.py  # AI design template creation
│   ├── version_creator.py   # Multi-resolution versions
│   └── publisher.py         # Platform publishing
│
├── utils/
│   ├── config.py            # Configuration management
│   ├── logger.py            # Logging & tracking
│   └── helpers.py           # Utility functions
│
├── templates/
│   ├── intro_template.json   # Intro animation specs
│   ├── outro_template.json   # Outro animation specs
│   └── brand_defaults.json   # Default branding
│
├── data/                    # Working directory (git-ignored)
├── output/                  # Generated videos (git-ignored)
└── tests/                   # Unit tests
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

### Step 3: Video Editing
```
Input: Top 3 videos + brand guidelines
    ↓
Process:
  - Extract best segments
  - Generate Intro/Outro (AI-powered)
  - Apply branding (logo, watermark, colors)
  - Color correction (optional)
    ↓
Output: 3 branded, edited videos
```

### Step 4: Version Generation
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

### Step 5: Publishing
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
  - Performance metrics
```

---

## 🎨 Design Styles

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

## 📊 Analysis & Reports

### Video Analysis Report
```json
{
  "total_videos": 20,
  "selected_videos": 3,
  "overall_stats": {
    "avg_score": 0.78,
    "max_score": 0.92,
    "min_score": 0.45
  },
  "quality_stats": {
    "avg_quality": 0.82,
    "avg_audio": 0.71
  },
  "resolution_distribution": {
    "1080p+": 15,
    "720p": 5
  }
}
```

### Campaign Tracking
- Video analysis logs
- Editing progress
- Publishing status
- Platform-specific URLs
- Performance metrics (coming soon)

---

## 🔧 API Configuration

### Meta (Facebook/Instagram)

```python
from modules.publisher import MetaPublisher

publisher = MetaPublisher(
    access_token="your_token",
    business_id="your_business_id"
)

# Publish to Instagram Reels
url = publisher.publish_reels(video_path, caption="Your caption")

# Publish to Facebook Feed
url = publisher.publish_feed(video_path, caption="Your caption")
```

### Google Ads

```python
from modules.publisher import GoogleAdsPublisher

publisher = GoogleAdsPublisher(
    developer_token="your_token",
    customer_id="your_customer_id"
)

# Upload video asset
asset_id = publisher.upload_video(video_path)

# Create video ad
campaign = publisher.create_video_ad(asset_id, campaign_name="Spring Sale")
```

### Twitter/X

```python
from modules.publisher import TwitterPublisher

publisher = TwitterPublisher(bearer_token="your_token")

# Tweet with video
tweet_id = publisher.post_video(video_path, text="Check out our new video!")
```

---

## 📝 Logging

All operations are logged to `logs/` directory:
- Timestamp
- Operation type
- Status (INFO, SUCCESS, WARNING, ERROR)
- Relevant data/errors

```
✅ [SUCCESS] Task complete: video_analysis
  - Videos analyzed: 20
  - Selected: 3
  - Avg score: 0.78

⚠️  [WARNING] Not enough videos meet quality threshold
  - Threshold: 0.60
  - Available: 18
```

---

## 🚨 Error Handling

The agent handles common issues:
- ✅ Missing video files
- ✅ API failures (with retry logic)
- ✅ Insufficient disk space
- ✅ Invalid API credentials
- ✅ Network timeouts
- ✅ Format compatibility issues

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| moviepy | 1.0.3 | Video editing |
| opencv-python | 4.8 | Video processing |
| ffmpeg-python | 0.2 | FFmpeg integration |
| anthropic | 0.7+ | Claude API |
| requests | 2.31 | HTTP requests |
| facebook-sdk | 3.0 | Meta API |
| google-ads | 21.0 | Google Ads API |
| tweepy | 4.14 | Twitter API |

---

## 🤝 Integration with Claude

This agent is designed to work with Claude API for:
- **Vision Analysis**: Using Claude to analyze video frames
- **Content Generation**: Creating captions and CTAs
- **Decision Making**: Smart selection and optimization
- **Error Recovery**: Intelligent problem-solving

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

### API Authentication Errors
- Verify all tokens in `.env`
- Check token expiration dates
- Ensure OAuth scopes are correct
- Re-authenticate if needed

### Out of Disk Space
```bash
# Clean up output directory
rm -rf agents/video-campaigns/output/*

# Check disk space
df -h
```

### Video Encoding Issues
- Ensure input videos are in supported formats (MP4, MOV, AVI)
- Check that resolution is within limits (720p - 4K)
- Verify audio codec is compatible

---

## 🎯 Advanced Usage

### Custom Brand Identity
```python
from utils.config import BrandingConfig

brand = BrandingConfig(
    brand_name="My Brand",
    primary_color="#FF0000",
    secondary_color="#00FF00",
    logo_path="./logo.png",
    cta_text="Shop Now"
)
```

### Selective Publishing
```python
# Only publish to specific platforms
publisher = Publisher()
for video in videos:
    if publish_to_meta:
        publisher.publish_to_meta(video)
    if publish_to_google:
        publisher.publish_to_google_ads(video)
    if publish_to_twitter:
        publisher.publish_to_twitter(video)
```

### Custom Scoring
```python
# Override default scoring algorithm
class CustomAnalyzer(VideoAnalyzer):
    def _calculate_quality_score(self, metadata):
        # Your custom logic here
        pass

analyzer = CustomAnalyzer()
```

---

## 📈 Performance Metrics

Typical processing times (for 20 videos):
- **Analysis**: 2-3 minutes
- **Editing**: 10-15 minutes (depending on video length)
- **Version Generation**: 5-10 minutes
- **Publishing**: 3-5 minutes
- **Total**: ~30 minutes

---

## 🚀 Next Steps

1. Set up environment variables
2. Test with sample videos
3. Configure brand guidelines
4. Customize templates
5. Run full pipeline
6. Monitor logs and metrics
7. Iterate and optimize

---

## 📄 License

This project is part of Point-Market-Agent-. All rights reserved.

---

## 📧 Support

For issues or questions:
1. Check logs in `logs/` directory
2. Review this README
3. Consult the AGENT_PLAN.md for architecture details
4. Create an issue in the repository

---

**Created**: 2026-07-29  
**Version**: 1.0.0-alpha  
**Status**: 🚧 In Development
