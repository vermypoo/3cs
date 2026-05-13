import React, { useState } from 'react';
import { Car } from 'lucide-react';

interface LogoProps {
  className?: string;
  src?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center bg-blue-500/10 rounded-full overflow-hidden`}>
      <img 
        src="/logo.png" 
        alt="3CS Logo" 
        className="w-full h-full object-contain" 
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;
