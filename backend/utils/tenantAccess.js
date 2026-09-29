// Shared policy for login, refresh and every protected request.
function tenantAccessError(tenant, now = Date.now()) {
    if (!tenant || !tenant.isActive || tenant.subscriptionStatus === 'suspended') {
        return { success: false, error: 'Tenant account is suspended', code: 'ACCOUNT_SUSPENDED' };
    }
    const expires = tenant.expireAt ? new Date(tenant.expireAt).getTime() : NaN;
    if (tenant.subscriptionStatus !== 'active' || !Number.isFinite(expires) || now >= expires) {
        return { success: false, error: 'Subscription expired. Please renew to continue.',
            code: 'SUBSCRIPTION_EXPIRED', renewalDate: tenant.expireAt, renewalLink: '/billing/renew' };
    }
    return null;
}
module.exports = { tenantAccessError };
