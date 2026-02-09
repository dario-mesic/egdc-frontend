"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ClientIcon from "../_components/icons/ClientIcon";

type MyEditButtonProps = Readonly<{
  caseStudyId: number;
}>;

const MY_IDS = new Set([4, 12, 11]);

export default function MyEditButton({ caseStudyId }: MyEditButtonProps) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("cs-authed") === "1");
  }, []);

  if (!authed) return null;
  if (!MY_IDS.has(caseStudyId)) return null;

  return (
    <Link
      href="#"
      onClick={(e) => e.preventDefault()}
      className="ecl-button ecl-button--primary"
    >
      <span className="ecl-button__container">
        <ClientIcon className="wt-icon--edit ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
        Edit
      </span>
    </Link>
  );
}
