
import React from 'react';

export const SITCLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 500 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Palm Tree - Gold */}
    <path d="M250 100 C250 80 265 50 250 20 C235 50 250 80 250 100 Z" fill="#d4af37" className="opacity-90"/>
    <g stroke="#d4af37" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M250 20 Q220 10 200 40" />
        <path d="M250 20 Q280 10 300 40" />
        <path d="M250 20 Q210 -5 180 20" />
        <path d="M250 20 Q290 -5 320 20" />
        <path d="M250 20 Q230 -10 200 0" />
        <path d="M250 20 Q270 -10 300 0" />
    </g>

    {/* Arabic Text: الدولية */}
    <text x="250" y="180" textAnchor="middle" fill="#d4af37" fontSize="110" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
      الدولية
    </text>

    {/* Blue Swoosh */}
    <path d="M100 200 Q250 260 400 140" stroke="#0c4a6e" strokeWidth="6" strokeLinecap="round" />

    {/* English Text - White/Light */}
    <text x="250" y="250" textAnchor="middle" fill="#f8fafc" fontSize="26" fontFamily="Montserrat, sans-serif" fontWeight="500" letterSpacing="1">
      Saudi International Travel Company
    </text>
  </svg>
);

export const PalmLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 95 C50 80, 60 60, 50 40 C40 60, 50 80, 50 95 Z" fill="currentColor" className="opacity-90"/>
    <path d="M50 40 Q30 30 20 50" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80"/>
    <path d="M50 40 Q70 30 80 50" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80"/>
    <path d="M50 40 Q35 10 10 30" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80"/>
    <path d="M50 40 Q65 10 90 30" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80"/>
    <path d="M50 40 Q50 10 50 5" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80"/>
  </svg>
);

export const BedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/>
    <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
    <path d="M12 4v6"/>
    <path d="M2 18h20"/>
  </svg>
);

export const MeetingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"/>
    <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"/>
    <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    <path d="M12 14v4"/>
    <path d="M8 14v4"/>
    <path d="M16 14v4"/>
  </svg>
);

export const UtensilsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);

export const PlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h20"/>
    <path d="M13 2l9 10-9 10-9-10 9-10z"/>
  </svg>
);

export const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);

export const CustomIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

export const BusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 10h16" />
    <path d="M8 18v2" />
    <path d="M16 18v2" />
  </svg>
);

export const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

export const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

export const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
