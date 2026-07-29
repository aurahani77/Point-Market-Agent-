#!/usr/bin/env python3
"""
Video Editing & Campaign Automation Agent

Main orchestration script that manages the entire workflow:
1. Video Analysis & Selection
2. Video Editing & Branding
3. Version Generation
4. Publishing to platforms
"""

import argparse
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from modules.video_analyzer import VideoAnalyzer
from utils.config import config
from utils.logger import logger, CampaignTracker


class VideoEditingAgent:
    """Main agent for video editing and campaign automation"""

    def __init__(self, campaign_id: Optional[str] = None):
        self.campaign_id = campaign_id or f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.tracker = CampaignTracker(self.campaign_id)
        self.analyzer = VideoAnalyzer()
        self.config = config
        self.logger = logger

        self.logger.info("🤖 Video Editing Agent Initialized", {
            "campaign_id": self.campaign_id,
            "config": self.config.to_dict()
        })

    def run_full_pipeline(self, input_dir: Path, auto_publish: bool = True) -> dict:
        """Execute complete workflow: analyze → edit → version → publish"""
        self.logger.task_start("full_pipeline", {"input_dir": str(input_dir)})

        try:
            # Step 1: Analyze videos
            self.logger.info("📊 Phase 1: Video Analysis", {})
            videos = self.analyzer.analyze_directory(input_dir)

            if not videos:
                self.logger.error("No videos found in directory", {"directory": str(input_dir)})
                return {"status": "error", "message": "No videos found"}

            # Step 2: Select top videos
            self.logger.info("🎯 Phase 2: Video Selection", {})
            top_videos = self.analyzer.select_top_videos(self.config.videos_to_select)

            if not top_videos:
                self.logger.error("No videos passed quality threshold", {})
                return {"status": "error", "message": "No videos passed quality threshold"}

            # Export analysis
            analysis_path = self.config.output_path / f"{self.campaign_id}_analysis.json"
            self.analyzer.export_analysis(analysis_path)

            # TODO: Step 3: Edit videos
            self.logger.info("✂️  Phase 3: Video Editing", {"videos": len(top_videos)})
            # editor = VideoEditor()
            # for video in top_videos:
            #     editor.add_intro_outro(video)
            #     editor.apply_branding(video)

            # TODO: Step 4: Create versions
            self.logger.info("🎬 Phase 4: Version Generation", {"versions_per_video": self.config.versions_per_video})
            # for video in top_videos:
            #     editor.create_vertical_version(video)
            #     editor.create_square_version(video)
            #     editor.create_horizontal_version(video)

            # TODO: Step 5: Publish
            if auto_publish and self.config.auto_publish:
                self.logger.info("📤 Phase 5: Publishing", {"platforms": ["meta", "google_ads", "twitter"]})
                # publisher = Publisher()
                # for video in top_videos:
                #     publisher.publish_to_meta(video)
                #     publisher.publish_to_google_ads(video)
                #     publisher.publish_to_twitter(video)

            self.logger.task_complete("full_pipeline", self.tracker.to_dict())
            return {
                "status": "success",
                "campaign_id": self.campaign_id,
                "videos_analyzed": len(videos),
                "videos_selected": len(top_videos),
                "analysis_file": str(analysis_path)
            }

        except Exception as e:
            self.logger.task_failed("full_pipeline", str(e))
            self.tracker.add_error("full_pipeline", str(e))
            return {
                "status": "error",
                "campaign_id": self.campaign_id,
                "error": str(e)
            }

    def run_analysis_only(self, input_dir: Path) -> dict:
        """Run only the analysis phase"""
        self.logger.task_start("analysis_only", {"input_dir": str(input_dir)})

        try:
            videos = self.analyzer.analyze_directory(input_dir)
            top_videos = self.analyzer.select_top_videos(self.config.videos_to_select)

            # Export analysis
            analysis_path = self.config.output_path / f"{self.campaign_id}_analysis.json"
            self.analyzer.export_analysis(analysis_path)

            report = self.analyzer.get_analysis_report()

            self.logger.task_complete("analysis_only", report)

            return {
                "status": "success",
                "phase": "analysis",
                "videos_analyzed": len(videos),
                "videos_selected": len(top_videos),
                "report": report,
                "analysis_file": str(analysis_path)
            }

        except Exception as e:
            self.logger.task_failed("analysis_only", str(e))
            return {
                "status": "error",
                "phase": "analysis",
                "error": str(e)
            }

    def show_status(self) -> None:
        """Display campaign status"""
        print("\n" + "="*60)
        print(f"📊 Campaign Status: {self.campaign_id}")
        print("="*60)

        status = self.tracker.to_dict()
        print(f"Duration: {status['duration_seconds']:.1f}s")
        print(f"Videos Analyzed: {status['videos_analyzed']}")
        print(f"Videos Selected: {status['videos_selected']}")
        print(f"Videos Edited: {status['videos_edited']}")
        print(f"Versions Created: {status['versions_created']}")

        if status['links']['meta']:
            print(f"\nMeta Links ({len(status['links']['meta'])}):")
            for url in status['links']['meta']:
                print(f"  - {url}")

        if status['links']['google_ads']:
            print(f"\nGoogle Ads Links ({len(status['links']['google_ads'])}):")
            for url in status['links']['google_ads']:
                print(f"  - {url}")

        if status['links']['twitter']:
            print(f"\nTwitter Links ({len(status['links']['twitter'])}):")
            for url in status['links']['twitter']:
                print(f"  - {url}")

        if status['errors']:
            print(f"\n❌ Errors:")
            for component, error in status['errors'].items():
                print(f"  - {component}: {error}")

        print("\n" + "="*60 + "\n")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="🎬 Video Editing & Campaign Automation Agent"
    )

    parser.add_argument(
        "--input-dir",
        type=Path,
        required=True,
        help="Directory containing videos to process"
    )

    parser.add_argument(
        "--mode",
        choices=["full", "analyze", "edit", "publish"],
        default="full",
        help="Execution mode (default: full)"
    )

    parser.add_argument(
        "--campaign-id",
        type=str,
        help="Campaign ID (auto-generated if not provided)"
    )

    parser.add_argument(
        "--auto-publish",
        type=bool,
        default=True,
        help="Automatically publish videos (default: true)"
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )

    args = parser.parse_args()

    # Validate input directory
    if not args.input_dir.exists():
        print(f"❌ Error: Input directory not found: {args.input_dir}")
        sys.exit(1)

    # Initialize agent
    agent = VideoEditingAgent(campaign_id=args.campaign_id)

    # Validate configuration
    if not agent.config.validate():
        print("\n❌ Configuration validation failed. Please check your .env file.")
        sys.exit(1)

    # Run requested mode
    print(f"\n🎬 Starting {args.mode.upper()} mode...\n")

    if args.mode == "full":
        result = agent.run_full_pipeline(args.input_dir, auto_publish=args.auto_publish)
    elif args.mode == "analyze":
        result = agent.run_analysis_only(args.input_dir)
    else:
        print(f"❌ Mode '{args.mode}' not yet implemented")
        sys.exit(1)

    # Display results
    print(f"\n{'='*60}")
    print(f"Campaign ID: {result.get('campaign_id', 'unknown')}")
    print(f"Status: {result.get('status', 'unknown').upper()}")

    if result.get('status') == 'success':
        print(f"Videos Analyzed: {result.get('videos_analyzed', 0)}")
        print(f"Videos Selected: {result.get('videos_selected', 0)}")
        if 'analysis_file' in result:
            print(f"Analysis Report: {result.get('analysis_file')}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")

    print(f"{'='*60}\n")

    # Show full status if agent has tracker
    if hasattr(agent, 'tracker'):
        agent.show_status()

    sys.exit(0 if result.get('status') == 'success' else 1)


if __name__ == "__main__":
    main()
