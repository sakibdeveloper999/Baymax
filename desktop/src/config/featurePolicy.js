export const screenFeatures = {
    pos: ['pos', 'products'],
    products: ['products'],
    categories: ['categories'],
    customers: ['customers'],
    suppliers: ['suppliers'],
    orders: ['pos'],
    inventory: ['products'],
    reports: ['reports'],
};
export function hasFeatures(features, required) {
    return Array.isArray(features) && features.every(feature => typeof feature === 'string' && feature.trim())
        && required.every(feature => features.includes(feature));
}