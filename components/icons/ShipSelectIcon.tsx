
import React from 'react';

const ShipSelectIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={1.5} 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    {/* Ship list */}
    <rect x="14" y="4" width="6" height="2.5" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="14" y="8" width="6" height="2.5" rx="1" fill="currentColor" opacity="1"/>
    <rect x="14" y="12" width="6" height="2.5" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="14" y="16" width="6" height="2.5" rx="1" fill="currentColor" opacity="0.6"/>

    {/* Cursor */}
    <path d="M4.5 4.5l8 8-3 1 1 3-8-8 2-4z" fill="currentColor"/>
    <path d="M12.5 12.5l-8-8" stroke="white" strokeWidth="1"/>
  </svg>
);

export default ShipSelectIcon;
