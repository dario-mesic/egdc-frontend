"use client";

import { useEffect, useState } from "react";

type ErrorStateProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
}>;

function runResetWithEcl(reset: () => void) {
  requestAnimationFrame(() => {
    reset();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        globalThis.dispatchEvent(new Event("ecl:autoinit"));
      });
    });
  });
}

export default function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  message = "We couldn’t load this content right now. Please try again.",
}: ErrorStateProps) {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    console.error(error);
    setClicked(false);
  }, [error]);

  const onRetry = () => {
    if (clicked) return;
    setClicked(true);
    runResetWithEcl(reset);
  };

  return (
    <main className="min-h-[90vh] ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center">
      <div className="ecl-u-d-flex ecl-u-flex-column ecl-u-justify-content-center ecl-u-align-items-center ecl-u-bg-grey-25 ecl-u-pa-l ecl-u-border-all ecl-u-border-color-grey-50 ecl-u-text-align-center">
        <h2 className="ecl-u-type-heading-4 ecl-u-mb-s">{title}</h2>

        <p className="ecl-u-type-paragraph ecl-u-mb-m">{message}</p>

        <button
          className="ecl-button ecl-button--primary"
          onClick={onRetry}
          disabled={clicked}
          aria-busy={clicked}
        >
          {clicked ? "Retrying…" : "Retry"}
        </button>
      </div>
    </main>
  );
}
