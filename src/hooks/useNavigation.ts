import { useState, useEffect, useRef, useCallback } from 'react';
import NavigationService, { NavigationResponse } from '@/services/NavigationService';

interface UseNavigationState {
  instruction: string;
  isConnected: boolean;
  isCapturing: boolean;
  isListening: boolean;
  gpsStatus: 'idle' | 'tracking' | 'error';
  lastAudioFile: string | null;
}

export function useNavigation() {
  const [state, setState] = useState<UseNavigationState>({
    instruction: '',
    isConnected: false,
    isCapturing: false,
    isListening: false,
    gpsStatus: 'idle',
    lastAudioFile: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const playAudioFeedback = useCallback((text: string, audioFile?: string) => {
    if (audioFile) {
      const audio = new Audio(NavigationService.getAudioUrl(audioFile));
      audio.play().catch(() => {
        // Fallback to speech synthesis
        speakText(text);
      });
    } else {
      speakText(text);
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Health check
  useEffect(() => {
    const check = async () => {
      const connected = await NavigationService.checkHealth();
      setState(s => ({ ...s, isConnected: connected }));
    };
    check();
    healthIntervalRef.current = setInterval(check, 10000);
    return () => {
      if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
    };
  }, []);

  // Camera setup
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setState(s => ({ ...s, isCapturing: true }));
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

    try {
      const result: NavigationResponse = await NavigationService.uploadFrame(base64);
      if (result.navigation_instruction) {
        setState(s => ({
          ...s,
          instruction: result.navigation_instruction,
          lastAudioFile: result.audio_file || null,
        }));
        playAudioFeedback(result.navigation_instruction, result.audio_file);
      }
    } catch (err) {
      console.error('Frame upload failed:', err);
    }
  }, [playAudioFeedback]);

  // Frame capture interval (every 10s)
  useEffect(() => {
    if (state.isCapturing) {
      frameIntervalRef.current = setInterval(captureFrame, 10000);
      // Capture first frame after a short delay
      const timeout = setTimeout(captureFrame, 2000);
      return () => {
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        clearTimeout(timeout);
      };
    }
  }, [state.isCapturing, captureFrame]);

  // GPS tracking
  const startGPSTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState(s => ({ ...s, gpsStatus: 'error' }));
      return;
    }

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await NavigationService.sendGPSData({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            setState(s => ({ ...s, gpsStatus: 'tracking' }));
          } catch {
            setState(s => ({ ...s, gpsStatus: 'error' }));
          }
        },
        () => setState(s => ({ ...s, gpsStatus: 'error' })),
        { enableHighAccuracy: true }
      );
    };

    sendLocation();
    gpsIntervalRef.current = setInterval(sendLocation, 30000);
    setState(s => ({ ...s, gpsStatus: 'tracking' }));
  }, []);

  useEffect(() => {
    startGPSTracking();
    return () => {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    };
  }, [startGPSTracking]);

  // Voice command
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speakText('Voice recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(s => ({ ...s, isListening: true }));
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setState(s => ({ ...s, isListening: false }));

      try {
        const result = await NavigationService.sendVoiceCommand(transcript);
        if (result.response_text) {
          setState(s => ({ ...s, instruction: result.response_text }));
          playAudioFeedback(result.response_text, result.audio_file);
        }
      } catch (err) {
        console.error('Voice command failed:', err);
        speakText('Sorry, I could not process that command.');
      }
    };

    recognition.onerror = () => {
      setState(s => ({ ...s, isListening: false }));
    };

    recognition.onend = () => {
      setState(s => ({ ...s, isListening: false }));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [playAudioFeedback]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState(s => ({ ...s, isListening: false }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
    ...state,
    videoRef,
    canvasRef,
    startCamera,
    startListening,
    stopListening,
  };
}
