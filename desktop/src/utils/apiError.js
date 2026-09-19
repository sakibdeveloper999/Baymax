export default function apiError(error) {
    const body = error.response?.data;
    if (body?.details?.length) return body.details.map(detail => detail.message).join(' ');
    return typeof body?.error === 'string' ? body.error : body?.error?.message || error.message || 'Request failed';
}
