import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "./button";

interface VoiceToTextProps {
  onTextCapture?: (text: string) => void;
}

export const VoiceToText: React.FC<VoiceToTextProps> = ({ onTextCapture }) => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Map i18n language codes to SpeechRecognition language codes
  const getRecognitionLanguage = () => {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'id': 'id-ID',
      'ja': 'ja-JP'
    };
    return langMap[i18n.language] || 'en-US';
  };

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError(t('voiceToText.browserNotSupported'));
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = getRecognitionLanguage();

    // Set up event handlers
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setText(transcript);
      
      // Send text to parent component if callback provided
      if (onTextCapture) {
        onTextCapture(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setError(t('voiceToText.error'));
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      // Only set isListening to false if not intentionally still listening
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Could not restart recognition', e);
          setIsListening(false);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [t, onTextCapture, i18n.language]);

  // Update language when i18n language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getRecognitionLanguage();
    }
  }, [i18n.language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition', err);
        setError(t('voiceToText.startError'));
      }
    }
  };

  const clearText = () => {
    setText("");
    if (onTextCapture) {
      onTextCapture("");
    }
  };

  const copyToClipboard = () => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(
      () => {
        // Success feedback
        // You could add a toast notification here
      },
      (err) => {
        console.error('Could not copy text: ', err);
        setError(t('voiceToText.copyError'));
      }
    );
  };

  return (
    <div className="bg-[#2f373e] rounded-lg p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <h2 className="text-white text-lg md:text-xl font-bold">{t('voiceToText.title')}</h2>
        
        <div className="flex items-center gap-2">
          <span className="text-white text-xs sm:text-sm opacity-70">
            {t('voiceToText.currentLanguage')}: {getRecognitionLanguage()}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className={`min-h-[120px] sm:min-h-[150px] p-3 sm:p-4 rounded-lg ${isListening ? 'bg-[#3a444d] border border-[#ff6f06]' : 'bg-[#242b31]'} relative`}>
          <div className="text-white whitespace-pre-wrap text-sm sm:text-base">
            {text || <span className="opacity-50">{t('voiceToText.placeholder')}</span>}
          </div>
          
          {isListening && (
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-[#ff6f06] rounded-full animate-pulse"></span>
              <span className="text-[#ff6f06] text-xs sm:text-sm">{t('voiceToText.listening')}</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-600 text-white p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <Button 
            onClick={toggleListening}
            className={`px-4 sm:px-6 py-2 rounded-md flex items-center gap-1 sm:gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-[#ff6f06] hover:bg-[#e56300]'} text-white text-sm sm:text-base w-full sm:w-auto`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
            {isListening ? t('voiceToText.stop') : t('voiceToText.start')}
          </Button>
          
          <Button 
            onClick={clearText}
            className="px-3 sm:px-4 py-2 rounded-md bg-[#383f45] hover:bg-[#434b53] text-white text-sm sm:text-base w-full sm:w-auto"
            disabled={!text}
          >
            {t('voiceToText.clear')}
          </Button>
          
          <Button 
            onClick={copyToClipboard}
            className="px-3 sm:px-4 py-2 rounded-md bg-[#383f45] hover:bg-[#434b53] text-white text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto"
            disabled={!text}
          >
            {t('voiceToText.copy')}
          </Button>
        </div>
      </div>
      
      <div className="border-t border-[#3a444d] pt-3 sm:pt-4 mt-3 sm:mt-4">
        <h3 className="text-white text-base sm:text-lg font-medium mb-2 sm:mb-3">{t('voiceToText.tips')}</h3>
        <ul className="text-white opacity-70 space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <li>• {t('voiceToText.tip1')}</li>
          <li>• {t('voiceToText.tip2')}</li>
          <li>• {t('voiceToText.tip3')}</li>
        </ul>
      </div>
    </div>
  );
};

// Add TypeScript interface for the Window object to support SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 