function isFeatureList(features) {
    return Array.isArray(features) && features.every(feature => typeof feature === 'string' && feature.trim().length > 0);
}
module.exports = { isFeatureList };