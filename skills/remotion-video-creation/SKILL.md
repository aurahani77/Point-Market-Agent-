# Remotion Video Creation Skill

Create stunning videos programmatically using React components with Remotion.

## Overview

Remotion is a framework for creating videos programmatically using React. This skill enables the Point Market Agent to generate high-quality marketing videos, animations, and visual content.

## Key Capabilities

- **React-Based Video Creation**: Write videos as React components
- **Dynamic Content**: Animate text, images, and custom elements
- **Export Options**: Render videos in multiple formats (MP4, WebM, etc.)
- **Composition System**: Build reusable video templates
- **Interactive Preview**: Preview videos before rendering

## Installation

```bash
npm install remotion react react-dom
npm install --save-dev @types/react @types/react-dom @remotion/cli
```

## Quick Start

### 1. Create a Video Composition

```tsx
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

export const RemotionRoot = () => (
  <Composition
    id="my-video"
    component={MyVideo}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
```

### 2. Build Your Video Component

```tsx
import { AbsoluteFill, useVideoConfig } from 'remotion';

export const MyVideo = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'lightblue' }}>
      <h1>My Video</h1>
      <p>Duration: {durationInFrames / fps} seconds</p>
    </AbsoluteFill>
  );
};
```

### 3. Preview and Render

```bash
# Preview in browser
npm start

# Render video
npm run build
```

## Common Patterns

### Text Animation

```tsx
import { interpolate, useVideoConfig } from 'remotion';

export const TextAnimation = () => {
  const { frame } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return <h1 style={{ opacity }}>Animated Text</h1>;
};
```

### Spring Animation

```tsx
import { spring, useVideoConfig } from 'remotion';

export const SpringAnimation = () => {
  const { fps } = useVideoConfig();
  const scale = spring({
    fps,
    frame: Math.min(60, frame),
    config: { damping: 10 }
  });

  return <div style={{ transform: `scale(${scale})` }}>Spring</div>;
};
```

### Sequence and Delay

```tsx
import { Sequence } from 'remotion';

export const SequenceExample = () => (
  <>
    <Sequence from={0} durationInFrames={100}>
      <Video1 />
    </Sequence>
    <Sequence from={100} durationInFrames={150}>
      <Video2 />
    </Sequence>
  </>
);
```

## Configuration

Edit `remotion.config.ts` to customize:

```ts
import { Config } from 'remotion';

Config.setPixelFormat('yuv420');
Config.setCodec('h264');
Config.setConcurrency(4);
Config.setOutputLocation('./videos');
```

## Use Cases

1. **Marketing Videos**: Create promotional content dynamically
2. **Data Visualization**: Animate charts and graphs
3. **Social Media Content**: Generate Instagram, TikTok videos
4. **Presentations**: Build animated slide decks
5. **Product Demos**: Create interactive product walkthroughs

## API Reference

### Core Hooks

- `useVideoConfig()` - Access video configuration
- `useCurrentFrame()` - Get current frame number
- `useAudio()` - Sync audio with video

### Animation Functions

- `interpolate()` - Linear interpolation
- `spring()` - Spring physics animation
- `noise()` - Perlin noise animation

### Components

- `AbsoluteFill` - Full-screen container
- `Composition` - Define video compositions
- `Sequence` - Timeline sequencing
- `Img` - Optimized image component
- `OffthreadVideo` - Off-thread video rendering

## Best Practices

1. **Composition Reusability**: Create modular components
2. **Performance**: Use memo for expensive components
3. **Timing**: Calculate animations based on frame count
4. **Testing**: Preview before rendering
5. **Quality**: Use appropriate codec and bitrate

## Resources

- [Official Documentation](https://www.remotion.dev)
- [API Reference](https://www.remotion.dev/docs)
- [Examples](https://www.remotion.dev/docs/examples)
- [Discord Community](https://discord.gg/remotion)

## Integration with Point Market Agent

Use Remotion to create dynamic video content for:
- Marketing automation
- Social media campaigns
- Agent-generated presentations
- Interactive product showcases

## Example: Point Market Agent Video

```tsx
import { Composition } from 'remotion';
import { PointMarketIntro } from './compositions/PointMarketIntro';

export const AgentShowcase = () => (
  <Composition
    id="agent-showcase"
    component={PointMarketIntro}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
      title: 'Point Market Agent',
      subtitle: '600+ AI-Powered Skills'
    }}
  />
);
```

---

**Last Updated**: 2026-08-24
**Status**: Fully Integrated
**Dependencies**: remotion@^4.0.0, react@^18.2.0
