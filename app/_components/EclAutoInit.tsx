"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type EclAutoInitProps = Readonly<{
  rootId?: string;
}>;

function markReady() {
  document.documentElement.classList.add("ecl-ready");
}

function clearReady() {
  document.documentElement.classList.remove("ecl-ready");
}

function hasAutoInitNodes(root: ParentNode) {
  return root.querySelector("[data-ecl-auto-init]") !== null;
}

function hasDatepickerNodes(root: ParentNode) {
  return root.querySelector('[data-ecl-auto-init="Datepicker"]') !== null;
}

function duetReady() {
  return !!globalThis.customElements?.get?.("duet-date-picker");
}

function autoInitWithRetry(root: Element, maxTries = 40) {
  let tries = 0;

  const attempt = () => {
    tries++;

    if (!hasAutoInitNodes(root)) {
      markReady();
      return;
    }

    if (hasDatepickerNodes(root) && !duetReady()) {
      if (tries < maxTries) setTimeout(attempt, 50);
      return;
    }

    if (globalThis.ECL?.autoInit) {
      globalThis.requestAnimationFrame(() => {
        globalThis.ECL?.autoInit?.(root);
        markReady();
      });
      return;
    }

    if (tries < maxTries) setTimeout(attempt, 50);
  };

  attempt();
}

export default function EclAutoInit({ rootId = "app-root" }: EclAutoInitProps) {
  const pathname = usePathname();
  const loadedRef = useRef(false);

  const getRoot = () => document.getElementById(rootId);

  useEffect(() => {
    const cl = document.documentElement.classList;
    cl.remove("no-js");
    cl.add("has-js");
    clearReady();
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;

    const root = getRoot();
    clearReady();

    if (!root) {
      markReady();
      return;
    }

    autoInitWithRetry(root);
  }, [pathname]);

  return (
    <Script
      src="/ecl/scripts/ecl-ec.js"
      strategy="afterInteractive"
      onLoad={() => {
        loadedRef.current = true;

        const root = getRoot();
        clearReady();

        if (!root) {
          markReady();
          return;
        }

        autoInitWithRetry(root);
      }}
    />
  );
}
