import React, { useEffect, useState } from 'react';

interface FastPageTransitionProps {
  children: React.ReactNode;
}

export default function FastPageTransition({ children }: FastPageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Immediate render without delay
    setIsVisible(true);
  }, []);

  if (!isVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}