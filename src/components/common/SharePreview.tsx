import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Slack, Github, Mail, Facebook, MessageCircle, Share2 } from 'lucide-react';

interface SharePreviewProps {
  shareUrl: string;
  onClose: () => void;
}

// Tooltip component
const Tooltip: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-flex items-center justify-center">
      {React.cloneElement(children as React.ReactElement, {
        onMouseEnter: () => setVisible(true),
        onMouseLeave: () => setVisible(false),
        onFocus: () => setVisible(true),
        onBlur: () => setVisible(false),
        tabIndex: 0,
        role: 'button',
        'aria-label': label,
      })}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[calc(100%+0.5rem)] left-0 px-3 py-1 bg-stone-800 text-white text-xs rounded-full shadow-lg z-50 pointer-events-none whitespace-nowrap"
            role="tooltip"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const XLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="32" height="32" rx="16" fill="black" />
    <path d="M22.5 9.5L9.5 22.5M9.5 9.5L22.5 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const SOCIALS = [
  { name: 'Slack', icon: Slack, color: 'bg-[#4A154B]' },
  { name: 'GitHub', icon: Github, color: 'bg-[#24292F]' },
  { name: 'Email', icon: Mail, color: 'bg-[#EA4335]' },
  { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]' },
  { name: 'X', icon: XLogo, color: 'bg-[#000000]' },
  { name: 'Facebook', icon: Facebook, color: 'bg-[#1877F3]' },
];

const SharePreview: React.FC<SharePreviewProps> = ({ shareUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation to complete before calling onClose
    setTimeout(onClose, 220); // Match the animation duration
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="share-preview-modal"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-stone-900 border border-stone-700 rounded-xl shadow-xl p-8 w-full max-w-md relative z-[101]" ref={modalRef}>
            <button onClick={handleClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-stone-700 focus:outline-none">
              <span className="sr-only">Close</span>
              <X className="w-5 h-5 text-stone-400" />
            </button>
            <h2 className="text-2xl font-normal text-stone-200 mb-2">Share Preview</h2>
            <p className="text-stone-400 mb-4 font-normal">Share this preview with your team or on social platforms.</p>
            <div className="mb-6">
              <label className="block text-xs text-stone-400 mb-1">Share Link</label>
              <div className="flex items-center bg-stone-800 rounded px-3 py-2">
                <span className="flex-1 truncate text-stone-200 text-sm">{shareUrl}</span>
                <button onClick={handleCopy} className="ml-2 p-1 rounded hover:bg-stone-700 transition-colors" title="Copy link">
                  <Copy className="w-4 h-4 text-stone-400" />
                </button>
                {copied && <span className="ml-2 text-xs text-green-400">Copied!</span>}
              </div>
            </div>
            <div className="mb-2">
              <div className="flex gap-4 flex-wrap justify-center">
                {SOCIALS.map(({ name, icon: Icon, color }) => (
                  <Tooltip key={name} label={name}>
                    <span className={`flex items-center justify-center ${color} hover:opacity-90 text-white rounded-full p-3 shadow transition-colors focus:outline-none`}>
                      <Icon className="w-5 h-5" />
                    </span>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharePreview; 