const { contextBridge, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),
});
