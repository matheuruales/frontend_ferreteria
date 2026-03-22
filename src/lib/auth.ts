/**
 * In-memory token storage.
 *
 * Security rationale (Principle V): avoid localStorage/sessionStorage.
 * We keep the token in memory for normal runtime and mirror it in short-lived
 * cookies so session survives full-page redirects (e.g., Stripe return_url).
 *
 * Never use localStorage / sessionStorage for auth tokens in this project.
 */

let _accessToken: string | null = null;
let _expiresAt: number | null = null; // Unix timestamp (ms)

const TOKEN_COOKIE = "mv_access";
const EXP_COOKIE = "mv_exp";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1] ?? "") : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Store the access token and its expiry time.
 * @param token      JWT access token from the backend
 * @param expiresIn  Seconds until the token expires (from LoginResponse)
 */
export function setToken(token: string, expiresIn: number): void {
  _accessToken = token;
  _expiresAt = Date.now() + expiresIn * 1000;
  setCookie(TOKEN_COOKIE, token, expiresIn);
  setCookie(EXP_COOKIE, String(_expiresAt), expiresIn);
}

/**
 * Return the stored access token, or null if not set or expired.
 */
export function getToken(): string | null {
  if (!_accessToken || !_expiresAt) {
    const cookieToken = getCookie(TOKEN_COOKIE);
    const cookieExpiry = getCookie(EXP_COOKIE);
    if (cookieToken && cookieExpiry) {
      const expiresAt = Number(cookieExpiry);
      if (!Number.isNaN(expiresAt) && Date.now() < expiresAt) {
        _accessToken = cookieToken;
        _expiresAt = expiresAt;
      } else {
        clearToken();
        return null;
      }
    } else {
      return null;
    }
  }

  if (Date.now() >= _expiresAt) {
    clearToken();
    return null;
  }
  return _accessToken;
}

/**
 * Remove the stored token (logout or expiry).
 */
export function clearToken(): void {
  _accessToken = null;
  _expiresAt = null;
  clearCookie(TOKEN_COOKIE);
  clearCookie(EXP_COOKIE);
}

/**
 * Returns true if a non-expired token is currently stored.
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
