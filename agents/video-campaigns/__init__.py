"""Video Editing & Campaign Automation Agent Package"""

__version__ = "1.0.0-alpha"
__author__ = "Point Market Agent Team"
__description__ = "AI-powered agent for video editing, branding, and multi-platform campaign automation"

from .utils.config import config
from .utils.logger import logger, CampaignTracker
from .modules.video_analyzer import VideoAnalyzer

__all__ = [
    "config",
    "logger",
    "CampaignTracker",
    "VideoAnalyzer"
]
