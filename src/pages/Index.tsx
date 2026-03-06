import { useNavigation } from '@/hooks/useNavigation';
import CameraView from '@/components/CameraView';
import VoiceButton from '@/components/VoiceButton';
import StatusIndicator from '@/components/StatusIndicator';
import { Navigation } from 'lucide-react';

const Index = () => {
  const {
    instruction,
    isConnected,
    isCapturing,
    isListening,
    gpsStatus,
    videoRef,
    canvasRef,
    startCamera,
    startListening,
    stopListening,
  } = useNavigation();

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 gap-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="w-8 h-8 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold font-mono text-foreground tracking-tight">
            NavAI
          </h1>
        </div>
        <StatusIndicator
          isConnected={isConnected}
          gpsStatus={gpsStatus}
          isCapturing={isCapturing}
        />
      </header>

      {/* Camera + Overlay */}
      <CameraView
        videoRef={videoRef as React.RefObject<HTMLVideoElement>}
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        instruction={instruction}
        isCapturing={isCapturing}
        onStartCamera={startCamera}
      />

      {/* Voice Control Bar */}
      <div className="flex items-center justify-center py-4">
        <VoiceButton
          isListening={isListening}
          onStart={startListening}
          onStop={stopListening}
        />
      </div>

      {/* Accessibility: skip link target */}
      <a href="#main" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
    </div>
  );
};

export default Index;
