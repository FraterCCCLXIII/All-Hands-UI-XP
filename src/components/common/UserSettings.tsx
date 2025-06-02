import React, { useState } from 'react';
import { X, Smartphone, Users, Key, LogOut, GitBranch, Settings, Shield, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserSettingsProps {
  theme: string;
  getThemeClasses: (element: string) => string;
  onClose: () => void;
}

type Panel = 'none' | 'git' | 'application' | 'credits' | 'secrets' | 'apikeys' | 'organizations' | 'appkeys';

const UserSettings: React.FC<UserSettingsProps> = ({ theme, getThemeClasses, onClose }) => {
  const [openPanel, setOpenPanel] = useState<Panel>('none');

  // Example organizations
  const organizations = [
    'All Hands AI',
    'Acme Corp',
    'Beta Org',
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="usersettings-modal"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`absolute left-0 bottom-12 w-[600px] bg-stone-900 border ${getThemeClasses('border')} rounded-xl shadow-xl z-50 p-4 flex gap-8`}
        style={{ minWidth: 520, marginLeft: 0 }}
      >
        <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-stone-700 focus:outline-none">
          <X className="w-5 h-5 text-stone-400" />
        </button>
        {/* Main Nav Column */}
        <div className="flex-1 min-w-[200px]">
          <div className="text-xs text-stone-400 mb-1">Personal Settings</div>
          <div className="text-sm text-stone-200 font-semibold mb-2">robert@all-hands.dev</div>
          <button className="text-red-400 hover:text-red-300 text-sm font-medium mb-2 flex items-center gap-2"><LogOut className="w-4 h-4" />Log Out</button>
          <button className="text-stone-200 hover:text-white text-sm mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4" />Log In to Mobile</button>
          <button className="text-stone-200 hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('git')}><GitBranch className="w-4 h-4" />Git</button>
          <button className="text-stone-200 hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('application')}><Settings className="w-4 h-4" />Application</button>
          <button className="text-stone-200 hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('credits')}><DollarSign className="w-4 h-4" />Credits</button>
          <button className="text-stone-200 hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('secrets')}><Shield className="w-4 h-4" />Secrets</button>
          <button className="text-stone-200 hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('apikeys')}><Key className="w-4 h-4" />API Keys</button>
          <button className="text-stone-200 hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('organizations')}><Users className="w-4 h-4" />My Organizations</button>
        </div>
        {/* Content Panel */}
        <div className="flex-1 min-w-[260px]">
          {openPanel === 'git' && (
            <div>
              <div className="text-lg font-semibold mb-4 text-stone-200">Git</div>
              <button className="px-4 py-2 rounded bg-stone-800 text-stone-200 hover:bg-stone-700 font-medium">Configure Github Repositories</button>
            </div>
          )}
          {openPanel === 'application' && (
            <div>
              <div className="text-lg font-semibold mb-4 text-stone-200">Application</div>
              <div className="mb-4">
                <label className="block text-xs text-stone-400 mb-1">Language</label>
                <select className="w-full rounded bg-stone-800 text-stone-200 p-2">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-200">Enable analytics</span>
                <input type="checkbox" className="accent-yellow-400 w-5 h-5" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-200">Sound Notifications</span>
                <input type="checkbox" className="accent-yellow-400 w-5 h-5" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-200">Suggest Tasks on GitHub</span>
                <input type="checkbox" className="accent-yellow-400 w-5 h-5" />
              </div>
            </div>
          )}
          {openPanel === 'credits' && (
            <div>
              <div className="text-lg font-semibold mb-4 text-stone-200">Credits</div>
              <div className="mb-2">Manage Credits</div>
              <div className="text-2xl font-bold text-green-400 mb-4">$157.42</div>
              <button className="px-4 py-2 rounded bg-yellow-500 text-stone-900 font-semibold mb-4">Add Funds</button>
              <div className="mb-2 text-xs text-stone-400">Specify an amount in USD to add - min $10</div>
              <input type="number" min={10} placeholder="$10.00" className="w-full rounded bg-stone-800 text-stone-200 p-2 mb-2" />
              <button className="px-4 py-2 rounded bg-stone-800 text-stone-200 hover:bg-stone-700 font-medium w-full">Add credit</button>
            </div>
          )}
          {openPanel === 'secrets' && (
            <div>
              <div className="text-lg font-semibold mb-4 text-stone-200">Secrets</div>
              <div className="mb-4 text-stone-400">No secrets found</div>
              <button className="px-4 py-2 rounded bg-stone-800 text-stone-200 hover:bg-stone-700 font-medium">Add a new secret</button>
            </div>
          )}
          {openPanel === 'apikeys' && (
            <div>
              <div className="text-lg font-semibold mb-4 text-stone-200">API Keys</div>
              <button className="px-4 py-2 rounded bg-stone-800 text-stone-200 hover:bg-stone-700 font-medium mb-4">Create API Key</button>
              <div className="text-xs text-stone-400 mb-2">API keys allow you to authenticate with the OpenHands API programmatically. Keep your API keys secure; anyone with your API key can access your account. For more information on how to use the API, see our API documentation.</div>
            </div>
          )}
          {openPanel === 'organizations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-stone-200">My Organizations</div>
                <button className="px-3 py-1 rounded bg-yellow-500 text-stone-900 font-semibold text-sm hover:bg-yellow-400">Create Organization</button>
              </div>
              <ul>
                {organizations.map(org => (
                  <li key={org}>
                    <button className="w-full text-left px-2 py-1 rounded hover:bg-stone-800 text-stone-200 mb-1" onClick={() => setOpenPanel('none')}>{org}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* When openPanel is 'none', show nothing */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserSettings; 