"use client";

import ErrorState from "../_components/ErrorState";

type CaseStudyErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function CaseStudyError(props: CaseStudyErrorProps) {
  return (
    <ErrorState
      {...props}
      message="We couldn’t load this case study right now. Please try again."
    />
  );
}
