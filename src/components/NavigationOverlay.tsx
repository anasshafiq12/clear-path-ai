import React from 'react';

interface NavigationOverlayProps {
  instruction: string;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({ instruction }) => {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-background/85 backdrop-blur-md border-t border-border px-6 py-6"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
        Navigation Instruction
      </p>
      <p className="text-2xl md:text-4xl font-mono font-bold text-nav-instruction leading-tight">
        {instruction || 'Waiting for instructions…'}
      </p>
    </div>
  );
};

export default NavigationOverlay;
