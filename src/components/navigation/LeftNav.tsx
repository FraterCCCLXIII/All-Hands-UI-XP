import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  MessageSquare, 
  Settings, 
  Gamepad2,
  FileText,
  Package,
  Shield,
  TestTube,
  Zap,
  Bot,
  User,
  LucideIcon,
  Info,
  Plus,
  LifeBuoy,
  Users
} from 'lucide-react';
import { Theme, ThemeElement } from '../../types/theme';
import { Logo } from '../common/Logo';
import Credits from '../common/Credits';
import CurrentProjects from './CurrentProjects';
import UserSettings from '../common/UserSettings';
import InviteTeam from '../common/InviteTeam';
import HomeInfo from '../common/HomeInfo';

interface NavItem {
  icon: LucideIcon;
  label: string;
  action: string;
  badge?: number;
}

interface LeftNavProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onNavItemClick: (action: string) => void;
  activeNavItem: string;
}

const navItems: NavItem[] = [
  { icon: Plus, label: 'New Project', action: 'new-project' },
  // { icon: Code2, label: 'Code', action: 'code' },
  // { icon: MessageSquare, label: 'Git', action: 'git' },
  // { icon: Package, label: 'Dependencies', action: 'dependencies' },
  // { icon: Shield, label: 'Security', action: 'security' },
  // { icon: TestTube, label: 'Tests', action: 'tests' },
  // { icon: Zap, label: 'Performance', action: 'performance' },
  // { icon: FileText, label: 'Docs', action: 'docs' },
  // { icon: Bot, label: 'AI', action: 'ai' },
  // { icon: Gamepad2, label: 'Tetris', action: 'tetris' },
  // { icon: Settings, label: 'Settings', action: 'settings' },
];

