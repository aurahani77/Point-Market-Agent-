"""Video Analysis Module - Analyzes and scores videos for campaign selection"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import subprocess

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

from ..utils.config import config
from ..utils.logger import logger


@dataclass
class VideoMetadata:
    """Store video metadata and analysis results"""
    filename: str
    path: Path
    duration: float
    fps: int
    resolution: Tuple[int, int]
    bitrate: int
    codec: str
    file_size: float
    audio_present: bool
    quality_score: float = 0.0
    audio_quality_score: float = 0.0
    overall_score: float = 0.0
    notes: str = ""


class VideoAnalyzer:
    """Analyze and score videos for campaign use"""

    def __init__(self):
        self.logger = logger
        self.config = config
        self.videos: List[VideoMetadata] = []
        self.selected_videos: List[VideoMetadata] = []

    def analyze_directory(self, directory: Path) -> List[VideoMetadata]:
        """Analyze all videos in a directory"""
        self.logger.task_start("video_analysis", {"directory": str(directory)})

        video_files = list(directory.glob("**/*.mp4")) + list(directory.glob("**/*.mov")) + list(directory.glob("**/*.avi"))

        self.logger.info(f"Found {len(video_files)} video files", {"count": len(video_files)})

        for video_path in video_files:
            try:
                metadata = self._analyze_single_video(video_path)
                if metadata:
                    self.videos.append(metadata)
            except Exception as e:
                self.logger.error(f"Failed to analyze {video_path.name}", {"error": str(e)})

        self.logger.task_complete("video_analysis", {"videos_analyzed": len(self.videos)})
        return self.videos

    def _analyze_single_video(self, video_path: Path) -> Optional[VideoMetadata]:
        """Analyze a single video file"""
        self.logger.debug(f"Analyzing: {video_path.name}")

        metadata = VideoMetadata(
            filename=video_path.name,
            path=video_path,
            duration=0.0,
            fps=0,
            resolution=(0, 0),
            bitrate=0,
            codec="",
            file_size=0.0,
            audio_present=False
        )

        # Get file size
        metadata.file_size = video_path.stat().st_size / (1024 * 1024)  # MB

        # Use ffprobe to get metadata
        try:
            metadata = self._extract_ffprobe_metadata(video_path, metadata)
        except Exception as e:
            self.logger.warning(f"ffprobe failed for {video_path.name}: {str(e)}")

        # Score the video
        metadata.quality_score = self._calculate_quality_score(metadata)
        metadata.audio_quality_score = self._estimate_audio_quality(metadata)
        metadata.overall_score = (metadata.quality_score * 0.7 + metadata.audio_quality_score * 0.3)

        self.logger.debug(
            f"Video scored: {video_path.name}",
            {
                "quality": metadata.quality_score,
                "audio": metadata.audio_quality_score,
                "overall": metadata.overall_score
            }
        )

        return metadata

    def _extract_ffprobe_metadata(self, video_path: Path, metadata: VideoMetadata) -> VideoMetadata:
        """Extract metadata using ffprobe"""
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                str(video_path)
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            data = json.loads(result.stdout)

            # Extract duration
            metadata.duration = float(data.get("format", {}).get("duration", 0))

            # Extract stream information
            for stream in data.get("streams", []):
                if stream["codec_type"] == "video":
                    metadata.fps = eval(stream.get("r_frame_rate", "0/1"))
                    metadata.resolution = (stream.get("width", 0), stream.get("height", 0))
                    metadata.codec = stream.get("codec_name", "")
                elif stream["codec_type"] == "audio":
                    metadata.audio_present = True

            # Extract bitrate (bits per second)
            metadata.bitrate = int(data.get("format", {}).get("bit_rate", 0))

        except Exception as e:
            self.logger.debug(f"ffprobe extraction failed: {str(e)}")
            raise

        return metadata

    def _calculate_quality_score(self, metadata: VideoMetadata) -> float:
        """Calculate video quality score based on technical metrics"""
        score = 0.0

        # Resolution scoring (max 40 points)
        if metadata.resolution[1] >= 1080:
            score += 40
        elif metadata.resolution[1] >= 720:
            score += 30
        elif metadata.resolution[1] >= 480:
            score += 20
        else:
            score += 10

        # FPS scoring (max 30 points)
        if metadata.fps >= 30:
            score += 30
        elif metadata.fps >= 24:
            score += 25
        elif metadata.fps >= 15:
            score += 15
        else:
            score += 5

        # Bitrate scoring (max 20 points)
        if metadata.bitrate >= 5000000:  # 5 Mbps
            score += 20
        elif metadata.bitrate >= 2000000:  # 2 Mbps
            score += 15
        elif metadata.bitrate >= 1000000:  # 1 Mbps
            score += 10
        else:
            score += 5

        # Duration appropriateness (max 10 points)
        if 10 <= metadata.duration <= 120:  # 10 seconds to 2 minutes
            score += 10
        elif metadata.duration < 10:
            score += 2
        elif metadata.duration > 300:  # Over 5 minutes
            score += 3
        else:
            score += 8

        # Normalize to 0-1
        return min(score / 100, 1.0)

    def _estimate_audio_quality(self, metadata: VideoMetadata) -> float:
        """Estimate audio quality (simplified)"""
        if not metadata.audio_present:
            return 0.3

        # Audio quality is harder to assess without analysis
        # Default to 0.7 if audio is present
        return 0.7

    def select_top_videos(self, count: int = 3) -> List[VideoMetadata]:
        """Select top N videos by score"""
        self.logger.task_start("video_selection", {"count": count, "total": len(self.videos)})

        if len(self.videos) < count:
            self.logger.warning(
                f"Requested {count} videos but only {len(self.videos)} available",
                {"requested": count, "available": len(self.videos)}
            )
            count = len(self.videos)

        # Sort by overall score (descending)
        sorted_videos = sorted(self.videos, key=lambda v: v.overall_score, reverse=True)

        # Filter by minimum quality
        filtered_videos = [
            v for v in sorted_videos
            if v.quality_score >= self.config.video_analysis.min_quality_score
        ]

        if len(filtered_videos) < count:
            self.logger.warning(
                "Not enough videos meet quality threshold, using available",
                {"threshold": self.config.video_analysis.min_quality_score, "available": len(filtered_videos)}
            )

        self.selected_videos = filtered_videos[:count]

        self.logger.task_complete("video_selection", {
            "selected": len(self.selected_videos),
            "top_scores": [round(v.overall_score, 3) for v in self.selected_videos]
        })

        return self.selected_videos

    def get_analysis_report(self) -> Dict[str, Any]:
        """Generate analysis report"""
        if not self.videos:
            return {"status": "no_videos_analyzed"}

        scores = [v.overall_score for v in self.videos]
        quality_scores = [v.quality_score for v in self.videos]
        audio_scores = [v.audio_quality_score for v in self.videos]

        return {
            "total_videos": len(self.videos),
            "selected_videos": len(self.selected_videos),
            "overall_stats": {
                "avg_score": sum(scores) / len(scores) if scores else 0,
                "max_score": max(scores) if scores else 0,
                "min_score": min(scores) if scores else 0
            },
            "quality_stats": {
                "avg_quality": sum(quality_scores) / len(quality_scores) if quality_scores else 0,
                "avg_audio": sum(audio_scores) / len(audio_scores) if audio_scores else 0
            },
            "resolution_distribution": self._get_resolution_distribution(),
            "duration_range": {
                "min": min(v.duration for v in self.videos) if self.videos else 0,
                "max": max(v.duration for v in self.videos) if self.videos else 0,
                "avg": sum(v.duration for v in self.videos) / len(self.videos) if self.videos else 0
            }
        }

    def _get_resolution_distribution(self) -> Dict[str, int]:
        """Get distribution of video resolutions"""
        distribution = {}
        for video in self.videos:
            height = video.resolution[1]
            if height >= 1080:
                key = "1080p+"
            elif height >= 720:
                key = "720p"
            elif height >= 480:
                key = "480p"
            else:
                key = "lower"
            distribution[key] = distribution.get(key, 0) + 1
        return distribution

    def export_analysis(self, output_path: Path) -> None:
        """Export analysis results to JSON"""
        output_path.parent.mkdir(parents=True, exist_ok=True)

        data = {
            "timestamp": datetime.now().isoformat(),
            "total_videos": len(self.videos),
            "selected_videos": len(self.selected_videos),
            "videos": [
                {
                    "filename": v.filename,
                    "duration": v.duration,
                    "resolution": f"{v.resolution[0]}x{v.resolution[1]}",
                    "fps": v.fps,
                    "bitrate": v.bitrate,
                    "quality_score": round(v.quality_score, 3),
                    "audio_score": round(v.audio_quality_score, 3),
                    "overall_score": round(v.overall_score, 3)
                }
                for v in sorted(self.videos, key=lambda v: v.overall_score, reverse=True)
            ],
            "selected": [v.filename for v in self.selected_videos],
            "report": self.get_analysis_report()
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        self.logger.success(f"Analysis exported to {output_path.name}")
