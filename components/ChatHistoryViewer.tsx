
import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Bot, User } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatHistoryViewerProps {
  history: ChatMessage[];
}

export function ChatHistoryViewer({ history }: ChatHistoryViewerProps): React.ReactNode {
  const { t, language } = useTranslation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history]);

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Use the current language for locale-specific formatting
    const locale = language === 'ar' ? 'ar-EG' : language; // Use a specific locale for Arabic if needed
    return date.toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg h-[45rem] flex flex-col animate-fade-in transition-all duration-300 hover:shadow-xl">
      <h3 className="text-md font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-200">
        {t('chatHistory.title')}
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'model' && 
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center self-start flex-shrink-0 mt-2">
                <Bot className="w-5 h-5 text-slate-500"/>
              </div>
            }

            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-xl rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-lg'
                      : 'bg-slate-200 text-slate-800 rounded-bl-lg'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                 <p className="text-xs text-slate-400 mt-1 px-2">
                    {formatDate(msg.timestamp)}
                 </p>
            </div>

             {msg.role === 'user' && 
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center self-start flex-shrink-0 mt-2">
                    <User className="w-5 h-5 text-blue-600"/>
                </div>
            }

          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
