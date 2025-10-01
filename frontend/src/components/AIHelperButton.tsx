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

  const handleClick = () => {
    console.log('🤖 AI Helper button clicked! Current state:', isChatOpen);
    onToggleChat();
  };

  const handleMouseEnter = () => {
    console.log('🤖 AI Helper button hovered!');
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    console.log('🤖 AI Helper button hover ended');
    setIsHovered(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {isHovered && !isChatOpen && (
        <div 
          className="absolute bottom-16 right-0 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 shadow-xl whitespace-nowrap"
          style={{ 
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <div className="text-sm text-white font-medium">
            AI Market Assistant
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Get insights about this market
          </div>
          {/* Arrow pointing down */}
          <div 
            className="absolute top-full right-4 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1f2937'
            }}
          ></div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
          ${theme.primaryBg} ${theme.primaryHover}
          hover:scale-110 hover:shadow-xl
          flex items-center justify-center
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${isChatOpen ? 'rotate-180' : 'rotate-0'}
        `}
        style={{
          backgroundColor: color === 'green' ? '#11b881' : 
                          color === 'orange' ? '#e59500' : 
                          color === 'coral' ? '#ef2d56' : '#11b881'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 
            color === 'green' ? '#0f9d6f' : 
            color === 'orange' ? '#cc8500' : 
            color === 'coral' ? '#d92548' : '#0f9d6f';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 
            color === 'green' ? '#11b881' : 
            color === 'orange' ? '#e59500' : 
            color === 'coral' ? '#ef2d56' : '#11b881';
        }}
      >
        {isChatOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Pulse animation when not hovered and chat is closed */}
      {!isHovered && !isChatOpen && (
        <div 
          className="absolute inset-0 w-14 h-14 rounded-full opacity-30 animate-ping pointer-events-none"
          style={{
            backgroundColor: color === 'green' ? '#11b881' : 
                            color === 'orange' ? '#e59500' : 
                            color === 'coral' ? '#ef2d56' : '#11b881'
          }}
        ></div>
      )}

      {/* Add CSS for fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
