export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

export const formatCookieOptions = (options: typeof COOKIE_OPTIONS): string => {
    return Object.entries(options)
        .map(([key, value]) => {
            if (typeof value === 'boolean') {
                return value ? key : '';
            }
            return `${key}=${value}`;
        })
        .filter(Boolean)
        .join('; ');
};

export const getTokenHeaders = (accessToken: string, refreshToken: string): Record<string, string | string[]> => {
    const accessTokenCookie = `accessToken=${accessToken}; ${formatCookieOptions(COOKIE_OPTIONS)}`;
    const refreshTokenCookie = `refreshToken=${refreshToken}; ${formatCookieOptions(COOKIE_OPTIONS)}`;
    
    return {
        'Content-Type': 'application/json',
        'Set-Cookie': [accessTokenCookie, refreshTokenCookie]
    };
};

export const extractTokenFromCookie = (cookieHeader: string | null, tokenName: string): string | null => {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';')
        .reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=').map(s => s.trim());
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

    return cookies[tokenName] || null;
};

export const createAuthCookieString = (accessToken: string, refreshToken?: string): string => {
    let cookieStr = `accessToken=${accessToken}`;
    if (refreshToken) {
        cookieStr += `; refreshToken=${refreshToken}`;
    }
    return cookieStr;
}; 