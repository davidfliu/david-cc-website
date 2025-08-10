import React from "react";

// Icon component props interface
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// Minimal inline icons (no external deps)
export const IconPlane = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M10.5 21l1.5-6 7-7a1.5 1.5 0 10-2.12-2.12l-7 7-6 1.5L9 13.5"/>
  </svg>
);

export const IconUtensils = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M4 3v8a2 2 0 002 2h0V3M8 3v10M12 3v6a3 3 0 003 3v9M19 3v10"/>
  </svg>
);

export const IconStars = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M12 3l2.6 5.26L20 9.27l-4 3.9.95 5.53L12 16.9 7.05 18.7 8 13.17l-4-3.9 5.4-1.01L12 3z"/>
  </svg>
);

export const IconSparkle = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z"/>
    <path d="M4 14l.9 2.1L7 17l-2.1.9L4 20l-.9-2.1L1 17l2.1-.9L4 14zM20 12l.75 1.75L22.5 14.5l-1.75.75L20 17l-.75-1.75L17.5 14.5l1.75-.75L20 12z"/>
  </svg>
);

export const IconGift = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13"/><path d="M12 8s-2.5-4-5-4-3 1.5-3 3 1 3 3 3h5"/><path d="M12 8s2.5-4 5-4 3 1.5 3 3-1 3-3 3h-5"/>
  </svg>
);

export const IconLink = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M10.5 13.5a3 3 0 004.24 0l3.76-3.76a3 3 0 10-4.24-4.24l-1.06 1.06"/>
    <path d="M13.5 10.5a3 3 0 00-4.24 0L5.5 14.26a3 3 0 004.24 4.24l1.06-1.06"/>
  </svg>
);

export const IconShield = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M12 3l7 4v6c0 5-3.5 7.5-7 8-3.5-.5-7-3-7-8V7l7-4z"/>
  </svg>
);