import { ApiKeyExpiry } from "../enums";


export function getExpiryTimestamp(expiry: ApiKeyExpiry) {
    const now = Date.now();

    const durations: Record<ApiKeyExpiry, number> = {
        [ApiKeyExpiry.ONE_HOUR]: 60 * 60 * 1000,
        [ApiKeyExpiry.ONE_DAY]: 24 * 60 * 60 * 1000,
        [ApiKeyExpiry.ONE_MONTH]: 30 * 24 * 60 * 60 * 1000,
        [ApiKeyExpiry.ONE_YEAR]: 365 * 24 * 60 * 60 * 1000,
    };

    return now + durations[expiry];
}
