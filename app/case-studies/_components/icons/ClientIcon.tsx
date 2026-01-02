"use client";

import { useEffect, useState } from "react";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  className: string;
  title?: string;
};

export default function ClientIcon({ className, title, ...rest }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <span className={className} title={title} aria-hidden="true" {...rest} />
  );
}
