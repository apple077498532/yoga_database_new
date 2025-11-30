import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onTranscript: (text: string) => void;
  label?: string;
}

const VoiceTextarea: React.FC<VoiceTextareaProps> = ({ onTranscript, label, className, value, ...props }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Stop after one sentence/pause
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'zh-TW';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript); // Pass up to parent
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
        alert("您的瀏覽器不支援語音輸入，請使用 Chrome 或 Safari。");
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="relative w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <textarea
          {...props}
          value={value}
          className={`w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yoga-accent focus:border-transparent transition-all ${className}`}
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-2 bottom-2 p-2 rounded-full transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-100 text-gray-500 hover:bg-yoga-accent hover:text-white'
          }`}
          title="點擊開始語音輸入"
        >
          {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
      {isListening && <p className="text-xs text-yoga-accent mt-1 animate-pulse">正在聆聽...</p>}
    </div>
  );
};

export default VoiceTextarea;