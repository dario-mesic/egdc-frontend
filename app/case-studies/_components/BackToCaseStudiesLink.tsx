"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ClientIcon from "../_components/icons/ClientIcon";

export default function BackToCaseStudiesLink() {
  const [href, setHref] = useState("/case-studies");

  useEffect(() => {
    const stored = sessionStorage.getItem("cs-back");
    const authed = sessionStorage.getItem("cs-authed") === "1";

    if (stored === "/case-studies/my" && authed) {
      setHref("/case-studies/my");
    } else {
      setHref("/case-studies");
    }
  }, []);

  return (
    <Link
      href={href}
      className="ecl-link ecl-link--default ecl-link--icon ecl-u-d-inline-flex ecl-u-align-items-center ecl-u-mb-m"
    >
      <ClientIcon className="wt-icon-ecl--arrow-left ecl-icon ecl-icon--l ecl-link__icon" />
      <span className="ecl-link__label">Back to case studies</span>
    </Link>
  );
}
