import React from 'react';
export default function FeatureAccess({ features, feature, title, plan, planConfigured, children }) {
    if (planConfigured === false) return <section className="p-6"><h1 className="text-2xl font-bold">{title}</h1><p role="alert">Your subscription plan configuration is unavailable. Contact the administrator.</p></section>;
    if (!Array.isArray(features)) return <section className="p-6"><p role="status">Sign out and sign in again to refresh your plan access.</p></section>;
    if (!features.includes(feature)) return <section className="p-6 space-y-3"><h1 className="text-2xl font-bold">{title}</h1><p role="status">{title} is not included in your {plan || 'current'} plan. Suppliers are available on Standard and Pro. Contact your administrator to change plans.</p></section>;
    return children;
}
