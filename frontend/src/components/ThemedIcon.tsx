'use client';

import Image from 'next/image';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';

interface ThemedIconProps {
  iconName: string;
  alt: string;
  size?: number;
  className?: string;
}

const ThemedIcon = ({ iconName, alt, size = 32, className = "" }: ThemedIconProps) => {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  return (
    <div className={`${theme.primary} ${className}`} style={{ filter: 'brightness(0) saturate(100%) invert(1)' }}>
      <Image 
        src={`/icons/${iconName}`}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  );
};

export default ThemedIcon;
