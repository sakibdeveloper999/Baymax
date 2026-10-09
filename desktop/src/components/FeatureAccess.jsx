import React from 'react';
import { hasFeatures } from '../config/featurePolicy';

export default function FeatureAccess({ features, feature, title, plan, planConfigured, children }) {
    const required = Array.isArray(feature) ? feature : [feature];
    if (planConfigured === false || (Array.isArray(features) && !features.every(value => typeof value === 'string' && value.trim()))) {
        return <section className="p-6"><h1 className="text-2xl font-bold">{title}</h1><p role="alert">Your subscription plan configuration is unavailable. Contact the administrator.</p></section>;
    }
    if (!Array.isArray(features)) {
        return <section className="p-6"><h1 className="text-2xl font-bold">{title}</h1><p role="status">Sign out and sign in again to refresh your plan access.</p></section>;
    }
    if (!hasFeatures(features, required)) {
        return <section className="p-6 space-y-3"><h1 className="text-2xl font-bold">{title}</h1><p role="status">{title} is not included in your {plan || 'current'} plan. Contact your administrator to change plans.</p></section>;
    }
    return children;
}