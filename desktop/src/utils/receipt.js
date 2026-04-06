// Receipt generation service
const generateReceipt = (order, storeInfo) => {
    const {
        storeName = 'Baymax Shop',
        storeAddress = 'Store Address',
        storePhone = 'Phone Number',
    } = storeInfo;

    const receiptLines = [
        '═══════════════════════════',
        `  ${storeName}`,
        `  ${storeAddress}`,
        `  📞 ${storePhone}`,
        '═══════════════════════════',
        '',
        `Order #: ${order.orderNumber}`,
        `Date: ${new Date(order.createdAt || Date.now()).toLocaleString()}`,
        '───────────────────────────',
        '',
        'Product                   Qty   Price',
        '───────────────────────────',
    ];

    // Add items
    order.items.forEach((item) => {
        const name = item.productName.substring(0, 15).padEnd(15);
        const qty = String(item.quantity).padStart(3);
        const price = String(item.total.toFixed(2)).padStart(8);
        receiptLines.push(`${name} ${qty} ${price}`);
    });

    receiptLines.push('───────────────────────────');
    receiptLines.push(`Subtotal:              ${order.subtotal.toFixed(2)}`);

    if (order.discount > 0) {
        receiptLines.push(`Discount:             -${order.discount.toFixed(2)}`);
    }

    if (order.tax > 0) {
        receiptLines.push(`Tax:                  +${order.tax.toFixed(2)}`);
    }

    receiptLines.push('═══════════════════════════');
    receiptLines.push(`TOTAL:                 ${order.total.toFixed(2)}`);
    receiptLines.push('═══════════════════════════');
    receiptLines.push('');
    receiptLines.push('    🙏 Thank You! 🙏');
    receiptLines.push('       Come Again!');
    receiptLines.push('');

    return receiptLines.join('\n');
};

export default generateReceipt;
