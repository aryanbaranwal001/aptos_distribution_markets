'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import Navbar from '@/components/Navbar';
import LiquidEther from '@/components/LiquidEther';

export default function Home() {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  // Get LiquidEther colors directly from theme
  const liquidEtherColors: string[] = theme.liquidEther;

  return (
<>

      <Navbar />

        <div style={{ width: '100%', height: 1000, position: 'relative' }}>
          <LiquidEther
            colors={liquidEtherColors}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.4}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>  
</>

  );
}
