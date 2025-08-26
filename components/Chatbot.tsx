
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, QuestionType } from '../types';
import { Send, Bot, Mic, Volume2, VolumeX } from './icons';
import { useTranslation } from '../contexts/LanguageContext';

// --- Web Speech API Type Definitions for TypeScript ---
// This is to solve TypeScript errors since these types are not standard in all environments.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
}

// A type for the window object that includes the prefixed and non-prefixed API.
interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionStatic;
  webkitSpeechRecognition?: SpeechRecognitionStatic;
}
// --- End of Web Speech API Type Definitions ---


interface ChatbotProps {
  history: ChatMessage[];
  onSendMessage: (message: string, context?: ChatMessage['questionContext']) => void;
  isAiTyping: boolean;
  isActive: boolean;
}

const QuickResponsePanel = ({ options, onSelect }: { options: string[], onSelect: (option: string) => void}) => (
    <div className="p-4 border-t border-slate-200 animate-fade-in">
        <div className="grid grid-cols-1 gap-2">
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(option)}
                    className="w-full px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors text-center"
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);


export function Chatbot({ history, onSendMessage, isAiTyping, isActive }: ChatbotProps): React.ReactNode {
  const { t, language } = useTranslation();
  const [input, setInput] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const lastMessage = history[history.length - 1];
  const isInteractiveQuestion = lastMessage?.role === 'model' && !!lastMessage.options?.length;

  // Effect for Text-to-Speech
  useEffect(() => {
    if (isTtsEnabled && lastMessage?.role === 'model' && lastMessage.text && !isAiTyping) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any previous speech
            const utterance = new SpeechSynthesisUtterance(lastMessage.text);
            if (language === 'fr') {
                utterance.lang = 'fr-FR';
            } else if (language === 'ar') {
                utterance.lang = 'ar-SA';
            } else {
                utterance.lang = 'en-US';
            }
            window.speechSynthesis.speak(utterance);
        }
    }
     // Cleanup: cancel speech synthesis when component unmounts or before new speech starts
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
  }, [history, isTtsEnabled, isAiTyping, lastMessage, language]);

  // Effect for setting up Speech Recognition
  useEffect(() => {
    // Cast window to our extended interface to access the SpeechRecognition properties.
    const win = window as WindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      if (language === 'fr') {
          recognition.lang = 'fr-FR';
      } else if (language === 'ar') {
          recognition.lang = 'ar-SA';
      } else {
          recognition.lang = 'en-US';
      }
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setRecordingStatus('recording');
      recognition.onend = () => setRecordingStatus('idle');
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setRecordingStatus('idle');
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(''); // Clear input after successful recognition
        onSendMessage(transcript);
      };
      
      recognitionRef.current = recognition;
    }
  }, [onSendMessage, language]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isAiTyping]);

  // Effect to focus input when tab becomes active
  useEffect(() => {
    if (isActive && !isInteractiveQuestion && recordingStatus === 'idle') {
      inputRef.current?.focus();
    }
  }, [isActive, isInteractiveQuestion, recordingStatus]);

  const handleSendMessage = (message: string) => {
    if (isInteractiveQuestion) {
       onSendMessage(message, { originalQuestion: lastMessage.text });
    } else {
       onSendMessage(message);
       setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAiTyping && !isInteractiveQuestion) {
      handleSendMessage(input.trim());
    }
  };
  
  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (recordingStatus === 'idle') {
        recognitionRef.current.start();
    } else {
        recognitionRef.current.stop();
    }
  };

  const getPlaceholderText = () => {
    if (recordingStatus === 'recording') return t('chatbot.listening');
    if (recordingStatus === 'processing') return t('chatbot.processing');
    return t('chatbot.askQuestion');
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-slate-200 flex items-center justify-between">
         <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">{t('chatbot.title')}</h2>
         </div>
         <button 
            onClick={() => setIsTtsEnabled(prev => !prev)}
            className="p-2 rounded-full hover:bg-slate-200 transition-colors"
            title={t(isTtsEnabled ? 'chatbot.disableTTS' : 'chatbot.enableTTS')}
         >
            {isTtsEnabled ? <Volume2 className="w-5 h-5 text-slate-600" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
         </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center self-start flex-shrink-0"><Bot className="w-5 h-5 text-slate-500"/></div>}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-lg'
                  : 'bg-slate-200 text-slate-800 rounded-bl-lg'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isAiTyping && (
           <div className="flex items-end gap-2 justify-start">
             <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center self-start flex-shrink-0"><Bot className="w-5 h-5 text-slate-500"/></div>
             <div className="bg-slate-200 text-slate-800 rounded-2xl rounded-bl-lg px-4 py-3">
                <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></span>
                </div>
             </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {isInteractiveQuestion ? (
        <QuickResponsePanel
            options={lastMessage.options!}
            onSelect={handleSendMessage}
        />
      ) : (
          <div className="p-4 border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getPlaceholderText()}
                className="flex-1 w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={isAiTyping || recordingStatus !== 'idle'}
              />
               {isSpeechRecognitionSupported && (
                 <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isAiTyping}
                    className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative ${
                        recordingStatus === 'recording' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    } ${isAiTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={t('chatbot.useVoiceInput')}
                  >
                    <Mic className="w-5 h-5" />
                    {recordingStatus === 'recording' && (
                        <span className="absolute top-0 right-0 flex h-full w-full">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        </span>
                     )}
                  </button>
               )}
              <button
                type="submit"
                disabled={isAiTyping || !input.trim()}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
      )}
    </div>
  );
}