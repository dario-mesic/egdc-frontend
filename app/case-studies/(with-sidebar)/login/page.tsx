"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  isInIframe,
  loginWithPopup,
} from "@/app/case-studies/_lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (isAuthenticated()) {
      router.replace("/case-studies/my");
      return;
    }

    fetch("/auth/profile")
      .then((res) => {
        if (res.ok) {
          router.replace("/case-studies/my");
          return;
        }

        if (isInIframe()) {
          loginWithPopup("/case-studies/my").then((ok) => {
            if (ok) router.replace("/case-studies/my");
          });
        } else {
          window.location.replace("/auth/login?returnTo=/case-studies/my");
        }
      })
      .catch(() => {
        if (isInIframe()) {
          loginWithPopup("/case-studies/my").then((ok) => {
            if (ok) router.replace("/case-studies/my");
          });
        } else {
          window.location.replace("/auth/login?returnTo=/case-studies/my");
        }
      });
  }, [router]);

  return (
    <div className="ecl-u-bg-grey-25 min-h-screen ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center">
      <div className="ecl-container max-w-130!">
        <article className="ecl-card ecl-u-width-100">
          <div className="ecl-card__body ecl-u-d-flex ecl-u-flex-column ecl-u-align-items-center ecl-u-pv-xl">
            <img
              src="https://www.greendigitalcoalition.eu/assets/uploads/2022/02/EGDC-Emblem-Colour-on-light-bg-LRES.png"
              alt="European Green Digital Coalition"
              className="ecl-u-mb-m"
              style={{ height: 64, width: "auto" }}
            />
            <p className="ecl-u-type-paragraph ecl-u-type-color-grey-700">
              Redirecting to login&hellip;
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
