"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem("cs-authed") === "1";
    setAuthed(ok);
    setChecked(true);

    if (!ok) router.replace("/case-studies/login");
  }, [router]);

  useEffect(() => {
    if (!checked || !authed) return;

    document.documentElement.classList.remove("ecl-ready");

    requestAnimationFrame(() => {
      const root = document.getElementById("app-root");
      if (root) globalThis.ECL?.autoInit?.(root);

      document.documentElement.classList.add("ecl-ready");
      globalThis.dispatchEvent(new Event("ecl:autoinit"));
    });
  }, [checked, authed, pathname]);

  function logout() {
    sessionStorage.removeItem("cs-authed");
    router.replace("/case-studies/login");
  }

  if (!checked) return null;
  if (!authed) return null;

  return (
    <>
      <div className="ecl-u-border-bottom ecl-u-mb-m ecl-u-border-color-grey-100">
        <div className="ecl-u-d-flex ecl-u-justify-content-end ecl-u-align-items-center gap-3 ecl-u-pv-xs">
          <span className="ecl-u-type-paragraph ecl-u-type-size-xs ecl-u-type-color-grey-700">
            Hello, <strong>custodian1</strong>
          </span>

          <button
            type="button"
            className="ecl-button ecl-button--tertiary"
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
