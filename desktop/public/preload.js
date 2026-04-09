import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),
});
