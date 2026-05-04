/// <reference types="vite/client" />

interface OpenHandsWindowControls {
  platform: NodeJS.Platform;
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
}

interface Window {
  openHandsWindowControls?: OpenHandsWindowControls;
}
