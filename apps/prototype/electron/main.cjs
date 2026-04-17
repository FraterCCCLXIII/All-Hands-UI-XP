const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

/** Load Vite dev server only when explicitly started via `npm run electron:dev`. */
const isDev = process.env.ELECTRON_DEV === '1';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    show: false,
    backgroundColor: '#0d0d0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  const sendMaximized = () => {
    if (!mainWindow?.isDestroyed()) {
      mainWindow.webContents.send('window:maximized-changed', mainWindow.isMaximized());
    }
  };

  mainWindow.on('maximize', sendMaximized);
  mainWindow.on('unmaximize', sendMaximized);
  mainWindow.on('enter-full-screen', sendMaximized);
  mainWindow.on('leave-full-screen', sendMaximized);
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('window:minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
  });

  ipcMain.handle('window:toggle-maximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
  });

  ipcMain.handle('window:is-maximized', () =>
    Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isMaximized()),
  );

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
