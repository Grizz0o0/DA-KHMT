export const HTTP_CONFIG = {
    AUTHENTICATION_STATUS: 401,
    DEFAULT_TIMEOUT: 10000, // 10 seconds
    MAX_RETRIES: 3,
    BASE_HEADERS: {
        'Content-Type': 'application/json',
    },
} as const;
