import React from 'react';

const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.93l2.5-4.5M17 4h-2.5" />
    </svg>
);

export default ThumbsDownIcon;
