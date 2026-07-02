import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThessSpotakiLogo({ className = '', showText = true, size = 'md' }: LogoProps) {
  // Dimensions based on size choice
  const dims = {
    sm: { width: 36, height: 36, textClass: 'text-sm' },
    md: { width: 48, height: 48, textClass: 'text-base' },
    lg: { width: 96, height: 96, textClass: 'text-2xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Icon Graphic (Cars, Parking, and Pin) */}
      <svg 
        width={dims.width} 
        height={dims.height} 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Road / Perspective Parking Space (Green trapezoid with dashed lines) */}
        <path 
          d="M48 60L20 110H100L72 60H48Z" 
          fill="#10B981" 
          fillOpacity="0.08" 
        />
        <path 
          d="M48 60L20 110" 
          stroke="#10B981" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeDasharray="6 6" 
        />
        <path 
          d="M72 60L100 110" 
          stroke="#10B981" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeDasharray="6 6" 
        />
        <path 
          d="M32 100H88" 
          stroke="#10B981" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />

        {/* Left Car (Blue, styled to match the graphic icon) */}
        <g id="left-car">
          {/* Car Body Base */}
          <rect x="12" y="74" width="34" height="18" rx="5" fill="#2563EB" />
          <path d="M12 92H16V95C16 96.5 14.5 97 12 97C12 95 12 93 12 92Z" fill="#1E40AF" />
          <path d="M46 92H42V95C42 96.5 43.5 97 46 97C46 95 46 93 46 92Z" fill="#1E40AF" />
          {/* Car Cabin Dome */}
          <path d="M16 75L21 62H37L42 75H16Z" fill="#2563EB" />
          {/* Windshield */}
          <path d="M18 73L22 64H36L40 73H18Z" fill="#1E1E24" fillOpacity="0.2" />
          {/* Headlights */}
          <circle cx="18" cy="83" r="3" fill="#FFFFFF" />
          <circle cx="40" cy="83" r="3" fill="#FFFFFF" />
          {/* Side mirrors */}
          <rect x="8" y="77" width="4" height="3" rx="1" fill="#1E40AF" />
          <rect x="46" y="77" width="4" height="3" rx="1" fill="#1E40AF" />
        </g>

        {/* Right Car (Blue, styled) */}
        <g id="right-car">
          {/* Car Body Base */}
          <rect x="74" y="74" width="34" height="18" rx="5" fill="#2563EB" />
          <path d="M74 92H78V95C78 96.5 76.5 97 74 97C74 95 74 93 74 92Z" fill="#1E40AF" />
          <path d="M108 92H104V95C104 96.5 105.5 97 108 97C108 95 108 93 108 92Z" fill="#1E40AF" />
          {/* Car Cabin Dome */}
          <path d="M78 75L83 62H99L104 75H78Z" fill="#2563EB" />
          {/* Windshield */}
          <path d="M80 73L84 64H98L102 73H80Z" fill="#1E1E24" fillOpacity="0.2" />
          {/* Headlights */}
          <circle cx="80" cy="83" r="3" fill="#FFFFFF" />
          <circle cx="102" cy="83" r="3" fill="#FFFFFF" />
          {/* Side mirrors */}
          <rect x="70" y="77" width="4" height="3" rx="1" fill="#1E40AF" />
          <rect x="108" y="77" width="4" height="3" rx="1" fill="#1E40AF" />
        </g>

        {/* Center Map Pin (Green pin, White inner, Green P) */}
        <g id="map-pin">
          {/* Pin Body Drop Shadow */}
          <path 
            d="M60 12C45.6 12 34 23.6 34 38C34 57.5 60 84 60 84C60 84 86 57.5 86 38C86 23.6 74.4 12 60 12Z" 
            fill="#10B981" 
          />
          {/* Inner Circle */}
          <circle cx="60" cy="38" r="15" fill="#FFFFFF" />
          {/* Bold Letter P */}
          <path 
            d="M55 29H62.5C65.5 29 67.5 30.5 67.5 33.5C67.5 36.5 65.5 38 62.5 38H58V47H55V29ZM58 35.2H62.2C63.6 35.2 64.5 34.6 64.5 33.5C64.5 32.4 63.6 31.8 62.2 31.8H58V35.2Z" 
            fill="#10B981" 
          />
        </g>
      </svg>

      {/* Typography matches user-uploaded text exactly */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className="font-sans font-black tracking-tight flex leading-none">
            <span className="text-[#2563EB]">Thess</span>
            <span className="text-[#10B981]">Spotaki</span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-gray-400 font-bold uppercase mt-0.5 leading-none">
            Mobility app
          </span>
        </div>
      )}
    </div>
  );
}
