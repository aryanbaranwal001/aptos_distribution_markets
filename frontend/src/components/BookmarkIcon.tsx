interface BookmarkIconProps {
  filled: boolean;
  className?: string;
  themeColor?: string;
}

const BookmarkIcon = ({ filled, className = "w-5 h-5", themeColor }: BookmarkIconProps) => {
  // Get the actual color value from theme classes
  const getColorValue = (themeClass: string) => {
    const colorMap: Record<string, string> = {
      'text-[#11b881]': '#11b881',
      'text-[#e59500]': '#e59500',
      'text-[#ef2d56]': '#ef2d56'
    };
    return colorMap[themeClass] || '#11b881';
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
        fill={filled && themeColor ? getColorValue(themeColor) : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={filled ? "0" : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BookmarkIcon;
