import { contextBridge, ipcRenderer } from 'electron'

const windowControls = {
  platform: process.platform,
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized') as Promise<boolean>,
}

contextBridge.exposeInMainWorld('openHandsWindowControls', windowControls)
