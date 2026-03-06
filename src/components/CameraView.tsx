import React, { useEffect } from 'react';
import NavigationOverlay from './NavigationOverlay';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  instruction: string;
  isCapturing: boolean;
  onStartCamera: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  instruction,
  isCapturing,
  onStartCamera,
}) => {
  useEffect(() => {
    onStartCamera();
  }, [onStartCamera]);

  return (
    <div className="relative w-full flex-1 bg-muted overflow-hidden rounded-xl border border-border">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        aria-label="Camera preview"
      />
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {!isCapturing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xl font-mono text-muted-foreground">
            Initializing camera…
          </p>
        </div>
      )}

      <NavigationOverlay instruction={instruction} />
    </div>
  );
};

export default CameraView;
