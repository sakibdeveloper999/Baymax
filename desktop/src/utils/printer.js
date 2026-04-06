// Printer integration service
const printReceipt = async (receiptText) => {
    try {
        if (window.electron) {
            // Electron environment
            const result = await window.electron.printReceipt(receiptText);
            return result;
        } else {
            // Browser environment (fallback to print dialog)
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<pre>' + receiptText + '</pre>');
            printWindow.document.close();
            printWindow.print();
            return { success: true };
        }
    } catch (error) {
        console.error('❌ Print error:', error);
        return { success: false, error: error.message };
    }
};

export default printReceipt;
