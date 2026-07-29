/**
 * DesignGenerator.js - AI-Powered Design Template Generation
 *
 * Uses Claude AI to generate:
 * - Design templates based on brand guidelines
 * - Intro/outro visual specifications
 * - Branding recommendations
 * - Color palettes and typography
 */

import axios from 'axios';
import { logger, taskLogger } from './logger.js';
import config from './config.js';
import fs from 'fs';
import path from 'path';

export class DesignGenerator {
  constructor() {
    this.logger = logger;
    this.config = config;
    this.claudeApiKey = config.apis.claude.key;
    this.claudeApiUrl = config.apis.claude.baseUrl;
  }

  /**
   * Generate a complete brand template using Claude
   * @param {string} brandName - Name of the brand
   * @param {string} brandDescription - Description of the brand
   * @param {string} templateType - Type of template (modern, minimal, playful, professional)
   * @returns {Promise<object>} Complete design template
   */
  async generateBrandTemplate(brandName, brandDescription = '', templateType = 'modern') {
    taskLogger.start('generate_brand_template', {
      brand: brandName,
      type: templateType,
    });

    try {
      const prompt = `
You are a professional brand designer. Generate a complete brand design template for:

Brand Name: ${brandName}
Description: ${brandDescription || 'A modern business brand'}
Template Type: ${templateType}

Provide a JSON response with the following structure:
{
  "brandName": "${brandName}",
  "templateType": "${templateType}",
  "colors": {
    "primary": "#XXXXXX",
    "secondary": "#XXXXXX",
    "accent": "#XXXXXX",
    "textLight": "#XXXXXX",
    "textDark": "#XXXXXX",
    "background": "#XXXXXX",
    "complementary": "#XXXXXX"
  },
  "typography": {
    "fontFamily": "Arial, sans-serif",
    "headingFont": "Bold",
    "bodyFont": "Regular",
    "headingSizes": {
      "h1": 72,
      "h2": 48,
      "h3": 36,
      "h4": 28
    },
    "bodySize": 16,
    "lineHeight": 1.6
  },
  "spacing": {
    "large": 32,
    "medium": 16,
    "small": 8,
    "tinyGap": 4
  },
  "brandGuidelines": {
    "logo": "Description of logo placement and usage",
    "tagline": "Brand tagline or slogan",
    "mission": "Brand mission statement",
    "tone": "Tone of voice (professional/casual/creative)"
  },
  "designPhilosophy": "Description of the design philosophy and key characteristics"
}

Return ONLY valid JSON, no additional text.
`;

      const template = await this._callClaudeAPI(prompt);

      taskLogger.complete('generate_brand_template', { brandName, templateType });
      return JSON.parse(template);
    } catch (error) {
      taskLogger.failed('generate_brand_template', error);
      throw error;
    }
  }

  /**
   * Generate intro video specifications
   * @param {string} brandName - Brand name
   * @param {string} style - Style (professional, energetic, minimal, playful)
   * @param {object} brandTemplate - Brand template object
   * @returns {Promise<object>} Intro specifications
   */
  async generateIntroSpecifications(brandName, style = 'professional', brandTemplate = null) {
    taskLogger.start('generate_intro_specs', {
      brand: brandName,
      style,
    });

    try {
      const brandInfo = brandTemplate
        ? `\nBrand Template:\n${JSON.stringify(brandTemplate, null, 2)}`
        : '';

      const prompt = `
You are a professional video designer. Generate detailed specifications for a ${style} intro video:

Brand Name: ${brandName}
Style: ${style}
Duration: 3 seconds
${brandInfo}

Provide a JSON response with:
{
  "style": "${style}",
  "duration": 3,
  "animation": "Description of animation type",
  "backgroundColor": "#XXXXXX",
  "textColor": "#XXXXXX",
  "accentColor": "#XXXXXX",
  "text": {
    "main": "${brandName}",
    "tagline": "A catchy tagline",
    "fontSize": 60,
    "fontWeight": "bold",
    "animation": "fade-in, zoom, or slide"
  },
  "effects": {
    "transition": "fade or slide",
    "music": "uplifting, corporate, or dynamic",
    "soundEffect": "whoosh, chime, or ping"
  },
  "layout": {
    "position": "center or custom",
    "alignment": "centered"
  },
  "filters": [
    "list of FFmpeg filters to apply"
  ]
}

Return ONLY valid JSON, no additional text.
`;

      const specs = await this._callClaudeAPI(prompt);
      taskLogger.complete('generate_intro_specs', { style });
      return JSON.parse(specs);
    } catch (error) {
      taskLogger.failed('generate_intro_specs', error);
      throw error;
    }
  }