export const LeftNav: React.FC<LeftNavProps> = ({
  theme,
  getThemeClasses,
  isExpanded,
  onExpandChange,
  onNavItemClick,
  activeNavItem,
}) => {
  // Sample projects for demonstration
  const projects = [
    { id: '1', name: 'Project Alpha' },
    { id: '2', name: 'Project Beta' },
    { id: '3', name: 'Project Gamma' },
    { id: '4', name: 'Project Delta' },
    { id: '5', name: 'Project Epsilon' },
    { id: '6', name: 'Project Zeta' },
    { id: '7', name: 'Project Eta' },
    { id: '8', name: 'Project Theta' },
    { id: '9', name: 'Project Iota' },
    { id: '10', name: 'Project Kappa' },
    { id: '11', name: 'Project Lambda' },
    { id: '12', name: 'Project Mu' },
  ];

  const collapseTimeout = useRef<NodeJS.Timeout | null>(null);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [inviteTeamOpen, setInviteTeamOpen] = useState(false);
  const [showHomeInfo, setShowHomeInfo] = useState(false);

  const handleMouseLeave = () => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        onExpandChange(false);
      }, 500);
      collapseTimeout.current = timer;
    }
  };

  const handleMouseEnter = () => {
    if (!isExpanded) {
      onExpandChange(true);
    }
    if (collapseTimeout.current) {
      clearTimeout(collapseTimeout.current);
      collapseTimeout.current = null;
    }
  };

  const handleUserButtonClick = () => setUserSettingsOpen((open) => !open);

  return (
    <motion.div
      className={`fixed left-0 top-0 bottom-0 z-[100] flex flex-col`}
      initial={false}
      animate={{
        width: isExpanded ? 280 : 64,
        x: 0,
      }}
      transition={{ duration: 0.2 }}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {/* Hotspot to open LeftNav when collapsed */}
      {!isExpanded && (
        <div
          className="absolute left-0 top-0 bottom-0 w-16 cursor-pointer z-[101]"
          onMouseEnter={handleMouseEnter}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onExpandChange(true); }}
          aria-label="Open navigation"
        />
      )}

      {/* Logo - Fixed position */}
      <div className="w-16 h-16 mt-2 mb-4 flex items-center justify-start px-4 relative"
        onMouseEnter={() => setShowHomeInfo(true)}
        onMouseLeave={() => setShowHomeInfo(false)}
      >
        <Logo className="w-8 h-8 cursor-pointer" />
        <AnimatePresence>
          {showHomeInfo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-1/2 top-full z-[200] -translate-x-1/2 mt-2"
            >
              <HomeInfo />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavItem === item.action;
          const isNewProject = item.action === 'new-project';
          
          return (
            <motion.button
              key={item.action}
              onClick={() => onNavItemClick(item.action)}
              layout
              className={`${isNewProject && isExpanded ? 'w-full' : ''} mb-2 flex items-center rounded-lg transition-colors whitespace-nowrap ${
                isNewProject 
                  ? `${getThemeClasses('pill-button-bg')} ${getThemeClasses('pill-button-text')} hover:opacity-90`
                  : isActive 
                    ? `${getThemeClasses('active-button-bg')} ${getThemeClasses('active-button-text')}`
                    : `${getThemeClasses('text')} hover:${getThemeClasses('button-hover')}`
              } p-2`}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isNewProject 
                  ? getThemeClasses('pill-button-text')
                  : isActive 
                    ? getThemeClasses('active-button-text') 
                    : getThemeClasses('icon-color')
              }`} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`ml-3 text-sm font-medium whitespace-nowrap ${
                      isNewProject
                        ? getThemeClasses('pill-button-text')
                        : isActive 
                          ? getThemeClasses('active-button-text') 
                          : getThemeClasses('text')
                    }`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
        {/* Current Projects below New Project */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentProjects theme={theme} getThemeClasses={getThemeClasses} projects={projects} />
          </motion.div>
        )}
      </div>

      {/* Menu stacked above user profile, only when expanded */}
      {isExpanded && (
        <div className="w-full px-2 mb-2 flex flex-col items-start gap-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className={`w-full flex flex-col gap-1 bg-transparent`}
          >
            <button className="flex items-center space-x-2 text-xs text-stone-100 hover:text-white focus:outline-none py-1 px-2 rounded transition-colors whitespace-nowrap">
              <FileText className={`w-4 h-4 flex-shrink-0 flex-grow-0 ${getThemeClasses('icon-color')}`} />
              <span>Documentation</span>
            </button>
            <button className="flex items-center space-x-2 text-xs text-stone-100 hover:text-white focus:outline-none py-1 px-2 rounded transition-colors whitespace-nowrap">
              <LifeBuoy className={`w-4 h-4 flex-shrink-0 flex-grow-0 ${getThemeClasses('icon-color')}`} />
              <span>Help</span>
            </button>
            <button
              className="flex items-center space-x-2 text-xs text-stone-100 hover:text-white focus:outline-none py-1 px-2 rounded transition-colors whitespace-nowrap"
              onClick={() => setInviteTeamOpen(true)}
            >
              <Users className={`w-4 h-4 flex-shrink-0 flex-grow-0 ${getThemeClasses('icon-color')}`} />
              <span>Invite Team</span>
            </button>
          </motion.div>
          <div className="mt-2">
            <Credits credits={1000} />
          </div>
          {inviteTeamOpen && (
            <InviteTeam
              organizations={["All Hands AI", "Acme Corp", "Beta Org"]}
              currentOrg="All Hands AI"
              onClose={() => setInviteTeamOpen(false)}
            />
          )}
        </div>
      )}

      {/* User Icon - Bottom aligned */}
      <div className="w-full px-2 mt-auto mb-4">
        <div className="relative">
          <motion.button
            className={`w-full flex items-center rounded-lg transition-colors whitespace-nowrap ${getThemeClasses('text')} hover:${getThemeClasses('button-hover')} p-2`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUserButtonClick}
          >
            <User className={`w-5 h-5 flex-shrink-0 ${getThemeClasses('icon-color')}`} />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`ml-3 text-sm font-medium whitespace-nowrap ${getThemeClasses('text')}`}
                >
                  User Profile
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          {userSettingsOpen && (
            <UserSettings
              theme={theme}
              getThemeClasses={getThemeClasses}
              onClose={() => setUserSettingsOpen(false)}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}; 