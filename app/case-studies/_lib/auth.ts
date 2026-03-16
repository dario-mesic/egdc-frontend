export const AUTH_ACCESS_TOKEN_KEY = "cs-access-token";
export const AUTH_ROLE_KEY = "cs-role";

export type UserRole = "custodian" | "data_owner" | "admin";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string): void {
  sessionStorage.setItem(AUTH_ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken(): void {
  sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
}

export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const r = sessionStorage.getItem(AUTH_ROLE_KEY);
  if (r === "custodian" || r === "data_owner" || r === "admin") return r;
  return null;
}

export function setStoredRole(role: UserRole): void {
  sessionStorage.setItem(AUTH_ROLE_KEY, role);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:role-changed"));
  }
}

export function clearStoredRole(): void {
  sessionStorage.removeItem(AUTH_ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredAccessToken();
}

export function clearAuth(): void {
  clearStoredAccessToken();
  clearStoredRole();
}

export function clearAuthAndRedirect(): void {
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/case-studies/login";
  }
}

export function isCredentialsError(message: unknown): boolean {
  if (message == null) return false;
  const s = String(message).toLowerCase();
  return s.includes("credential") || s.includes("not validate") || s.includes("unauthorized");
}

const VALID_ROLES = new Set<UserRole>(["custodian", "data_owner", "admin"]);

function parseRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const lower = value.toLowerCase() as UserRole;
  return VALID_ROLES.has(lower) ? lower : null;
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Iframe helpers                                                     */
/* ------------------------------------------------------------------ */

export function isInIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Store the token + role from data received via postMessage
 * from the popup callback page.
 */
function applyPopupResult(data: {
  token?: string;
  profile?: Record<string, unknown> | null;
}): boolean {
  const { token, profile } = data;
  if (!token) return false;

  setStoredAccessToken(token);

  const claims = decodeJwtPayload(token);
  const role =
    parseRole(claims?.["https://egdc-api/role"]) ??
    parseRole(profile?.["https://egdc-api/role"]) ??
    parseRole((profile?.app_metadata as Record<string, unknown> | undefined)?.role);

  if (role) setStoredRole(role);
  return true;
}

/**
 * Open Auth0 login in a popup window and wait for the result.
 * Falls back to redirect if popup is blocked.
 */
export function loginWithPopup(returnPath?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const loginUrl = `/auth/login?returnTo=${encodeURIComponent("/auth-popup-complete")}`;

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      loginUrl,
      "auth0-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );

    if (!popup) {
      window.location.replace(
        `/auth/login?returnTo=${encodeURIComponent(returnPath ?? "/case-studies/my")}`,
      );
      resolve(false);
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "auth0:popup-complete") {
        window.removeEventListener("message", onMessage);
        clearInterval(pollTimer);
        resolve(applyPopupResult(event.data));
      } else if (event.data?.type === "auth0:popup-error") {
        window.removeEventListener("message", onMessage);
        clearInterval(pollTimer);
        resolve(false);
      }
    };

    window.addEventListener("message", onMessage);

    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener("message", onMessage);
        resolve(false);
      }
    }, 500);
  });
}

/**
 * Log out when running inside an iframe.
 * Opens Auth0 logout in a popup, then clears local state.
 */
export function logoutFromIframe(): void {
  clearAuth();

  const returnTo = encodeURIComponent(window.location.origin + "/case-studies");
  const logoutUrl = `/auth/logout?returnTo=${returnTo}`;

  const popup = window.open(logoutUrl, "auth0-logout", "width=400,height=300");

  if (popup) {
    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer);
          return;
        }
        if (
          popup.location.origin === window.location.origin &&
          popup.location.pathname !== "/auth/logout"
        ) {
          clearInterval(timer);
          popup.close();
        }
      } catch {
        // cross-origin — Auth0 redirect in progress, keep waiting
      }
    }, 300);

    setTimeout(() => {
      clearInterval(timer);
      try { popup.close(); } catch { /* already closed */ }
    }, 5000);
  }

  window.location.replace("/case-studies/login");
}

/**
 * Fetch the Auth0 access token and user profile, then persist them
 * in sessionStorage so existing components keep working via
 * getStoredAccessToken() / getStoredRole().
 *
 * Returns true when a valid token was stored.
 */
export async function syncAuth0Session(): Promise<boolean> {
  try {
    const [tokenRes, profileRes] = await Promise.all([
      fetch("/auth/access-token"),
      fetch("/auth/profile"),
    ]);

    if (!tokenRes.ok) return false;

    const tokenData = await tokenRes.json();
    const token: string | undefined =
      tokenData?.token ??
      tokenData?.accessToken ??
      tokenData?.access_token;
    if (!token) {
      console.error("Auth0 token response:", JSON.stringify(tokenData));
      return false;
    }

    setStoredAccessToken(token);

    if (profileRes.ok) {
      const profile = await profileRes.json();
      const role =
        parseRole(profile?.["https://egdc-api/role"]) ??
        parseRole(profile?.role) ??
        parseRole(profile?.app_metadata?.role);

      if (role) setStoredRole(role);
    }

    return true;
  } catch {
    return false;
  }
}
