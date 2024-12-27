import { describe, test, expect } from "bun:test";
import { 
    getTokenHeaders, 
    formatCookieOptions, 
    COOKIE_OPTIONS,
    extractTokenFromCookie,
    createAuthCookieString
} from "./cookies";

describe('Cookie Utilities', () => {
    describe('formatCookieOptions', () => {
        test('formats cookie options correctly', () => {
            const formatted = formatCookieOptions(COOKIE_OPTIONS);
            expect(formatted).toContain('httpOnly');
            expect(formatted).toContain('path=/');
            expect(formatted).toMatch(/maxAge=\d+/);
            
            if (process.env.NODE_ENV === 'production') {
                expect(formatted).toContain('secure');
                expect(formatted).toContain('sameSite=strict');
            } else {
                expect(formatted).toContain('sameSite=lax');
            }
        });
    });

    describe('getTokenHeaders', () => {
        const mockAccessToken = 'mock-access-token';
        const mockRefreshToken = 'mock-refresh-token';

        test('returns correct header structure', () => {
            const headers = getTokenHeaders(mockAccessToken, mockRefreshToken);
            
            expect(headers).toHaveProperty('Content-Type', 'application/json');
            expect(headers).toHaveProperty('Set-Cookie');
            expect(Array.isArray(headers['Set-Cookie'])).toBe(true);
            expect(headers['Set-Cookie']).toHaveLength(2);
        });

        test('formats cookie values correctly', () => {
            const headers = getTokenHeaders(mockAccessToken, mockRefreshToken);
            const cookies = headers['Set-Cookie'] as string[];

            expect(cookies[0]).toMatch(/^accessToken=mock-access-token/);
            expect(cookies[0]).toContain('httpOnly');
            expect(cookies[0]).toContain('path=/');

            expect(cookies[1]).toMatch(/^refreshToken=mock-refresh-token/);
            expect(cookies[1]).toContain('httpOnly');
            expect(cookies[1]).toContain('path=/');
        });
    });

    describe('extractTokenFromCookie', () => {
        test('extracts token correctly from cookie string', () => {
            const cookieStr = 'accessToken=abc123; refreshToken=xyz789; other=value';
            expect(extractTokenFromCookie(cookieStr, 'accessToken')).toBe('abc123');
            expect(extractTokenFromCookie(cookieStr, 'refreshToken')).toBe('xyz789');
        });

        test('returns null for missing cookie header', () => {
            expect(extractTokenFromCookie(null, 'accessToken')).toBeNull();
        });

        test('returns null for missing token', () => {
            const cookieStr = 'otherCookie=value';
            expect(extractTokenFromCookie(cookieStr, 'accessToken')).toBeNull();
        });

        test('handles whitespace in cookie string', () => {
            const testCases = [
                ' accessToken = abc123 ; refreshToken = xyz789 ',
                'accessToken=abc123; refreshToken=xyz789',
                '  accessToken  =  abc123  ;  refreshToken  =  xyz789  ',
                'other=value; accessToken=abc123; refreshToken=xyz789'
            ];

            testCases.forEach(cookieStr => {
                expect(extractTokenFromCookie(cookieStr, 'accessToken')).toBe('abc123');
                expect(extractTokenFromCookie(cookieStr, 'refreshToken')).toBe('xyz789');
            });
        });

        test('handles cookies with no whitespace', () => {
            const cookieStr = 'accessToken=abc123;refreshToken=xyz789';
            expect(extractTokenFromCookie(cookieStr, 'accessToken')).toBe('abc123');
            expect(extractTokenFromCookie(cookieStr, 'refreshToken')).toBe('xyz789');
        });
    });

    describe('createAuthCookieString', () => {
        test('creates cookie string with access token only', () => {
            const cookieStr = createAuthCookieString('abc123');
            expect(cookieStr).toBe('accessToken=abc123');
        });

        test('creates cookie string with both tokens', () => {
            const cookieStr = createAuthCookieString('abc123', 'xyz789');
            expect(cookieStr).toBe('accessToken=abc123; refreshToken=xyz789');
        });

        test('handles special characters in tokens', () => {
            const cookieStr = createAuthCookieString('abc.123-456', 'xyz.789-000');
            expect(cookieStr).toBe('accessToken=abc.123-456; refreshToken=xyz.789-000');
        });
    });
}); 