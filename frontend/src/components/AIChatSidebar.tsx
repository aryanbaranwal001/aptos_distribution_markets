'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, X } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '../store/themeStore';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  marketId: string;
  aiContext: string;
  onClose: () => void;
}

export default function AIChatSidebar({ isOpen, marketId, aiContext, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  // console.log('AIChatSidebar render - isOpen:', isOpen, 'marketId:', marketId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          marketId,
          aiContext,
          conversationHistory: messages.slice(-8) // Last 4 pairs
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed right-0 w-96 flex flex-col z-30 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`} style={{
      top: '132px', // Below navbar (64px) + category nav (64px) + 4px gap for border
      height: 'calc(100vh - 132px)',
      backgroundColor: '#1a1b1e',
      borderLeft: '1px solid #2a2b2e',
      boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
      borderTopLeftRadius: '8px'
    }}>
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid #2a2b2e' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className={`w-5 h-5 ${theme.primary}`} />
            <h3 className={`font-semibold ${theme.text}`}>AI Market Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.hoverBg} ${theme.textSecondary} hover:${theme.text} transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className={`text-sm ${theme.textSecondary} mt-1`}>
          Ask me anything about this market
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className={`text-center ${theme.textSecondary} py-8`}>
            <Bot className={`w-12 h-12 mx-auto mb-2 opacity-50 ${theme.textSecondary}`} />
            <p>Start a conversation about this market!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[75%] ${
              message.role === 'user' ? 'order-2' : 'order-1'
            }`}>
              <div className={`inline-block px-4 py-2 rounded-3xl ${
                message.role === 'user' 
                  ? `${theme.primaryBg} text-white rounded-br-md` 
                  : `${theme.cardBg} ${theme.text} border ${theme.border} rounded-bl-md`
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
              <div className={`text-xs ${theme.textSecondary} mt-1 px-1 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[75%]">
              <div className={`inline-block px-4 py-2 rounded-2xl rounded-bl-md ${theme.cardBg} ${theme.text} border ${theme.border}`}>
                <Loader2 className={`w-4 h-4 ${theme.primary} animate-spin`} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4" style={{ borderTop: '1px solid #2a2b2e' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about this market..."
            className={`flex-1 px-3 py-2 rounded-lg ${theme.text} placeholder-gray-400 focus:outline-none transition-all duration-200`}
            style={{ 
              backgroundColor: '#2a2b2e',
              border: '1px solid #3a3b3e'
            }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: color === 'green' ? '#11b881' : 
                              color === 'orange' ? '#e59500' : 
                              color === 'coral' ? '#ef2d56' : '#11b881'
            }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
