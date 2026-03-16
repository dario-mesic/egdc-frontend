"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isAuthenticated,
  clearAuth,
  getStoredRole,
  setStoredAccessToken,
  setStoredRole,
  decodeJwtPayload,
  isInIframe,
  loginWithPopup,
  logoutFromIframe,
  type UserRole,
} from "../../_lib/auth";

type Auth0Profile = {
  name?: string;
  email?: string;
  nickname?: string;
  "https://egdc-api/role"?: string;
  app_metadata?: { role?: string };
  [key: string]: unknown;
};

type ProtectedLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const VALID_ROLES = new Set(["custodian", "data_owner", "admin"]);

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const didSync = useRef(false);

  const [status, setStatus] = useState<"checking" | "authed" | "guest">(
    "checking",
  );
  const [profile, setProfile] = useState<Auth0Profile | null>(null);

  useEffect(() => {
    if (didSync.current) return;
    didSync.current = true;

    if (isAuthenticated()) {
      setStatus("authed");
      return;
    }

    fetch("/auth/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Auth0Profile | null) => {
        if (!data) {
          clearAuth();
          setStatus("guest");
          return;
        }

        setProfile(data);

        return fetch("/auth/access-token")
          .then((res) => (res.ok ? res.json() : null))
          .then((tokenData) => {
            const token: string | undefined =
              tokenData?.token ?? tokenData?.accessToken ?? tokenData?.access_token;

            if (token) {
              setStoredAccessToken(token);

              const claims = decodeJwtPayload(token);
              const role =
                claims?.["https://egdc-api/role"] ??
                data["https://egdc-api/role"] ??
                data.app_metadata?.role;

              if (role && VALID_ROLES.has(String(role).toLowerCase())) {
                setStoredRole(String(role).toLowerCase() as UserRole);
              }
            }

            setStatus("authed");
          });
      })
      .catch(() => {
        clearAuth();
        setStatus("guest");
      });
  }, []);

  useEffect(() => {
    if (status !== "guest") return;

    if (isInIframe()) {
      loginWithPopup(pathname ?? "/case-studies/my").then((ok) => {
        if (ok) {
          didSync.current = false;
          setStatus("authed");
        }
      });
    } else {
      window.location.replace(
        `/auth/login?returnTo=${encodeURIComponent(pathname ?? "/case-studies/my")}`,
      );
    }
  }, [status, pathname]);

  useEffect(() => {
    if (status !== "authed") return;
    const role = getStoredRole();
    if (
      (role === "custodian" || role === "admin") &&
      pathname?.includes("/upload")
    ) {
      router.replace("/case-studies/my");
    } else if (
      role !== "admin" &&
      pathname?.startsWith("/case-studies/users")
    ) {
      router.replace("/case-studies/my");
    }
  }, [status, pathname, router]);

  useEffect(() => {
    if (status !== "authed") return;

    document.documentElement.classList.remove("ecl-ready");
    requestAnimationFrame(() => {
      const root = document.getElementById("app-root");
      if (root) globalThis.ECL?.autoInit?.(root);
      document.documentElement.classList.add("ecl-ready");
      globalThis.dispatchEvent(new Event("ecl:autoinit"));
    });
  }, [status, pathname]);

  const logout = useCallback(() => {
    if (isInIframe()) {
      logoutFromIframe();
    } else {
      clearAuth();
      window.location.href = `/auth/logout?returnTo=${encodeURIComponent(window.location.origin + "/case-studies")}`;
    }
  }, []);

  if (status === "checking") return null;
  if (status === "guest") return null;

  if (
    (getStoredRole() === "custodian" || getStoredRole() === "admin") &&
    pathname?.startsWith("/case-studies/upload")
  ) {
    return null;
  }

  if (
    getStoredRole() !== "admin" &&
    pathname?.startsWith("/case-studies/users")
  ) {
    return null;
  }

  const displayName =
    profile?.name ?? profile?.email ?? getStoredRole() ?? "User";

  return (
    <>
      <div className="ecl-u-border-bottom ecl-u-mb-m ecl-u-border-color-grey-100">
        <div className="ecl-u-d-flex ecl-u-justify-content-end ecl-u-align-items-center gap-3 ecl-u-pv-xs">
          <span className="ecl-u-type-s ecl-u-type-size-xs ecl-u-type-color-grey-700">
            Hello, <strong>{displayName}</strong>
          </span>

          <button
            type="button"
            className="ecl-button ecl-button--tertiary ecl-u-type-s"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      {children}
    </>
  );
}
