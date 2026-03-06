import React from 'react';

interface StatusIndicatorProps {
  isConnected: boolean;
  gpsStatus: 'idle' | 'tracking' | 'error';
  isCapturing: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected, gpsStatus, isCapturing }) => {
  return (
    <div
      className="flex items-center gap-4 rounded-lg bg-secondary px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="System status"
    >
      <StatusDot
        active={isConnected}
        label={isConnected ? 'Backend Connected' : 'Backend Disconnected'}
        activeClass="bg-status-connected"
        inactiveClass="bg-status-disconnected"
      />
      <StatusDot
        active={gpsStatus === 'tracking'}
        label={gpsStatus === 'tracking' ? 'GPS Active' : gpsStatus === 'error' ? 'GPS Error' : 'GPS Idle'}
        activeClass="bg-status-connected"
        inactiveClass={gpsStatus === 'error' ? 'bg-status-disconnected' : 'bg-muted-foreground'}
      />
      <StatusDot
        active={isCapturing}
        label={isCapturing ? 'Camera Active' : 'Camera Off'}
        activeClass="bg-status-connected"
        inactiveClass="bg-muted-foreground"
      />
    </div>
  );
};

const StatusDot: React.FC<{
  active: boolean;
  label: string;
  activeClass: string;
  inactiveClass: string;
}> = ({ active, label, activeClass, inactiveClass }) => (
  <div className="flex items-center gap-2">
    <span
      className={`inline-block h-3 w-3 rounded-full ${active ? activeClass : inactiveClass} ${active ? 'animate-pulse' : ''}`}
      aria-hidden="true"
    />
    <span className="text-sm font-mono font-semibold text-foreground">{label}</span>
  </div>
);

export default StatusIndicator;
