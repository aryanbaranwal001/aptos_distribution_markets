'use client';

import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import Navbar from '@/components/Navbar';
import LiquidEther from '@/components/LiquidEther';

export default function Home() {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  const extractHex = (str: string): string | null => {
    const match = str.match(/#([0-9a-fA-F]{6})/);
    return match ? `#${match[1]}` : null;
  };

  const uniqueColors: string[] = Array.from(
    new Set(
      Object.values(theme)
        .map(extractHex)
        .filter((c): c is string => Boolean(c))
    )
  );

  const pickByIndexes = (arr: string[], indexes: number[]): string[] => {
    return indexes
      .map((i) => arr[i])
      .filter((c): c is string => Boolean(c)); // remove undefined if index out of bounds
  };

  const colors: string[] = pickByIndexes(uniqueColors, [0, 1, 2]);

  return (
<>

      <Navbar />
      {console.log(colors)}

        <div style={{ width: '100%', height: 1000, position: 'relative' }}>
          <LiquidEther
            colors
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
