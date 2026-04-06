// Billing calculation utilities
const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
};

const applyDiscount = (subtotal, discount, isPercentage = false) => {
    if (isPercentage) {
        return subtotal - (subtotal * discount) / 100;
    }
    return subtotal - discount;
};

const calculateTax = (amount, taxRate) => {
    return (amount * taxRate) / 100;
};

const getTotal = (subtotal, discount = 0, tax = 0) => {
    return subtotal - discount + tax;
};

const roundAmount = (amount, roundType = 'nearest') => {
    if (roundType === 'up') return Math.ceil(amount);
    if (roundType === 'down') return Math.floor(amount);
    return Math.round(amount);
};

export { calculateSubtotal, applyDiscount, calculateTax, getTotal, roundAmount };
