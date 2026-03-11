import path from 'node:path';
import { app, BrowserWindow } from 'electron';

const isDev = !app.isPackaged;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    window.loadURL('http://localhost:5173');
    window.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  window.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
