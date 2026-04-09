const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),
});
