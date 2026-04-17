import React, { useState } from 'react';
import { X, Smartphone, Users, Key, LogOut, GitBranch, Settings, Shield, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeElement } from '../../types/theme';

interface UserSettingsProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  onClose: () => void;
}

type Panel = 'none' | 'git' | 'application' | 'credits' | 'secrets' | 'apikeys' | 'organizations' | 'appkeys';

const UserSettings: React.FC<UserSettingsProps> = ({ getThemeClasses, onClose }) => {
  const [openPanel, setOpenPanel] = useState<Panel>('none');

  // Example organizations
  const organizations = [
    'OpenHands',
    'Acme Corp',
    'Beta Org',
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="usersettings-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="absolute left-0 bottom-12 z-50"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`w-[600px] bg-background border ${getThemeClasses('border')} rounded-xl shadow-xl p-4 flex gap-8`}
          style={{ minWidth: 520, marginLeft: 0 }}
        >
          <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/60 focus:outline-none">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          {/* Main Nav Column */}
          <div className="flex-1 min-w-[200px]">
            <div className="text-xs text-muted-foreground mb-1">Personal Settings</div>
            <div className="text-sm text-foreground font-semibold mb-2">robert@all-hands.dev</div>
            <button className="text-destructive hover:text-destructive/80 text-sm font-medium mb-2 flex items-center gap-2"><LogOut className="w-4 h-4" />Log Out</button>
            <button className="text-foreground hover:text-white text-sm mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4" />Log In to Mobile</button>
            <button className="text-foreground hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('git')}><GitBranch className="w-4 h-4" />Git</button>
            <button className="text-foreground hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('application')}><Settings className="w-4 h-4" />Application</button>
            <button className="text-foreground hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('credits')}><DollarSign className="w-4 h-4" />Credits</button>
            <button className="text-foreground hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('secrets')}><Shield className="w-4 h-4" />Secrets</button>
            <button className="text-foreground hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('apikeys')}><Key className="w-4 h-4" />API Keys</button>
            <button className="text-foreground hover:text-white text-sm mb-2 flex items-center gap-2" onClick={() => setOpenPanel('organizations')}><Users className="w-4 h-4" />My Organizations</button>
          </div>
          {/* Content Panel */}
          <div className="flex-1 min-w-[260px]">
            {openPanel === 'git' && (
              <div>
                <div className="text-lg font-semibold mb-4 text-foreground">Git</div>
                <button className="px-4 py-2 rounded bg-card text-foreground hover:bg-muted/60 font-medium">Configure Github Repositories</button>
              </div>
            )}
            {openPanel === 'application' && (
              <div>
                <div className="text-lg font-semibold mb-4 text-foreground">Application</div>
                <div className="mb-4">
                  <label className="block text-xs text-muted-foreground mb-1">Language</label>
                  <select className="w-full rounded bg-card text-foreground p-2">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Enable analytics</span>
                  <input type="checkbox" className="accent-yellow-400 w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Sound Notifications</span>
                  <input type="checkbox" className="accent-yellow-400 w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Suggest Tasks on GitHub</span>
                  <input type="checkbox" className="accent-yellow-400 w-5 h-5" />
                </div>
              </div>
            )}
            {openPanel === 'credits' && (
              <div>
                <div className="text-lg font-semibold mb-4 text-foreground">Credits</div>
                <div className="mb-2">Manage Credits</div>
                <div className="text-2xl font-bold text-success-foreground mb-4">$157.42</div>
                <button className="px-4 py-2 rounded bg-yellow-500 text-foreground font-semibold mb-4">Add Funds</button>
                <div className="mb-2 text-xs text-muted-foreground">Specify an amount in USD to add - min $10</div>
                <input type="number" min={10} placeholder="$10.00" className="w-full rounded bg-card text-foreground p-2 mb-2" />
                <button className="px-4 py-2 rounded bg-card text-foreground hover:bg-muted/60 font-medium w-full">Add credit</button>
              </div>
            )}
            {openPanel === 'secrets' && (
              <div>
                <div className="text-lg font-semibold mb-4 text-foreground">Secrets</div>
                <div className="mb-4 text-muted-foreground">No secrets found</div>
                <button className="px-4 py-2 rounded bg-card text-foreground hover:bg-muted/60 font-medium">Add a new secret</button>
              </div>
            )}
            {openPanel === 'apikeys' && (
              <div>
                <div className="text-lg font-semibold mb-4 text-foreground">API Keys</div>
                <button className="px-4 py-2 rounded bg-card text-foreground hover:bg-muted/60 font-medium mb-4">Create API Key</button>
                <div className="text-xs text-muted-foreground mb-2">API keys allow you to authenticate with the OpenHands API programmatically. Keep your API keys secure; anyone with your API key can access your account. For more information on how to use the API, see our API documentation.</div>
              </div>
            )}
            {openPanel === 'organizations' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-foreground">My Organizations</div>
                  <button className="px-3 py-1 rounded bg-yellow-500 text-foreground font-semibold text-sm hover:bg-yellow-400">Create Organization</button>
                </div>
                <ul>
                  {organizations.map(org => (
                    <li key={org}>
                      <button className="w-full text-left px-2 py-1 rounded hover:bg-card text-foreground mb-1" onClick={() => setOpenPanel('none')}>{org}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* When openPanel is 'none', show nothing */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserSettings; 