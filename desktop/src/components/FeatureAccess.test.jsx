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


test("generic restriction copy describes reports without supplier-specific tier claims", () => {
    const html = renderToStaticMarkup(<FeatureAccess features={["pos"]} feature="reports" title="Reports" plan="custom"><SupplierScreen /></FeatureAccess>);
    expect(html).toContain("Reports is not included");
    expect(html).not.toContain("Suppliers are available");
    expect(mount).not.toHaveBeenCalled();
});

test("all requested features must be present before mounting", () => {
    renderToStaticMarkup(<FeatureAccess features={["pos"]} feature={["pos", "products"]} title="POS"><SupplierScreen /></FeatureAccess>);
    expect(mount).not.toHaveBeenCalled();
});

test("malformed feature entries and unloaded access block child mounting", () => {
    for (const features of [undefined, ["suppliers", 1]]) {
        renderToStaticMarkup(<FeatureAccess features={features} feature="suppliers" title="Suppliers"><SupplierScreen /></FeatureAccess>);
        expect(mount).not.toHaveBeenCalled();
    }
});
