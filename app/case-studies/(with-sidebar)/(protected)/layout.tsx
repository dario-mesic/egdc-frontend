"use client";

import { useLayoutEffect, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, clearAuth, getStoredRole } from "../../_lib/auth";

type ProtectedLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<"checking" | "authed" | "guest">(
    "checking",
  );

  useLayoutEffect(() => {
    setStatus(isAuthenticated() ? "authed" : "guest");
  }, []);

  useEffect(() => {
    if (status === "guest") router.replace("/case-studies/login");
  }, [status, router]);

  useEffect(() => {
    if (
      status === "authed" &&
      getStoredRole() === "custodian" &&
      pathname?.includes("/upload")
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

  function logout() {
    clearAuth();
    setStatus("guest");
    router.replace("/case-studies/login");
  }

  if (status === "checking") {
    return null;
  }

  if (status === "guest") {
    return null;
  }

  if (
    getStoredRole() === "custodian" &&
    pathname?.startsWith("/case-studies/upload")
  ) {
    return null;
  }

  return (
    <>
      <div className="ecl-u-border-bottom ecl-u-mb-m ecl-u-border-color-grey-100">
        <div className="ecl-u-d-flex ecl-u-justify-content-end ecl-u-align-items-center gap-3 ecl-u-pv-xs">
          <span className="ecl-u-type-s ecl-u-type-size-xs ecl-u-type-color-grey-700">
            Hello, <strong>{getStoredRole() ?? "User"}</strong>
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
