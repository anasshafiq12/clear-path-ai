import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ isListening, onStart, onStop }) => {
  return (
    <button
      onClick={isListening ? onStop : onStart}
      className={`
        flex items-center justify-center rounded-full
        w-20 h-20 md:w-24 md:h-24
        transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ring
        ${isListening
          ? 'bg-voice-active voice-glow scale-110'
          : 'bg-primary nav-glow hover:scale-105'
        }
      `}
      aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      aria-pressed={isListening}
    >
      {isListening ? (
        <MicOff className="w-10 h-10 text-foreground" aria-hidden="true" />
      ) : (
        <Mic className="w-10 h-10 text-primary-foreground" aria-hidden="true" />
      )}
    </button>
  );
};

export default VoiceButton;
