"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="ecl-u-d-flex ecl-u-flex-column">
      <Link
        className="ecl-link ecl-link--primary  ecl-u-d-block  ecl-u-type-align-center ecl-u-mb-l"
        aria-current={pathname === "/case-studies" ? "page" : undefined}
        href="/case-studies"
      >
        Search in past case studies
      </Link>

      <Link
        className="ecl-link ecl-link--primary  ecl-u-d-block  ecl-u-type-align-center ecl-u-mb-s ecl-u-mb-l"
        aria-current={pathname === "/case-studies/figures" ? "page" : undefined}
        href="/case-studies/figures"
      >
        EGDC in figures
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
        Upload/Modify case studies
      </Link>
    </nav>
  );
}
