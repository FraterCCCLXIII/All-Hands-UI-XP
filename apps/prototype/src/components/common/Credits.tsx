import React, { useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface CreditsProps {
  credits: number;
}

const DROPDOWN_ITEMS = [
  { label: 'Personal', credits: 1000 },
  { label: 'Org 1', credits: 5000 },
  { label: 'Org 2', credits: 2500 },
];

const Credits: React.FC<CreditsProps> = ({ credits }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative inline-block" ref={ref}>
      <div
        className="inline-flex items-center space-x-2 rounded-full bg-stone-800 text-stone-100 text-xs font-medium px-4 py-1 shadow cursor-pointer hover:bg-stone-700 transition-colors"
        title="Credits available"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1">
          <circle cx="10" cy="10" r="8" fill="#FFD700" stroke="#C9A100" strokeWidth="2" />
          <circle cx="10" cy="10" r="4" fill="#FFF7B2" />
        </svg>
        {credits}
        <ChevronRight className="w-4 h-4 ml-2 text-stone-400" />
      </div>
      {/* Invisible buffer to catch mouse events */}
      {open && (
        <div className="absolute left-full bottom-0 flex z-50">
          <div
            className="w-2 h-full"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          />
          <div
            className="min-w-[160px] rounded-xl bg-stone-900 border border-stone-700 shadow-lg p-2 flex flex-col space-y-2"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {DROPDOWN_ITEMS.map(item => (
              <div key={item.label} className="flex items-center justify-between px-2 py-1 hover:bg-stone-800 rounded-lg cursor-pointer">
                <span className="text-xs text-stone-100">{item.label}</span>
                <span className="inline-flex items-center space-x-1 rounded-full bg-stone-800 text-stone-100 text-xs font-medium px-3 py-0.5 ml-2">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1">
                    <circle cx="10" cy="10" r="8" fill="#FFD700" stroke="#C9A100" strokeWidth="2" />
                    <circle cx="10" cy="10" r="4" fill="#FFF7B2" />
                  </svg>
                  {item.credits}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits; 