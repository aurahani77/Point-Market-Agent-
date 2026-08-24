import { useVideoConfig, AbsoluteFill, Sequence, spring } from 'remotion';

interface PointMarketIntroProps {
  title: string;
  subtitle: string;
}

export const PointMarketIntro: React.FC<PointMarketIntroProps> = ({
  title,
  subtitle
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const titleScale = spring({
    fps,
    frame: Math.min(60, durationInFrames / 2),
    config: {
      damping: 20,
      mass: 1,
      overshootClamping: false,
      restSpeedThreshold: 2,
      restDisplacementThreshold: 0.001,
      stiffness: 100,
      tension: 168
    },
    delay: 0
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <Sequence from={0} durationInFrames={durationInFrames}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#00ff00',
              transform: `scale(${titleScale})`,
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 40,
              color: '#888888',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
              opacity: 0.8
            }}
          >
            {subtitle}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
