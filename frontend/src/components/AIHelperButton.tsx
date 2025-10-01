'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '../store/themeStore';

interface AIHelperButtonProps {
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export default function AIHelperButton({ onToggleChat, isChatOpen }: AIHelperButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {isHovered && !isChatOpen && (
        <div className={`absolute bottom-16 right-0 px-3 py-2 rounded-lg ${theme.cardBg} ${theme.border} border shadow-lg whitespace-nowrap transition-all duration-200 opacity-100`}>
          <div className={`text-sm ${theme.text}`}>
            AI Market Assistant
          </div>
          <div className={`text-xs ${theme.textSecondary} mt-1`}>
            Get insights about this market
          </div>
          {/* Arrow */}
          <div className={`absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600`}></div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => {
          console.log('AI Helper button clicked, current state:', isChatOpen);
          onToggleChat();
        }}
        onMouseEnter={() => {
          console.log('AI Helper button hovered');
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
          bg-blue-500 hover:bg-blue-600
          hover:scale-110 hover:shadow-xl
          flex items-center justify-center
          ${isChatOpen ? 'rotate-180' : 'rotate-0'}
        `}
      >
        {isChatOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Pulse animation when not hovered */}
      {!isHovered && !isChatOpen && (
        <div className={`absolute inset-0 w-14 h-14 rounded-full ${theme.primaryBg} opacity-30 animate-ping`}></div>
      )}
    </div>
  );
}
