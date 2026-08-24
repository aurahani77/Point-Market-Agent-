import { useVideoConfig, AbsoluteFill, Sequence, interpolate } from 'remotion';

interface MarketingAnimationProps {
  agentName: string;
  skillCount: number;
}

export const MarketingAnimation: React.FC<MarketingAnimationProps> = ({
  agentName,
  skillCount
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const renderSkillBubbles = () => {
    const bubbles = [];
    const bubbleCount = 6;

    for (let i = 0; i < bubbleCount; i++) {
      const angle = (i / bubbleCount) * Math.PI * 2;
      const x = Math.cos(angle) * 300;
      const y = Math.sin(angle) * 300;

      const opacity = interpolate(
        Math.min(durationInFrames, 300),
        [0, 100, 200, 300],
        [0, 1, 1, 0.5]
      );

      bubbles.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: `hsl(${(i * 60) % 360}, 70%, 50%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 14,
            opacity: opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
          }}
        >
          Skill {i + 1}
        </div>
      );
    }
    return bubbles;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <Sequence from={0} durationInFrames={durationInFrames}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                color: '#00ff00',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                zIndex: 10
              }}
            >
              {skillCount}+ Skills
            </div>
            {renderSkillBubbles()}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
