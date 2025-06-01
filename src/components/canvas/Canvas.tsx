import React, { useState } from 'react';
import { CanvasHeader } from './CanvasHeader';
import { TerminalDrawer } from './TerminalDrawer';
import { MessageType } from '../../types/message';
import { ThemeElement } from '../../types/theme';

interface CanvasLayoutProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  children: React.ReactNode;
}

interface CanvasContentProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  content: {
    type: MessageType;
    text: string;
    headerText?: string;
  };
}

interface CanvasErrorProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  error: string;
}

export const Canvas: React.FC<CanvasLayoutProps | CanvasContentProps | CanvasErrorProps> = (props) => {
  const [currentView, setCurrentView] = useState<'changes' | 'code' | 'terminal' | 'browser' | 'preview'>('changes');
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);

  const handleTerminalResize = (newHeight: number) => {
    setTerminalHeight(newHeight);
  };

  const handleTerminalMinimize = () => {
    setTerminalHeight(32); // Collapse to just show header
  };

  const handleTerminalClose = () => {
    setIsTerminalVisible(false);
  };

  const handleViewChange = (view: 'changes' | 'code' | 'terminal' | 'browser' | 'preview') => {
    if (view === 'terminal') {
      setIsTerminalVisible(!isTerminalVisible);
    } else {
      setCurrentView(view);
    }
  };

  const renderContent = () => {
    if ('content' in props && props.content) {
      return (
        <div className={`p-4 ${props.getThemeClasses('text')}`}>
          {props.content.headerText && (
            <h2 className={`text-lg font-semibold mb-4 ${props.getThemeClasses('text')}`}>
              {props.content.headerText}
            </h2>
          )}
          <div className="whitespace-pre-wrap">{props.content.text}</div>
        </div>
      );
    }
    
    if ('error' in props) {
      return (
        <div className={`p-4 text-red-500 ${props.getThemeClasses('text')}`}>
          {props.error}
        </div>
      );
    }
    
    if ('children' in props) {
      return props.children;
    }
    
    return null;
  };

  return (
    <div className={`flex flex-col h-full border rounded-lg ${props.getThemeClasses('border')}`}>
      <CanvasHeader
        theme={props.theme}
        getThemeClasses={props.getThemeClasses}
        currentView={currentView}
        isTerminalVisible={isTerminalVisible}
        onViewChange={handleViewChange}
      />
      
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      <TerminalDrawer
        theme={props.theme}
        getThemeClasses={props.getThemeClasses}
        isVisible={isTerminalVisible}
        height={terminalHeight}
        onResize={handleTerminalResize}
        onMinimize={handleTerminalMinimize}
        onClose={handleTerminalClose}
      />
    </div>
  );
}; 