"use client";

import ErrorState from "../_components/ErrorState";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      {...props}
      message="We couldn’t load data right now. Please try again."
    />
  );
}
