"use client";

import ErrorState from "../_components/ErrorState";

type RouteErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function RouteError(props: RouteErrorProps) {
  return (
    <ErrorState
      {...props}
      message="We couldn’t load data right now. Please try again."
    />
  );
}