  /**
   * Generate outro video specifications with CTA
   * @param {string} brandName - Brand name
   * @param {string} ctaText - Call-to-action text
   * @param {string} style - Style
   * @param {object} brandTemplate - Brand template
   * @returns {Promise<object>} Outro specifications
   */
  async generateOutroSpecifications(brandName, ctaText = 'Learn More', style = 'call_to_action', brandTemplate = null) {
    taskLogger.start('generate_outro_specs', {
      brand: brandName,
      cta: ctaText,
      style,
    });

    try {
      const brandInfo = brandTemplate
        ? `\nBrand Template:\n${JSON.stringify(brandTemplate, null, 2)}`
        : '';

      const prompt = `
You are a professional video designer. Generate detailed specifications for a ${style} outro video with CTA:

Brand Name: ${brandName}
CTA Text: "${ctaText}"
Style: ${style}
Duration: 2 seconds
${brandInfo}

Provide a JSON response with:
{
  "style": "${style}",
  "duration": 2,
  "ctaText": "${ctaText}",
  "backgroundColor": "#XXXXXX",
  "ctaButtonColor": "#XXXXXX",
  "textColor": "#XXXXXX",
  "button": {
    "shape": "rounded or rectangular",
    "animation": "pulse, bounce, or fade-in",
    "text": "${ctaText}",
    "fontSize": 48
  },
  "socialLinks": {
    "enabled": true,
    "platforms": ["instagram", "facebook", "tiktok", "youtube"],
    "style": "icons or text"
  },
  "effects": {
    "transition": "fade or slide",
    "music": "uplifting fade-out",
    "soundEffect": "chime or success sound"
  },
  "filters": [
    "list of FFmpeg filters to apply"
  ]
}

Return ONLY valid JSON, no additional text.
`;

      const specs = await this._callClaudeAPI(prompt);
      taskLogger.complete('generate_outro_specs', { style });
      return JSON.parse(specs);
    } catch (error) {
      taskLogger.failed('generate_outro_specs', error);
      throw error;
    }
  }

  /**
   * Generate marketing copy for different platforms
   * @param {string} productName - Product/service name
   * @param {string} productDescription - Product description
   * @param {string} platform - Target platform (instagram, tiktok, youtube, twitter, facebook)
   * @returns {Promise<object>} Platform-specific marketing copy
   */
  async generateMarketingCopy(productName, productDescription = '', platform = 'instagram') {
    taskLogger.start('generate_marketing_copy', {
      product: productName,
      platform,
    });

    try {
      const prompt = `
You are an expert copywriter. Generate compelling marketing copy for a video campaign:

Product/Service: ${productName}
Description: ${productDescription}
Platform: ${platform}

Provide a JSON response with:
{
  "platform": "${platform}",
  "captions": [
    "Option 1: A compelling caption with emojis and hashtags",
    "Option 2: Alternative caption focusing on benefits",
    "Option 3: Option 3 with a different angle"
  ],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "cta": "Call to action text",
  "videoTitle": "Title for the video",
  "shortDescription": "Brief description (max 150 chars)",
  "platformSpecificTips": [
    "Tip 1 for ${platform}",
    "Tip 2 for optimal engagement",
    "Tip 3 for algorithm"
  ]
}

Return ONLY valid JSON, no additional text.
`;

      const copy = await this._callClaudeAPI(prompt);
      taskLogger.complete('generate_marketing_copy', { platform });
      return JSON.parse(copy);
    } catch (error) {
      taskLogger.failed('generate_marketing_copy', error);
      throw error;
    }
  }

