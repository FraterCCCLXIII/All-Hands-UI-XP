export type Theme = 'dark' | 'light' | 'sepia';

export type ThemeElement = 
  | 'text'
  | 'bg'
  | 'border'
  | 'input-bg'
  | 'placeholder-text'
  | 'button-bg'
  | 'button-text'
  | 'user-message-bg'
  | 'user-message-text'
  | 'ai-message-bg'
  | 'ai-message-text'
  | 'status-dot-running'
  | 'status-dot-stopped'
  | 'status-text'
  | 'stop-button-bg'
  | 'canvas-bg'
  | 'panel-bg'
  | 'active-button-bg'
  | 'active-button-text'
  | 'pill-button-bg'
  | 'pill-button-text'
  | 'icon-color'
  | 'hover-icon-color'
  | 'hover-resizer-bg'
  | 'stop-button-bg-subtle'
  | 'stop-button-text'
  | 'button-hover'
  | 'scrollbar';

export type ThemeClasses = {
  [key in ThemeElement]: string;
};

export type ThemeClassMap = {
  [key in Theme]: ThemeClasses;
}; 