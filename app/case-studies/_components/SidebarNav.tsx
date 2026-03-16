"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredRole } from "../_lib/auth";

export default function SidebarNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getStoredRole() === "admin");

    function onRoleChanged() {
      setIsAdmin(getStoredRole() === "admin");
    }

    window.addEventListener("auth:role-changed", onRoleChanged);
    return () => window.removeEventListener("auth:role-changed", onRoleChanged);
  }, []);

  return (
    <nav className="ecl-u-d-flex ecl-u-flex-column">
      <Link
        className="ecl-link ecl-link--primary  ecl-u-d-block  ecl-u-type-align-center ecl-u-mb-l"
        aria-current={pathname === "/case-studies" ? "page" : undefined}
        href="/case-studies"
      >
        Explore case studies
      </Link>

      <Link
        className="ecl-link ecl-link--primary  ecl-u-d-block  ecl-u-type-align-center ecl-u-mb-s ecl-u-mb-l"
        aria-current={pathname === "/case-studies/figures" ? "page" : undefined}
        href="/case-studies/figures"
      >
        EGDC scoreboard
      </Link>

      <Link
        className="ecl-link ecl-link--primary  ecl-u-d-block  ecl-u-type-align-center ecl-u-mb-l"
        aria-current={
          pathname === "/case-studies/upload" || pathname === "/case-studies/my"
            ? "page"
            : undefined
        }
        href="/case-studies/my"
      >
        Manage case studies
      </Link>

      {isAdmin && (
        <Link
          className="ecl-link ecl-link--primary  ecl-u-d-block  ecl-u-type-align-center ecl-u-mb-l"
          aria-current={pathname === "/case-studies/users" ? "page" : undefined}
          href="/case-studies/users"
        >
          Manage users
        </Link>
      )}
    </nav>
  );
}
