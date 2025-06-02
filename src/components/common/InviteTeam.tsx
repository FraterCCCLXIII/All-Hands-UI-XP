import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface InviteTeamProps {
  organizations: string[];
  currentOrg: string;
  onClose: () => void;
}

const InviteTeam: React.FC<InviteTeamProps> = ({ organizations, currentOrg, onClose }) => {
  const [selectedOrg, setSelectedOrg] = useState(currentOrg);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // For click outside
  const modalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && emailInput.trim()) {
      e.preventDefault();
      addEmail(emailInput.trim());
    }
  };

  const addEmail = (email: string) => {
    if (email && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="invite-team-modal"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-stone-900 border border-stone-700 rounded-xl shadow-xl p-8 w-full max-w-lg relative" ref={modalRef}>
            <button onClick={handleClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-stone-700 focus:outline-none">
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-normal text-stone-200 mb-2">Invite Team Members</h2>
            <p className="text-stone-400 mb-4 font-normal">Invite team members to your organization by entering their email addresses below. They will receive an invitation to join your organization.</p>
            <div className="mb-4">
              <label className="block text-xs text-stone-400 mb-1">Organization</label>
              <div className="relative">
                <select
                  className="w-full rounded bg-stone-800 text-stone-200 p-2 pr-10 appearance-none"
                  value={selectedOrg}
                  onChange={e => setSelectedOrg(e.target.value)}
                >
                  {organizations.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
                {/* Dropdown arrow */}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                {/* Only show 'Current' pill if selectedOrg is currentOrg */}
                {selectedOrg === currentOrg && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 bg-yellow-500 text-stone-900 text-xs font-semibold rounded-full px-3 py-1">Current</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-stone-400 mb-1">Email Addresses</label>
              <div className="flex flex-wrap items-center gap-2 w-full rounded bg-stone-800 text-stone-200 p-2 min-h-[44px] focus-within:ring-2 ring-yellow-500">
                {emails.map(email => (
                  <span key={email} className="flex items-center bg-stone-700 text-stone-200 rounded-full px-3 py-1 text-sm">
                    {email}
                    <button className="ml-2 text-stone-400 hover:text-red-400" onClick={() => removeEmail(email)}>&times;</button>
                  </span>
                ))}
                <input
                  type="email"
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-stone-200 placeholder-stone-400 p-0 m-0 border-none shadow-none"
                  placeholder="Enter email and press Enter"
                  value={emailInput}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                />
              </div>
            </div>
            <button
              className="w-full py-2 rounded bg-yellow-500 text-stone-900 font-normal text-lg hover:bg-yellow-400 disabled:opacity-50"
              disabled={emails.length === 0}
            >
              Send Invites
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteTeam; 