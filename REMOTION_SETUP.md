# Remotion Setup for Point Market Agent

This document describes the Remotion video creation system integrated into the Point Market Agent project.

## Overview

Remotion is now integrated into the Point Market Agent, enabling programmatic video creation using React components. This allows the agent to dynamically generate marketing videos, animations, and visual content.

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation Steps

```bash
# Install dependencies
npm install

# Verify Remotion installation
npx remotion --version
```

## Project Structure

```
.
├── package.json                 # Project dependencies
├── remotion.config.ts          # Remotion configuration
├── tsconfig.json               # TypeScript configuration
├── src/
│   ├── Video.tsx               # Main compositions
│   └── compositions/
│       ├── PointMarketIntro.tsx    # Intro animation
│       └── MarketingAnimation.tsx   # Skills showcase
└── skills/
    └── remotion-video-creation/
        ├── SKILL.md             # Skill documentation
        └── metadata.json        # Skill metadata
```

## Available Compositions

### 1. Point Market Intro
- **ID**: `point-market-intro`
- **Duration**: 300 frames (10 seconds at 30fps)
- **Resolution**: 1920x1080
- **Purpose**: Professional introduction video

```bash
npm run build -- point-market-intro
```

### 2. Marketing Animation
- **ID**: `marketing-animation`
- **Duration**: 600 frames (20 seconds at 30fps)
- **Resolution**: 1920x1080
- **Purpose**: Skills showcase animation with dynamic bubbles

```bash
npm run build -- marketing-animation
```

## Commands

### Development

```bash
# Start preview server
npm start
# Opens browser at http://localhost:3000

# Dev mode with hot reload
npm run dev
```

### Production

```bash
# Render all compositions
npm run build

# Render specific composition
npx remotion render src/Video.tsx point-market-intro output.mp4

# Render with custom settings
npx remotion render src/Video.tsx point-market-intro output.mp4 \
  --codec h264 \
  --quality 90 \
  --concurrency 4
```

## Configuration

### Video Codecs

Available codecs in `remotion.config.ts`:
- `h264` (default) - Universal compatibility
- `h265` - Better compression, limited support
- `vp8` - WebM format
- `vp9` - WebM format, better quality

### Quality Settings

- **Pixel Format**: yuv420 (default, best compatibility)
- **Frame Rate**: 30fps (configurable)
- **Resolution**: 1920x1080 (configurable)

### Concurrency

Adjust `Config.setConcurrency(4)` in `remotion.config.ts` to control parallel rendering.

## Creating Custom Videos

### Step 1: Create Composition

```tsx
import { Composition } from 'remotion';
import { MyCustomVideo } from './compositions/MyCustomVideo';

export const RemotionRoot = () => (
  <Composition
    id="my-custom-video"
    component={MyCustomVideo}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
      title: 'My Custom Video'
    }}
  />
);
```

### Step 2: Build Component

```tsx
import { AbsoluteFill, useVideoConfig, interpolate } from 'remotion';

interface MyCustomVideoProps {
  title: string;
}

export const MyCustomVideo: React.FC<MyCustomVideoProps> = ({ title }) => {
  const { frame, durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ opacity }}>{title}</h1>
    </AbsoluteFill>
  );
};
```

### Step 3: Render

```bash
npm run build -- my-custom-video
```

## Animation Techniques

### Linear Interpolation

```tsx
import { interpolate } from 'remotion';

const scale = interpolate(frame, [0, 30, 60], [1, 1.5, 1]);
```

### Spring Animation

```tsx
import { spring } from 'remotion';

const scale = spring({
  fps: 30,
  frame: Math.min(60, frame),
  config: { damping: 10 }
});
```

### Timing Sequences

```tsx
import { Sequence } from 'remotion';

<Sequence from={0} durationInFrames={100}>
  <Component1 />
</Sequence>
<Sequence from={100} durationInFrames={100}>
  <Component2 />
</Sequence>
```

## Troubleshooting

### Issue: "Cannot find module 'remotion'"

**Solution**: Install dependencies
```bash
npm install
```

### Issue: "Chrome/Chromium not found"

**Solution**: Install Chromium or set `BROWSER_PATH` environment variable
```bash
npm install @remotion/lambda  # or install Chromium separately
```

### Issue: Out of memory during rendering

**Solution**: Reduce concurrency in `remotion.config.ts`
```ts
Config.setConcurrency(1); // Render sequentially
```

### Issue: Video codec not supported

**Solution**: Try different codec
```bash
npx remotion render ... --codec h264  # Change codec
```

## Performance Tips

1. **Use memo for expensive components**
   ```tsx
   export const MemoComponent = React.memo(MyComponent);
   ```

2. **Optimize images**
   - Use next-gen formats (WebP)
   - Compress before including

3. **Split long videos**
   - Break into sequences
   - Render separately if needed

4. **Adjust concurrency**
   - Increase for powerful machines
   - Decrease if memory-constrained

## Integration with Point Market Agent

### Using Remotion Skills

Access Remotion capabilities through the skill system:

```ts
const skill = await loadSkill('remotion-video-creation');
const video = await skill.createVideo({
  id: 'point-market-intro',
  props: { title: 'My Video' }
});
```

### Dynamic Content Generation

Generate videos based on agent data:

```tsx
const CreateAgentVideo = (agentData) => (
  <Composition
    id="dynamic-agent-video"
    component={DynamicContent}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={agentData}
  />
);
```

## Resources

- [Remotion Official Site](https://www.remotion.dev)
- [API Documentation](https://www.remotion.dev/docs)
- [Examples Gallery](https://www.remotion.dev/docs/examples)
- [Community Discord](https://discord.gg/remotion)

## License

Remotion: Apache 2.0
Point Market Agent Remotion Setup: MIT

---

**Setup Date**: 2026-08-24
**Remotion Version**: 4.0.0+
**Status**: ✅ Fully Integrated
