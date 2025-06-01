import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { Theme, ThemeElement } from '../../types/theme';
import { Logo } from '../common/Logo';

interface NavItem {
  icon: LucideIcon;
  label: string;
  action: string;
  badge?: number;
}

interface LeftNavProps {
  theme: Theme;
  getThemeClasses: (element: ThemeElement) => string;
  onNavItemClick: (action: string) => void;
  activeItem: string;
}

const navItems: NavItem[] = [
  { icon: Code2, label: 'Code', action: 'code' },
  { icon: MessageSquare, label: 'Git', action: 'git' },
  { icon: Package, label: 'Dependencies', action: 'dependencies' },
  { icon: Shield, label: 'Security', action: 'security' },
  { icon: TestTube, label: 'Tests', action: 'tests' },
  { icon: Zap, label: 'Performance', action: 'performance' },
  { icon: FileText, label: 'Docs', action: 'docs' },
  { icon: Bot, label: 'AI', action: 'ai' },
  { icon: Gamepad2, label: 'Tetris', action: 'tetris' },
  { icon: Settings, label: 'Settings', action: 'settings' },
];

export const LeftNav: React.FC<LeftNavProps> = ({
  theme,
  getThemeClasses,
  onNavItemClick,
  activeItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.nav
      className={`h-full flex flex-col items-start border-r ${getThemeClasses('border')} ${getThemeClasses('bg')}`}
      initial={{ width: 64 }}
      animate={{ width: isExpanded ? 200 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
    >
      {/* Logo - Fixed position */}
      <div className="w-16 h-16 mt-4 mb-8 flex items-center justify-center">
        <Logo className="w-8 h-8" />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.action;
          
          return (
            <motion.button
              key={item.action}
              onClick={() => onNavItemClick(item.action)}
              className={`w-full mb-2 flex items-center rounded-lg transition-colors ${
                isActive 
                  ? `${getThemeClasses('active-button-bg')} ${getThemeClasses('active-button-text')}`
                  : `${getThemeClasses('text')} hover:${getThemeClasses('button-hover')}`
              } p-2`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? getThemeClasses('active-button-text') : getThemeClasses('icon-color')}`} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`ml-3 text-sm font-medium whitespace-nowrap ${
                      isActive ? getThemeClasses('active-button-text') : getThemeClasses('text')
                    }`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Version Info - Fixed position */}
      <div className="w-16 h-8 mb-4 flex items-center justify-center">
        <Info className={`w-4 h-4 ${getThemeClasses('icon-color')}`} />
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-16"
            >
              <span className={`text-xs whitespace-nowrap ${getThemeClasses('status-text')}`}>
                v0.1.0
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}; 