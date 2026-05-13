import React, { useState } from 'react';
import { Car } from 'lucide-react';

interface LogoProps {
  className?: string;
  src?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  const [error, setError] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Ensure we don't have double slashes
  const logoPath = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}logo.png`;

  return (
    <div className={`${className} relative flex items-center justify-center bg-blue-500/10 rounded-full overflow-hidden transition-all duration-300 group`}>
      {!error ? (
        <img 
          src={logoPath} 
          alt="3CS Logo" 
          className="w-full h-full object-contain" 
          onError={() => setError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <Car size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
      )}
    </div>
  );
};

export default Logo;
