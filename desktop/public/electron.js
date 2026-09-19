const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { join } = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            enableRemoteModule: false,
            preload: join(__dirname, 'preload.js'),
        },
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Handlers (for printing, file system access, etc.)
ipcMain.handle('print-receipt', async (event, receiptData) => {
    const printWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
    try {
        const text = String(receiptData).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
        await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;"><pre>' + text + '</pre>'));
        return await new Promise((resolve) => {
            printWindow.webContents.print({ silent: false }, (success, failureReason) => {
                resolve({ success, ...(success ? {} : { error: failureReason }) });
            });
        });
    } catch (error) {
        return { success: false, error: error.message };
    } finally {
        printWindow.close();
    }
});
