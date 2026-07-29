import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logger, taskLogger } from './logger.js';
import config from './config.js';

/**
 * VideoAnalyzer - Analyze and score videos for campaign selection
 */
export class VideoAnalyzer {
  constructor() {
    this.videos = [];
    this.selectedVideos = [];
  }

  /**
   * Analyze all videos in a directory
   */
  async analyzeDirectory(directoryPath) {
    taskLogger.start('video_analysis', { directory: directoryPath });

    try {
      const dir = path.resolve(directoryPath);

      if (!fs.existsSync(dir)) {
        throw new Error(`Directory not found: ${directoryPath}`);
      }

      // Get all video files
      const videoFiles = fs.readdirSync(dir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.mov', '.avi', '.mkv', '.flv'].includes(ext);
      });

      logger.info({ count: videoFiles.length }, 'Found videos');

      // Analyze each video
      for (const file of videoFiles) {
        try {
          const filePath = path.resolve(dir, file);
          const metadata = await this._analyzeVideo(filePath);
          if (metadata) {
            this.videos.push(metadata);
          }
        } catch (error) {
          logger.error({ video: file, error: error.message }, 'Failed to analyze video');
        }
      }

      taskLogger.complete('video_analysis', { videosAnalyzed: this.videos.length });
      return this.videos;
    } catch (error) {
      taskLogger.failed('video_analysis', error);
      throw error;
    }
  }

  /**
   * Analyze a single video using ffprobe
   */
  async _analyzeVideo(videoPath) {
    logger.debug({ file: path.basename(videoPath) }, 'Analyzing video');

    try {
      const stats = fs.statSync(videoPath);
      const metadata = {
        filename: path.basename(videoPath),
        path: videoPath,
        fileSizeMB: stats.size / (1024 * 1024),
        duration: 0,
        fps: 0,
        resolution: { width: 0, height: 0 },
        bitrate: 0,
        codec: '',
        audioPresent: false,
        qualityScore: 0,
        audioQualityScore: 0,
        overallScore: 0,
      };

      // Extract metadata using ffprobe
      try {
        const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
        const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
        const data = JSON.parse(output);

        // Extract format info
        if (data.format) {
          metadata.duration = parseFloat(data.format.duration) || 0;
          metadata.bitrate = parseInt(data.format.bit_rate) || 0;
        }

        // Extract stream info
        for (const stream of data.streams || []) {
          if (stream.codec_type === 'video') {
            metadata.resolution = {
              width: stream.width || 0,
              height: stream.height || 0,
            };
            metadata.codec = stream.codec_name || '';
            // Calculate FPS
            if (stream.r_frame_rate) {
              const [num, den] = stream.r_frame_rate.split('/');
              metadata.fps = parseInt(num) / parseInt(den);
            }
          } else if (stream.codec_type === 'audio') {
            metadata.audioPresent = true;
          }
        }
      } catch (error) {
        logger.warn({ error: error.message }, 'ffprobe extraction failed');
      }

      // Calculate quality scores
      metadata.qualityScore = this._calculateQualityScore(metadata);
      metadata.audioQualityScore = this._estimateAudioQuality(metadata);
      metadata.overallScore = metadata.qualityScore * 0.7 + metadata.audioQualityScore * 0.3;

      logger.debug(
        {
          file: metadata.filename,
          quality: metadata.qualityScore.toFixed(3),
          audio: metadata.audioQualityScore.toFixed(3),
          overall: metadata.overallScore.toFixed(3),
        },
        'Video scored'
      );

      return metadata;
    } catch (error) {
      logger.error({ file: path.basename(videoPath), error: error.message }, 'Video analysis failed');
      return null;
    }
  }

  /**
   * Calculate quality score based on technical metrics
   */
  _calculateQualityScore(metadata) {
    let score = 0;

    // Resolution scoring (max 40 points)
    if (metadata.resolution.height >= 1080) {
      score += 40;
    } else if (metadata.resolution.height >= 720) {
      score += 30;
    } else if (metadata.resolution.height >= 480) {
      score += 20;
    } else {
      score += 10;
    }

    // FPS scoring (max 30 points)
    if (metadata.fps >= 30) {
      score += 30;
    } else if (metadata.fps >= 24) {
      score += 25;
    } else if (metadata.fps >= 15) {
      score += 15;
    } else {
      score += 5;
    }

    // Bitrate scoring (max 20 points)
    if (metadata.bitrate >= 5000000) {
      score += 20;
    } else if (metadata.bitrate >= 2000000) {
      score += 15;
    } else if (metadata.bitrate >= 1000000) {
      score += 10;
    } else {
      score += 5;
    }

    // Duration appropriateness (max 10 points)
    if (metadata.duration >= 10 && metadata.duration <= 120) {
      score += 10;
    } else if (metadata.duration < 10) {
      score += 2;
    } else if (metadata.duration > 300) {
      score += 3;
    } else {
      score += 8;
    }

    // Normalize to 0-1
    return Math.min(score / 100, 1.0);
  }

  /**
   * Estimate audio quality (simplified)
   */
  _estimateAudioQuality(metadata) {
    if (!metadata.audioPresent) {
      return 0.3;
    }
    // Default to 0.7 if audio is present
    return 0.7;
  }

  /**
   * Select top N videos by score
   */
  selectTopVideos(count = 3) {
    taskLogger.start('video_selection', { count, total: this.videos.length });

    try {
      if (this.videos.length < count) {
        logger.warn(
          { requested: count, available: this.videos.length },
          'Not enough videos for selection'
        );
        count = this.videos.length;
      }

      // Sort by overall score (descending)
      const sorted = [...this.videos].sort((a, b) => b.overallScore - a.overallScore);

      // Filter by minimum quality
      const filtered = sorted.filter(v => v.qualityScore >= config.videoAnalysis.minQualityScore);

      if (filtered.length < count) {
        logger.warn(
          { threshold: config.videoAnalysis.minQualityScore, available: filtered.length },
          'Not enough videos meet quality threshold'
        );
      }

      this.selectedVideos = filtered.slice(0, count);

      const topScores = this.selectedVideos.map(v => v.overallScore.toFixed(3));
      taskLogger.complete('video_selection', {
        selected: this.selectedVideos.length,
        topScores,
      });

      return this.selectedVideos;
    } catch (error) {
      taskLogger.failed('video_selection', error);
      throw error;
    }
  }

  /**
   * Get analysis report
   */
  getAnalysisReport() {
    if (this.videos.length === 0) {
      return { status: 'no_videos_analyzed' };
    }

    const scores = this.videos.map(v => v.overallScore);
    const qualityScores = this.videos.map(v => v.qualityScore);
    const audioScores = this.videos.map(v => v.audioQualityScore);

    // Resolution distribution
    const resolutionDist = {};
    for (const video of this.videos) {
      const height = video.resolution.height;
      let key = 'lower';
      if (height >= 1080) key = '1080p+';
      else if (height >= 720) key = '720p';
      else if (height >= 480) key = '480p';
      resolutionDist[key] = (resolutionDist[key] || 0) + 1;
    }

    return {
      totalVideos: this.videos.length,
      selectedVideos: this.selectedVideos.length,
      overallStats: {
        avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0,
        maxScore: scores.length > 0 ? Math.max(...scores) : 0,
        minScore: scores.length > 0 ? Math.min(...scores) : 0,
      },
      qualityStats: {
        avgQuality: qualityScores.length > 0 ? qualityScores.reduce((a, b) => a + b) / qualityScores.length : 0,
        avgAudio: audioScores.length > 0 ? audioScores.reduce((a, b) => a + b) / audioScores.length : 0,
      },
      resolutionDistribution: resolutionDist,
      durationRange: {
        min: Math.min(...this.videos.map(v => v.duration)),
        max: Math.max(...this.videos.map(v => v.duration)),
        avg: this.videos.reduce((sum, v) => sum + v.duration, 0) / this.videos.length,
      },
    };
  }

  /**
   * Export analysis to JSON
   */
  exportAnalysis(outputPath) {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        totalVideos: this.videos.length,
        selectedVideos: this.selectedVideos.length,
        videos: this.videos.map(v => ({
          filename: v.filename,
          duration: v.duration,
          resolution: `${v.resolution.width}x${v.resolution.height}`,
          fps: v.fps.toFixed(2),
          bitrate: v.bitrate,
          qualityScore: v.qualityScore.toFixed(3),
          audioScore: v.audioQualityScore.toFixed(3),
          overallScore: v.overallScore.toFixed(3),
        })),
        selected: this.selectedVideos.map(v => v.filename),
        report: this.getAnalysisReport(),
      };

      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      logger.info({ path: outputPath }, 'Analysis exported');

      return outputPath;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to export analysis');
      throw error;
    }
  }
}

export default VideoAnalyzer;
