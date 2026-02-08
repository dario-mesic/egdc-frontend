"use client";

import { useEffect, useRef, useState } from "react";

type ViewTransitionProps = Readonly<{
  children: React.ReactNode;
  index?: number;
  rootId?: string;
  once?: boolean;
  className?: string;
}>;

export default function ViewTransition({
  children,
  index = 0,
  rootId = "case-studies-scroll",
  once = true,
  className,
}: ViewTransitionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const root = document.getElementById(rootId);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          globalThis.setTimeout(() => setVisible(true), index * 50);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      {
        root: root ?? null,
        threshold: 0.15,

        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, once, rootId]);

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        ${className ?? ""}
        `}
    >
      {children}
    </div>
  );
}
