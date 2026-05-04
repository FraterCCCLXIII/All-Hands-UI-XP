import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devServerUrl = process.env.VITE_DEV_SERVER_URL
const appName = 'OpenHands'

function getActiveWindow() {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
}

ipcMain.handle('window:minimize', () => {
  getActiveWindow()?.minimize()
})

ipcMain.handle('window:toggle-maximize', () => {
  const activeWindow = getActiveWindow()

  if (!activeWindow) {
    return
  }

  if (activeWindow.isMaximized()) {
    activeWindow.unmaximize()
    return
  }

  activeWindow.maximize()
})

ipcMain.handle('window:close', () => {
  getActiveWindow()?.close()
})

ipcMain.handle('window:is-maximized', () => getActiveWindow()?.isMaximized() ?? false)

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 1000,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    title: appName,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (devServerUrl) {
    void mainWindow.loadURL(devServerUrl)
    return
  }

  void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
