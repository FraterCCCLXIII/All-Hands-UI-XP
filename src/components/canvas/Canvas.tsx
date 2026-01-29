import React, { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { CanvasHeader } from './CanvasHeader';
import { TerminalDrawer } from './TerminalDrawer';
import { MessageType } from '../../types/message';
import { ThemeElement } from '../../types/theme';
import { Gripper } from '../common/Gripper';

export type CanvasContentType = 'preview' | 'code' | 'docs' | 'share' | 'run';

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
  onResize?: (width: number) => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

interface CanvasContentTypeProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  contentType: CanvasContentType;
  onResize?: (width: number) => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

interface CanvasErrorProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  error: string;
}

const contentTypeToView: Record<CanvasContentType, 'changes' | 'code' | 'terminal' | 'browser' | 'preview'> = {
  preview: 'preview',
  code: 'code',
  docs: 'code',
  share: 'preview',
  run: 'terminal',
};

export const Canvas: React.FC<CanvasLayoutProps | CanvasContentProps | CanvasContentTypeProps | CanvasErrorProps> = (props) => {
  const [currentView, setCurrentView] = useState<'changes' | 'code' | 'terminal' | 'browser' | 'preview'>('changes');
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const contentType = 'contentType' in props ? props.contentType : null;

  useEffect(() => {
    if (contentType) {
      setIsContentLoading(true);
      const t = setTimeout(() => setIsContentLoading(false), 400);
      return () => clearTimeout(t);
    }
  }, [contentType]);

  useEffect(() => {
    if (contentType) {
      setCurrentView(contentTypeToView[contentType]);
      if (contentType === 'run') {
        setIsTerminalVisible(true);
      }
    }
  }, [contentType]);

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

  const renderContentByType = (type: CanvasContentType) => {
    const titles: Record<CanvasContentType, string> = {
      preview: 'App Preview',
      code: 'Code',
      docs: 'Docs',
      share: 'Share',
      run: 'Run',
    };
    const copy: Record<CanvasContentType, string> = {
      preview: 'Application preview will appear here when running.',
      code: 'Code changes and diffs will appear here.',
      docs: 'Documentation and references will appear here.',
      share: 'Share your project link or invite collaborators.',
      run: 'Build and run output will appear here.',
    };
    return (
      <div className={`p-4 ${props.getThemeClasses('text')}`}>
        <h2 className={`text-lg font-semibold mb-4 ${props.getThemeClasses('text')}`}>
          {titles[type]}
        </h2>
        <div className={`whitespace-pre-wrap ${props.getThemeClasses('text')}`}>{copy[type]}</div>
      </div>
    );
  };

  const renderContent = () => {
    if ('contentType' in props && props.contentType) {
      if (isContentLoading) {
        return (
          <div className="flex flex-col flex-1 gap-3 min-w-max h-full min-h-0">
            <div className="bg-muted/60 border border-border rounded-xl flex flex-col items-center justify-center h-full w-full min-h-[200px]">
              <LoaderCircle
                className={`w-16 h-16 ${props.getThemeClasses('text')} animate-spin`}
                aria-hidden
              />
              <span className="text-sm font-normal leading-5 gradient-flow p-4">
                Loading...
              </span>
            </div>
          </div>
        );
      }
      return renderContentByType(props.contentType);
    }

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
    <div className="flex flex-col h-full bg-muted/60 border border-border rounded-lg" style={{ position: 'relative' }}>
      <CanvasHeader
        getThemeClasses={props.getThemeClasses}
        currentView={currentView}
        isTerminalVisible={isTerminalVisible}
        onViewChange={handleViewChange}
      />
      
      <div className="flex-1 overflow-auto relative">
        {renderContent()}
        {'onResize' in props && props.onResize && (
          <Gripper
            getThemeClasses={props.getThemeClasses}
            onResize={props.onResize}
            initialWidth={props.initialWidth ?? 50}
            minWidth={props.minWidth ?? 30}
            maxWidth={props.maxWidth ?? 70}
          />
        )}
      </div>

      <TerminalDrawer
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