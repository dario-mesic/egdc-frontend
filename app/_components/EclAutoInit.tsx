"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    ECL?: { autoInit?: () => void };
  }
}

function hasEclAutoInitNodes() {
  return document.querySelector("[data-ecl-auto-init]") !== null;
}

function markReady() {
  document.documentElement.classList.add("ecl-ready");
}

function clearReady() {
  document.documentElement.classList.remove("ecl-ready");
}

function autoInitWithRetry(maxTries = 20) {
  let tries = 0;

  const attempt = () => {
    tries += 1;

    if (!hasEclAutoInitNodes()) {
      markReady();
      return;
    }

    if (window.ECL?.autoInit) {
      requestAnimationFrame(() => {
        window.ECL?.autoInit?.();
        markReady();
      });
      return;
    }

    if (tries < maxTries) setTimeout(attempt, 50);
  };

  attempt();
}

export default function EclAutoInit() {
  const pathname = usePathname();
  const loadedRef = useRef(false);

  useEffect(() => {
    const cl = document.documentElement.classList;
    cl.remove("no-js");
    cl.add("has-js");
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    clearReady();
    autoInitWithRetry();
  }, [pathname]);
  useEffect(() => {
    const handler = () => {
      clearReady();
      autoInitWithRetry();
    };

    window.addEventListener("ecl:autoinit", handler);
    return () => window.removeEventListener("ecl:autoinit", handler);
  }, []);
  return (
    <Script
      src="/ecl/scripts/ecl-ec.js"
      strategy="afterInteractive"
      onLoad={() => {
        loadedRef.current = true;
        clearReady();
        autoInitWithRetry();
      }}
    />
  );
}
