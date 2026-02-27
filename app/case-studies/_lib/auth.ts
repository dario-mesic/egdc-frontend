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
