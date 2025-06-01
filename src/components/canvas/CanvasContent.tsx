import React from 'react';
import { ThemeElement } from '../../types/theme';
import { MessageType } from '../../types/message';

interface CanvasContentProps {
  theme: string;
  getThemeClasses: (element: ThemeElement) => string;
  content: {
    type: MessageType;
    text: string;
    headerText?: string;
  } | null;
}

export const CanvasContent: React.FC<CanvasContentProps> = ({
  theme,
  getThemeClasses,
  content,
}) => {
  if (!content) return null;

  return (
    <div className="flex-grow overflow-auto p-4">
      <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}>
        {content.type === 'code' ? (
          <pre className={`w-full overflow-auto rounded-md p-4 whitespace-pre-wrap ${
            theme === 'dark' 
              ? 'bg-stone-800 text-stone-200' 
              : theme === 'light' 
                ? 'bg-stone-200 text-stone-800' 
                : 'bg-[rgb(215,205,190)] text-[rgb(100,80,60)]'
          }`}>
            <code>{content.text}</code>
          </pre>
        ) : (
          <div className={getThemeClasses('text')}>
            {content.text}
          </div>
        )}
      </div>
    </div>
  );
}; 