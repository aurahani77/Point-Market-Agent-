"""Logging and tracking utilities"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional
from enum import Enum


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    ERROR = "ERROR"


class Logger:
    """Simple logging system for the campaign agent"""

    def __init__(self, log_file: Optional[Path] = None):
        self.log_file = log_file or Path(__file__).parent.parent / "logs" / f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        self.log_file.parent.mkdir(exist_ok=True)
        self.events = []

    def _format_message(self, level: LogLevel, message: str, data: Optional[Dict[str, Any]] = None) -> str:
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": level.value,
            "message": message,
            "data": data or {}
        }
        return json.dumps(log_entry, ensure_ascii=False)

    def _write(self, level: LogLevel, message: str, data: Optional[Dict[str, Any]] = None):
        formatted = self._format_message(level, message, data)
        self.events.append(formatted)

        # Print to console with emoji
        emojis = {
            LogLevel.DEBUG: "🔍",
            LogLevel.INFO: "ℹ️ ",
            LogLevel.SUCCESS: "✅",
            LogLevel.WARNING: "⚠️ ",
            LogLevel.ERROR: "❌"
        }
        print(f"{emojis.get(level, '•')} [{level.value}] {message}")

        # Write to file
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")

    def debug(self, message: str, data: Optional[Dict[str, Any]] = None):
        self._write(LogLevel.DEBUG, message, data)

    def info(self, message: str, data: Optional[Dict[str, Any]] = None):
        self._write(LogLevel.INFO, message, data)

    def success(self, message: str, data: Optional[Dict[str, Any]] = None):
        self._write(LogLevel.SUCCESS, message, data)

    def warning(self, message: str, data: Optional[Dict[str, Any]] = None):
        self._write(LogLevel.WARNING, message, data)

    def error(self, message: str, data: Optional[Dict[str, Any]] = None):
        self._write(LogLevel.ERROR, message, data)

    def task_start(self, task_name: str, details: Optional[Dict[str, Any]] = None):
        """Log the start of a task"""
        msg = f"🚀 Task started: {task_name}"
        self.info(msg, details)

    def task_complete(self, task_name: str, results: Optional[Dict[str, Any]] = None):
        """Log the completion of a task"""
        msg = f"✓ Task complete: {task_name}"
        self.success(msg, results)

    def task_failed(self, task_name: str, error: str, details: Optional[Dict[str, Any]] = None):
        """Log a task failure"""
        msg = f"✗ Task failed: {task_name} - {error}"
        error_data = details or {}
        error_data["error"] = error
        self.error(msg, error_data)

    def export_json(self) -> Dict[str, Any]:
        """Export all logs as JSON"""
        logs = []
        for event_str in self.events:
            logs.append(json.loads(event_str))
        return {
            "export_time": datetime.now().isoformat(),
            "total_events": len(logs),
            "events": logs
        }

    def summary(self) -> Dict[str, int]:
        """Get summary of log levels"""
        summary = {level.value: 0 for level in LogLevel}
        for event_str in self.events:
            event = json.loads(event_str)
            level = event.get("level", "INFO")
            if level in summary:
                summary[level] += 1
        return summary


class CampaignTracker:
    """Track campaign progress and metrics"""

    def __init__(self, campaign_id: str):
        self.campaign_id = campaign_id
        self.start_time = datetime.now()
        self.videos_analyzed = 0
        self.videos_selected = 0
        self.videos_edited = 0
        self.versions_created = 0
        self.platforms_published = []
        self.errors: Dict[str, str] = {}
        self.links: Dict[str, list] = {
            "meta": [],
            "google_ads": [],
            "twitter": []
        }

    def add_video_analysis(self, video_name: str, score: float):
        self.videos_analyzed += 1

    def add_selected_video(self, video_name: str):
        self.videos_selected += 1

    def add_edited_video(self, video_name: str):
        self.videos_edited += 1

    def add_version(self, version_type: str):
        self.versions_created += 1

    def add_published_link(self, platform: str, url: str):
        if platform in self.links:
            self.links[platform].append(url)

    def add_error(self, component: str, error: str):
        self.errors[component] = error

    def to_dict(self) -> Dict[str, Any]:
        return {
            "campaign_id": self.campaign_id,
            "start_time": self.start_time.isoformat(),
            "duration_seconds": (datetime.now() - self.start_time).total_seconds(),
            "videos_analyzed": self.videos_analyzed,
            "videos_selected": self.videos_selected,
            "videos_edited": self.videos_edited,
            "versions_created": self.versions_created,
            "links": self.links,
            "errors": self.errors
        }


# Global logger instance
logger = Logger()
