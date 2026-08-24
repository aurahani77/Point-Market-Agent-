import { AbsoluteFill, useVideoConfig, interpolate, Sequence } from 'remotion';

interface SocialMediaVideoProps {
  brandColor: string;
  text: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
}

export const SocialMediaVideo: React.FC<SocialMediaVideoProps> = ({
  brandColor,
  text,
  platform
}) => {
  const { durationInFrames, width, height } = useVideoConfig();

  const getDimensions = () => {
    switch (platform) {
      case 'instagram':
        return { w: 1080, h: 1080 }; // Square
      case 'tiktok':
        return { w: 1080, h: 1920 }; // Vertical
      case 'youtube':
        return { w: 1920, h: 1080 }; // Horizontal
      default:
        return { w: 1920, h: 1080 };
    }
  };

  const dims = getDimensions();
  const textOpacity = interpolate(
    Math.min(durationInFrames, 200),
    [0, 60, 120, 200],
    [0, 1, 1, 0]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brandColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dims.w,
        height: dims.h
      }}
    >
      <Sequence from={0} durationInFrames={durationInFrames}>
        <div
          style={{
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
            textAlign: 'center',
            padding: 40,
            opacity: textOpacity,
            maxWidth: '90%'
          }}
        >
          {text}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
