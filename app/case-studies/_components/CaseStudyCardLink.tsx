"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type CaseStudyCardLinkProps = Readonly<{
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
}>;

export default function CaseStudyCardLink({
  href,
  children,
  className,
  prefetch = false,
}: CaseStudyCardLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={className}
      onClick={() => {
        if (pathname === "/case-studies" || pathname === "/case-studies/my") {
          sessionStorage.setItem("cs-back", pathname);
        }
      }}
    >
      {children}
    </Link>
  );
}
