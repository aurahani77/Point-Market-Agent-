import { Composition } from 'remotion';
import { PointMarketIntro } from './compositions/PointMarketIntro';
import { MarketingAnimation } from './compositions/MarketingAnimation';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="point-market-intro"
        component={PointMarketIntro}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Point Market Agent',
          subtitle: 'AI-Powered Marketing Skills Library'
        }}
      />
      <Composition
        id="marketing-animation"
        component={MarketingAnimation}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          agentName: 'Point Market Agent',
          skillCount: 600
        }}
      />
    </>
  );
};
