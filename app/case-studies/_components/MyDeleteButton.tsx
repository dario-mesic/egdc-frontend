"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ClientIcon from "../_components/icons/ClientIcon";

type MyDeleteButtonProps = Readonly<{
  caseStudyId: number;
}>;

const MY_IDS = new Set([4, 12, 11]);

export default function MyDeleteButton({ caseStudyId }: MyDeleteButtonProps) {
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
      className="ecl-button ecl-button--primary bg-(--ecl-color-error-600)! hover:bg-(--ecl-color-error-700)!"
    >
      <span className="ecl-button__container">
        <ClientIcon className="wt-icon--trash ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
        Delete
      </span>
    </Link>
  );
}
