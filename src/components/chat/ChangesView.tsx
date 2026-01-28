import React from 'react';
import { FileCode, Plus, Minus } from 'lucide-react';
import { ThemeElement } from '../../types/theme';

export interface FileChange {
  name: string;
  additions: number;
  deletions: number;
}

interface ChangesViewProps {
  changes: FileChange[];
  getThemeClasses: (element: ThemeElement) => string;
}

export const ChangesView: React.FC<ChangesViewProps> = ({ changes, getThemeClasses }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-2 py-2">
          {changes.map((file, index) => (
            <button
              key={`${file.name}-${index}`}
              type="button"
              className={[
                'group w-full p-3 rounded-lg transition-all duration-200 text-left',
                getThemeClasses('button-hover'),
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <FileCode className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getThemeClasses('active-button-text')}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-mono truncate ${getThemeClasses('text')}`}>{file.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {file.additions > 0 && (
                      <div className="flex items-center gap-1">
                        <Plus className={`w-3 h-3 ${getThemeClasses('success-text')}`} />
                        <span className={`text-xs font-medium ${getThemeClasses('success-text')}`}>
                          {file.additions}
                        </span>
                      </div>
                    )}
                    {file.deletions > 0 && (
                      <div className="flex items-center gap-1">
                        <Minus className={`w-3 h-3 ${getThemeClasses('error-text')}`} />
                        <span className={`text-xs font-medium ${getThemeClasses('error-text')}`}>
                          {file.deletions}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
