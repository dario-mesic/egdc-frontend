"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem("upload-authed") === "1";
    setAuthed(ok);
    setChecked(true);

    if (!ok && !pathname.endsWith("/login")) {
      router.replace("/case-studies/upload/login");
    }
  }, [router, pathname]);

  function logout() {
    sessionStorage.removeItem("upload-authed");
    router.replace("/case-studies/upload/login");
  }

  if (!checked) return null;

  if (pathname.endsWith("/login")) return <>{children}</>;

  if (!authed) return null;

  return (
    <>
      <div className="ecl-u-pa-s ecl-u-mb-m">
        <div className="ecl-u-d-flex ecl-u-justify-content-end ecl-u-align-items-center gap-4">
          <div className="ecl-u-type-paragraph">
            Hello, <strong>admin</strong>
          </div>

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
