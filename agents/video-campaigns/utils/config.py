"""Configuration management for Video Campaign Agent"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class VideoAnalysisConfig:
    """Configuration for video analysis"""
    min_quality_score: float = 0.6
    min_audio_quality: float = 0.7
    min_resolution: int = 720  # minimum height in pixels
    max_duration: int = 300  # 5 minutes
    min_duration: int = 5    # 5 seconds


@dataclass
class VideoEditingConfig:
    """Configuration for video editing"""
    intro_duration: int = 3  # seconds
    outro_duration: int = 2  # seconds
    target_resolution: Dict[str, tuple] = None
    output_format: str = "mp4"

    def __post_init__(self):
        if self.target_resolution is None:
            self.target_resolution = {
                "vertical": (1080, 1920),      # 9:16 for Stories
                "square": (1080, 1080),        # 1:1 for Feed
                "horizontal": (1920, 1080)     # 16:9 for Ads
            }


@dataclass
class BrandingConfig:
    """Configuration for branding and design"""
    brand_name: str = "Default Brand"
    primary_color: str = "#0066CC"
    secondary_color: str = "#FFB400"
    font_family: str = "Arial"
    logo_path: Optional[str] = None
    include_watermark: bool = True
    cta_text: str = "Learn More"


@dataclass
class PlatformConfig:
    """Configuration for publishing platforms"""
    meta_enabled: bool = True
    google_ads_enabled: bool = True
    twitter_enabled: bool = True

    # Meta
    meta_access_token: Optional[str] = None
    meta_business_id: Optional[str] = None

    # Google Ads
    google_ads_developer_token: Optional[str] = None
    google_ads_customer_id: Optional[str] = None

    # Twitter
    twitter_bearer_token: Optional[str] = None
    twitter_api_key: Optional[str] = None
    twitter_api_secret: Optional[str] = None


class AgentConfig:
    """Main configuration for the Video Campaign Agent"""

    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.data_path = self.base_path / "data"
        self.templates_path = self.base_path / "templates"
        self.output_path = self.base_path / "output"

        # Create directories if they don't exist
        self.data_path.mkdir(exist_ok=True)
        self.templates_path.mkdir(exist_ok=True)
        self.output_path.mkdir(exist_ok=True)

        # Load configurations
        self.video_analysis = VideoAnalysisConfig()
        self.video_editing = VideoEditingConfig()
        self.branding = BrandingConfig(
            brand_name=os.getenv("BRAND_NAME", "Default Brand"),
            primary_color=os.getenv("PRIMARY_COLOR", "#0066CC"),
            secondary_color=os.getenv("SECONDARY_COLOR", "#FFB400"),
            logo_path=os.getenv("LOGO_PATH")
        )

        self.platforms = PlatformConfig(
            meta_access_token=os.getenv("META_ACCESS_TOKEN"),
            meta_business_id=os.getenv("META_BUSINESS_ID"),
            google_ads_developer_token=os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
            google_ads_customer_id=os.getenv("GOOGLE_ADS_CUSTOMER_ID"),
            twitter_bearer_token=os.getenv("TWITTER_BEARER_TOKEN"),
            twitter_api_key=os.getenv("TWITTER_API_KEY"),
            twitter_api_secret=os.getenv("TWITTER_API_SECRET")
        )

        # Claude API configuration
        self.claude_api_key = os.getenv("CLAUDE_API_KEY")
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")

        # Agent configuration
        self.max_videos: int = int(os.getenv("MAX_VIDEOS", "20"))
        self.videos_to_select: int = int(os.getenv("VIDEOS_TO_SELECT", "3"))
        self.versions_per_video: int = int(os.getenv("VERSIONS_PER_VIDEO", "3"))
        self.auto_publish: bool = os.getenv("AUTO_PUBLISH", "true").lower() == "true"
        self.enable_logging: bool = os.getenv("ENABLE_LOGGING", "true").lower() == "true"

    def validate(self) -> bool:
        """Validate that all required configurations are present"""
        errors = []

        if not self.claude_api_key:
            errors.append("CLAUDE_API_KEY not set")

        if self.platforms.meta_enabled:
            if not self.platforms.meta_access_token:
                errors.append("META_ACCESS_TOKEN required for Meta publishing")
            if not self.platforms.meta_business_id:
                errors.append("META_BUSINESS_ID required for Meta publishing")

        if self.platforms.google_ads_enabled:
            if not self.platforms.google_ads_developer_token:
                errors.append("GOOGLE_ADS_DEVELOPER_TOKEN required for Google Ads")

        if self.platforms.twitter_enabled:
            if not self.platforms.twitter_bearer_token:
                errors.append("TWITTER_BEARER_TOKEN required for Twitter publishing")

        if errors:
            for error in errors:
                print(f"❌ {error}")
            return False

        return True

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary (for logging/debugging)"""
        return {
            "paths": {
                "base": str(self.base_path),
                "data": str(self.data_path),
                "templates": str(self.templates_path),
                "output": str(self.output_path)
            },
            "video_analysis": {
                "min_quality_score": self.video_analysis.min_quality_score,
                "min_audio_quality": self.video_analysis.min_audio_quality,
                "min_resolution": self.video_analysis.min_resolution
            },
            "branding": {
                "name": self.branding.brand_name,
                "primary_color": self.branding.primary_color,
                "secondary_color": self.branding.secondary_color
            },
            "platforms": {
                "meta": self.platforms.meta_enabled,
                "google_ads": self.platforms.google_ads_enabled,
                "twitter": self.platforms.twitter_enabled
            },
            "agent": {
                "max_videos": self.max_videos,
                "videos_to_select": self.videos_to_select,
                "versions_per_video": self.versions_per_video,
                "auto_publish": self.auto_publish
            }
        }


# Global config instance
config = AgentConfig()
