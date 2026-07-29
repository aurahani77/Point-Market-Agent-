/**
 * VideoEditor.js - Complete Video Editing & Branding Module
 *
 * Handles:
 * - Adding intro/outro sequences
 * - Applying brand identity (logos, watermarks, colors)
 * - Optimizing video for different platforms
 * - Color correction and enhancement
 * - Video concatenation and effects
 */

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger, taskLogger } from './logger.js';
import config from './config.js';

export class VideoEditor {
  constructor() {
    this.logger = logger;
    this.config = config;
  }

  /**
   * Add intro and outro to a video
   * @param {string} videoPath - Path to input video
   * @param {string} introStyle - Style of intro (professional, energetic, minimal, playful)
   * @param {string} outroStyle - Style of outro (call_to_action, subscription, social_links)
   * @returns {Promise<string>} Path to edited video
   */
  async addIntroOutro(videoPath, introStyle = 'professional', outroStyle = 'call_to_action') {
    taskLogger.start('add_intro_outro', {
      video: path.basename(videoPath),
      introStyle,
      outroStyle,
    });

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video not found: ${videoPath}`);
      }

      // Create output directory if it doesn't exist
      if (!fs.existsSync(config.paths.output)) {
        fs.mkdirSync(config.paths.output, { recursive: true });
      }

      // Generate intro and outro videos
      const introPath = await this._generateIntroVideo(introStyle);
      const outroPath = await this._generateOutroVideo(outroStyle);

      // Concatenate: intro + main + outro
      const outputPath = path.join(
        config.paths.output,
        `${path.basename(videoPath, path.extname(videoPath))}_with_intro_outro.mp4`
      );

      await this._concatenateVideos([introPath, videoPath, outroPath], outputPath);

      // Clean up temporary files
      this._cleanupTempFiles([introPath, outroPath]);

      taskLogger.complete('add_intro_outro', { outputPath });
      return outputPath;
    } catch (error) {
      taskLogger.failed('add_intro_outro', error);
      throw error;
    }
  }

  /**
   * Apply brand identity to video
   * @param {string} videoPath - Path to input video
   * @param {boolean} watermark - Add watermark
   * @param {boolean} logo - Add logo
   * @param {string} logoPath - Path to logo file (optional)
   * @returns {Promise<string>} Path to branded video
   */
  async applyBranding(videoPath, watermark = true, logo = true, logoPath = null) {
    taskLogger.start('apply_branding', {
      video: path.basename(videoPath),
      watermark,
      logo,
    });

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video not found: ${videoPath}`);
      }

      let outputPath = videoPath;

      // Apply watermark
      if (watermark) {
        this.logger.info('Adding watermark');
        outputPath = await this._addWatermark(outputPath, this.config.brand.name);
      }

      // Apply logo
      if (logo && (logoPath || this.config.brand.logoPath)) {
        const logPath = logoPath || this.config.brand.logoPath;
        if (fs.existsSync(logPath)) {
          this.logger.info('Adding logo');
          outputPath = await this._addLogo(outputPath, logPath);
        }
      }

      taskLogger.complete('apply_branding', { outputPath });
      return outputPath;
    } catch (error) {
      taskLogger.failed('apply_branding', error);
      throw error;
    }
  }

  /**
   * Apply color correction to video
   * @param {string} videoPath - Path to input video
   * @param {string} preset - Color correction preset (warm, cool, vintage, vibrant)
   * @returns {Promise<string>} Path to corrected video
   */
  async applyColorCorrection(videoPath, preset = 'vibrant') {
    taskLogger.start('apply_color_correction', {
      video: path.basename(videoPath),
      preset,
    });

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video not found: ${videoPath}`);
      }

      const outputPath = path.join(
        config.paths.output,
        `${path.basename(videoPath, path.extname(videoPath))}_color_corrected.mp4`
      );

      // Define color correction filters
      const filters = this._getColorCorrectionFilter(preset);

      await this._applyFilters(videoPath, outputPath, filters);

      taskLogger.complete('apply_color_correction', { outputPath, preset });
      return outputPath;
    } catch (error) {
      taskLogger.failed('apply_color_correction', error);
      throw error;
    }
  }

  /**
   * Resize and crop video to specific dimensions
   * @param {string} videoPath - Path to input video
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @param {string} mode - Resize mode (crop, letterbox, pad)
   * @returns {Promise<string>} Path to resized video
   */
  async resizeVideo(videoPath, width, height, mode = 'letterbox') {
    taskLogger.start('resize_video', {
      video: path.basename(videoPath),
      dimensions: `${width}x${height}`,
      mode,
    });

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video not found: ${videoPath}`);
      }

      const outputPath = path.join(
        config.paths.output,
        `${path.basename(videoPath, path.extname(videoPath))}_${width}x${height}.mp4`
      );

      let filter;
      if (mode === 'crop') {
        // Crop to exact dimensions
        filter = this._getCropFilter(width, height);
      } else if (mode === 'pad') {
        // Add padding (letterbox)
        filter = this._getPadFilter(width, height);
      } else {
        // Scale (default)
        filter = `scale=${width}:${height}`;
      }

      await this._applyFilters(videoPath, outputPath, filter);

      taskLogger.complete('resize_video', { outputPath, mode });
      return outputPath;
    } catch (error) {
      taskLogger.failed('resize_video', error);
      throw error;
    }
  }

  /**
   * Create vertical version (9:16) for Stories/Reels
   * @param {string} videoPath - Path to source video
   * @returns {Promise<string>} Path to vertical version
   */
  async createVerticalVersion(videoPath) {
    this.logger.info('Creating vertical version (9:16)');
    const { width, height } = this.config.videoEditing.resolutions.vertical;
    return this.resizeVideo(videoPath, width, height, 'pad');
  }

  /**
   * Create square version (1:1) for Feed
   * @param {string} videoPath - Path to source video
   * @returns {Promise<string>} Path to square version
   */
  async createSquareVersion(videoPath) {
    this.logger.info('Creating square version (1:1)');
    const { width, height } = this.config.videoEditing.resolutions.square;
    return this.resizeVideo(videoPath, width, height, 'pad');
  }

  /**
   * Create horizontal version (16:9) for YouTube/Ads
   * @param {string} videoPath - Path to source video
   * @returns {Promise<string>} Path to horizontal version
   */
  async createHorizontalVersion(videoPath) {
    this.logger.info('Creating horizontal version (16:9)');
    const { width, height } = this.config.videoEditing.resolutions.horizontal;
    return this.resizeVideo(videoPath, width, height, 'pad');
  }

  /**
   * Extract a segment from a video
   * @param {string} videoPath - Path to input video
   * @param {number} startTime - Start time in seconds
   * @param {number} duration - Duration in seconds
   * @returns {Promise<string>} Path to extracted segment
   */
  async extractSegment(videoPath, startTime, duration) {
    taskLogger.start('extract_segment', {
      video: path.basename(videoPath),
      startTime,
      duration,
    });

    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video not found: ${videoPath}`);
      }

      const outputPath = path.join(
        config.paths.output,
        `${path.basename(videoPath, path.extname(videoPath))}_segment.mp4`
      );

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .setStartTime(startTime)
          .duration(duration)
          .output(outputPath)
          .on('end', () => {
            taskLogger.complete('extract_segment', { outputPath });
            resolve(outputPath);
          })
          .on('error', (err) => {
            taskLogger.failed('extract_segment', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      taskLogger.failed('extract_segment', error);
      throw error;
    }
  }

  /**
   * Generate intro video
   * @private
   */
  async _generateIntroVideo(style = 'professional') {
    this.logger.debug(`Generating intro video (${style})`);

    // Create a simple intro using FFmpeg
    // This creates a 3-second static image with text
    const duration = this.config.videoEditing.introDuration;
    const outputPath = path.join(config.paths.temp, `intro_${uuidv4()}.mp4`);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(config.paths.temp)) {
      fs.mkdirSync(config.paths.temp, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      // Create a color-based intro
      const filter = this._getIntroFilter(style);

      ffmpeg()
        .input('color=c=' + this._getIntroColor(style) + ':s=1080x1920:d=' + duration)
        .videoFilter(filter)
        .output(outputPath)
        .on('end', () => {
          this.logger.debug('Intro video generated');
          resolve(outputPath);
        })
        .on('error', (err) => {
          this.logger.error({ error: err.message }, 'Failed to generate intro');
          reject(err);
        })
        .run();
    });
  }

  /**
   * Generate outro video
   * @private
   */
  async _generateOutroVideo(style = 'call_to_action') {
    this.logger.debug(`Generating outro video (${style})`);

    const duration = this.config.videoEditing.outroDuration;
    const outputPath = path.join(config.paths.temp, `outro_${uuidv4()}.mp4`);

    if (!fs.existsSync(config.paths.temp)) {
      fs.mkdirSync(config.paths.temp, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const filter = this._getOutroFilter(style);
      const color = this._getOutroColor(style);

      ffmpeg()
        .input('color=c=' + color + ':s=1080x1920:d=' + duration)
        .videoFilter(filter)
        .output(outputPath)
        .on('end', () => {
          this.logger.debug('Outro video generated');
          resolve(outputPath);
        })
        .on('error', (err) => {
          this.logger.error({ error: err.message }, 'Failed to generate outro');
          reject(err);
        })
        .run();
    });
  }

  /**
   * Concatenate multiple videos
   * @private
   */
  async _concatenateVideos(videoPaths, outputPath) {
    this.logger.debug('Concatenating videos', { count: videoPaths.length });

    // Create concat file list
    const concatFile = path.join(config.paths.temp, `concat_${uuidv4()}.txt`);
    const concatContent = videoPaths.map(v => `file '${v}'`).join('\n');
    fs.writeFileSync(concatFile, concatContent);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFile)
        .inputOptions('-f', 'concat', '-safe', '0')
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => {
          fs.unlinkSync(concatFile);
          this.logger.debug('Videos concatenated');
          resolve(outputPath);
        })
        .on('error', (err) => {
          fs.unlinkSync(concatFile);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Add watermark to video
   * @private
   */
  async _addWatermark(videoPath, text) {
    this.logger.debug('Adding watermark', { text });

    const outputPath = path.join(
      config.paths.output,
      `${path.basename(videoPath, path.extname(videoPath))}_watermark.mp4`
    );

    const filter = `drawtext=text='${text}':x=w-tw-10:y=h-th-10:fontsize=24:fontcolor=white@0.3`;

    return this._applyFilters(videoPath, outputPath, filter);
  }

  /**
   * Add logo overlay
   * @private
   */
  async _addLogo(videoPath, logoPath) {
    this.logger.debug('Adding logo', { logoPath });

    const outputPath = path.join(
      config.paths.output,
      `${path.basename(videoPath, path.extname(videoPath))}_logo.mp4`
    );

    // Logo at top-left corner, 10% of video width, with fade in/out
    const filter = `[0:v][1:v]overlay=10:10:enable='between(t,0,10)':alpha=main[v]`;

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(logoPath)
        .complexFilter(filter, 'v')
        .map('[v]')
        .map('0:a')
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => {
          this.logger.debug('Logo applied');
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }

  /**
   * Apply video filters
   * @private
   */
  async _applyFilters(videoPath, outputPath, filter) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilter(filter)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .preset('fast')
        .on('end', () => {
          this.logger.debug('Filters applied');
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }

  /**
   * Get color correction filter based on preset
   * @private
   */
  _getColorCorrectionFilter(preset) {
    const filters = {
      warm: "colortemperature=temperature=4000",
      cool: "colortemperature=temperature=8000",
      vintage: "colorlevels=rimin=0.05:gimin=0.05:bimin=0.05:rimax=0.9:gimax=0.9:bimax=0.9",
      vibrant: "eq=saturation=1.5:brightness=1.05:contrast=1.1",
    };
    return filters[preset] || filters.vibrant;
  }

  /**
   * Get crop filter
   * @private
   */
  _getCropFilter(width, height) {
    return `crop=${width}:${height}:0:0`;
  }

  /**
   * Get pad filter (letterbox)
   * @private
   */
  _getPadFilter(width, height) {
    return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
  }

  /**
   * Get intro filter based on style
   * @private
   */
  _getIntroFilter(style) {
    const filters = {
      professional: "fade=t=in:st=0:d=1,drawtext=text='${this.config.brand.name}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
      energetic: "fade=t=in:st=0:d=0.5,scale=1080:1920,drawtext=text='${this.config.brand.name}':fontsize=60:fontcolor=${this.config.brand.primaryColor}:x=(w-text_w)/2:y=(h-text_h)/2",
      minimal: "drawtext=text='${this.config.brand.name}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
      playful: "fade=t=in:st=0:d=0.8,drawtext=text='${this.config.brand.name}':fontsize=60:fontcolor=${this.config.brand.secondaryColor}:x=(w-text_w)/2:y=(h-text_h)/2",
    };
    return filters[style] || filters.professional;
  }

  /**
   * Get intro color based on style
   * @private
   */
  _getIntroColor(style) {
    const colors = {
      professional: '#1a1a1a',
      energetic: this.config.brand.primaryColor,
      minimal: '#000000',
      playful: this.config.brand.secondaryColor,
    };
    return colors[style] || '#1a1a1a';
  }

  /**
   * Get outro filter based on style
   * @private
   */
  _getOutroFilter(style) {
    const cta = this.config.brand.ctaText || 'Learn More';
    const filters = {
      call_to_action: `drawtext=text='${cta}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=${this.config.brand.primaryColor}:boxborderw=5`,
      subscription: `drawtext=text='Subscribe':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
      social_links: `drawtext=text='Follow Us':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
      minimal_credits: `fade=t=out:st=0:d=1,drawtext=text='Thanks for watching':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
    };
    return filters[style] || filters.call_to_action;
  }

  /**
   * Get outro color based on style
   * @private
   */
  _getOutroColor(style) {
    const colors = {
      call_to_action: this.config.brand.primaryColor,
      subscription: '#FF0000',
      social_links: this.config.brand.primaryColor,
      minimal_credits: '#1a1a1a',
    };
    return colors[style] || this.config.brand.primaryColor;
  }

  /**
   * Clean up temporary files
   * @private
   */
  _cleanupTempFiles(filePaths) {
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          this.logger.debug(`Cleaned up: ${filePath}`);
        } catch (error) {
          this.logger.warn(`Failed to cleanup: ${filePath}`);
        }
      }
    });
  }
}

export default VideoEditor;
