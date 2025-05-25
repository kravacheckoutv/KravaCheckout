import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-8', // Adjusted for potentially better aspect ratio
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/images/logo-krava.png" 
        alt="Krava Logo" 
        className={`${sizeClasses[size]} w-auto`} // Use size class for height, auto width
      />
      {/* Remove text if the logo image includes it, or adjust styling 
      {withText && (
        <div className={`font-heading font-bold ${textSizeClasses[size]} tracking-wider text-krava-white`}>
          KRAVA
        </div>
      )} 
      */}
    </Link>
  );
};

export default Logo;
