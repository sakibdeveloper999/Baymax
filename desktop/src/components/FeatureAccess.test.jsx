import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import FeatureAccess from './FeatureAccess';
const mount = jest.fn();
function SupplierScreen() { mount(); return <div>Supplier records</div>; }
beforeEach(() => mount.mockClear());
test('Basic users see the plan restriction without mounting the supplier screen', () => {
    const html = renderToStaticMarkup(<FeatureAccess features={['pos']} feature="suppliers" title="Suppliers" plan="basic"><SupplierScreen /></FeatureAccess>);
    expect(html).toContain('not included');
    expect(mount).not.toHaveBeenCalled();
});
test('allowed users can mount the supplier screen', () => {
    const html = renderToStaticMarkup(<FeatureAccess features={['suppliers']} feature="suppliers" title="Suppliers" plan="standard"><SupplierScreen /></FeatureAccess>);
    expect(html).toContain('Supplier records');
    expect(mount).toHaveBeenCalledTimes(1);
});
test('missing plan configuration blocks supplier requests with a distinct message', () => {
    const html = renderToStaticMarkup(<FeatureAccess features={[]} planConfigured={false} feature="suppliers" title="Suppliers"><SupplierScreen /></FeatureAccess>);
    expect(html).toContain('configuration is unavailable');
    expect(mount).not.toHaveBeenCalled();
});