  /**
   * Generate color palette recommendations
   * @param {string} brandName - Brand name
   * @param {string} mood - Desired mood (professional, energetic, creative, calm, bold)
   * @returns {Promise<object>} Color palette recommendations
   */
  async generateColorPalette(brandName, mood = 'professional') {
    taskLogger.start('generate_color_palette', {
      brand: brandName,
      mood,
    });

    try {
      const prompt = `
You are a professional color designer. Generate a complete color palette for:

Brand Name: ${brandName}
Mood: ${mood}

Provide a JSON response with:
{
  "mood": "${mood}",
  "primary": "#XXXXXX",
  "secondary": "#XXXXXX",
  "accent": "#XXXXXX",
  "dark": "#XXXXXX",
  "light": "#XXXXXX",
  "gray": "#XXXXXX",
  "success": "#XXXXXX",
  "warning": "#XXXXXX",
  "error": "#XXXXXX",
  "paletteDescription": "Description of the color psychology and usage",
  "recommendations": [
    "Usage recommendation 1",
    "Usage recommendation 2",
    "Usage recommendation 3"
  ]
}

Return ONLY valid JSON, no additional text.
`;

      const palette = await this._callClaudeAPI(prompt);
      taskLogger.complete('generate_color_palette', { mood });
      return JSON.parse(palette);
    } catch (error) {
      taskLogger.failed('generate_color_palette', error);
      throw error;
    }
  }

  /**
   * Generate video editing recommendations
   * @param {string} videoTopic - Topic of the video
   * @param {string} targetAudience - Target audience
   * @param {string} platform - Target platform
   * @returns {Promise<object>} Video editing recommendations
   */
  async generateEditingRecommendations(videoTopic, targetAudience = 'general', platform = 'instagram') {
    taskLogger.start('generate_editing_recommendations', {
      topic: videoTopic,
      audience: targetAudience,
      platform,
    });

    try {
      const prompt = `
You are a professional video editor. Provide editing recommendations for:

Video Topic: ${videoTopic}
Target Audience: ${targetAudience}
Platform: ${platform}

Provide a JSON response with:
{
  "introStyle": "professional or energetic",
  "outroStyle": "call_to_action or subscription",
  "colorGrade": "warm, cool, vibrant, or vintage",
  "pacing": "fast, moderate, or slow",
  "musicGenre": "uplifting, corporate, energetic, or calm",
  "transitionStyle": "fade, cut, zoom, or slide",
  "textOverlay": {
    "fontStyle": "sans-serif or modern",
    "fontSize": "large or medium",
    "position": "center or bottom"
  },
  "effects": [
    "Recommended effect 1",
    "Recommended effect 2",
    "Recommended effect 3"
  ],
  "keyframes": [
    {
      "timeSeconds": 0,
      "action": "Fade in intro"
    },
    {
      "timeSeconds": 10,
      "action": "Add text overlay with main message"
    },
    {
      "timeSeconds": 25,
      "action": "Add call-to-action"
    }
  ]
}

Return ONLY valid JSON, no additional text.
`;

      const recommendations = await this._callClaudeAPI(prompt);
      taskLogger.complete('generate_editing_recommendations', { platform });
      return JSON.parse(recommendations);
    } catch (error) {
      taskLogger.failed('generate_editing_recommendations', error);
      throw error;
    }
  }

  /**
   * Call Claude API with prompt
   * @private
   */
  async _callClaudeAPI(prompt) {
    try {
      this.logger.debug('Calling Claude API for design generation');

      const response = await axios.post(
        `${this.claudeApiUrl}/messages`,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': this.claudeApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data.content && response.data.content.length > 0) {
        const content = response.data.content[0].text;
        this.logger.debug('Claude API response received');
        return content;
      }

      throw new Error('No content in Claude API response');
    } catch (error) {
      this.logger.error({ error: error.message }, 'Claude API call failed');
      throw new Error(`Claude API Error: ${error.message}`);
    }
  }

  /**
   * Save template to file
   * @param {object} template - Template object
   * @param {string} filename - Output filename
   * @returns {string} Path to saved template
   */
  saveTemplate(template, filename = 'template.json') {
    try {
      const outputPath = path.join(config.paths.output, filename);

      // Ensure output directory exists
      if (!fs.existsSync(config.paths.output)) {
        fs.mkdirSync(config.paths.output, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
      this.logger.info({ path: outputPath }, 'Template saved');
      return outputPath;
    } catch (error) {
      this.logger.error({ error: error.message }, 'Failed to save template');
      throw error;
    }
  }
}

export default DesignGenerator;
