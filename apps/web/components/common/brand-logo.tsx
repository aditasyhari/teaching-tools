import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export function BrandLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
  variant = 'light',
}: BrandLogoProps): React.JSX.Element {
  const imgSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 sm:h-9 w-auto',
    lg: 'h-11 sm:h-12 w-auto',
  };

  const titleSizes = {
    sm: 'text-sm sm:text-base font-extrabold',
    md: 'text-base sm:text-lg font-extrabold',
    lg: 'text-xl sm:text-2xl font-black',
  };

  const subSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official walikelas.id logo */}
      <img
        src="/logo.png"
        alt="WaliKelas"
        className={`${imgSizes[size]} object-contain shrink-0`}
      />
      <div className="flex flex-col text-left">
        <span
          className={`${titleSizes[size]} leading-tight tracking-tight ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}
        >
          WaliKelas
        </span>
        {showSubtitle && (
          <span
            className={`${subSizes[size]} font-semibold leading-tight ${
              isDark ? 'text-slate-400' : 'text-stone-500'
            }`}
          >
            Teaching Tools
          </span>
        )}
      </div>
    </div>
  );
}

