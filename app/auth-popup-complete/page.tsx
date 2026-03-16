"use client";

import { useEffect } from "react";

export default function AuthPopupComplete() {
  useEffect(() => {
    (async () => {
      try {
        const [tokenRes, profileRes] = await Promise.all([
          fetch("/auth/access-token"),
          fetch("/auth/profile"),
        ]);

        const tokenData = tokenRes.ok ? await tokenRes.json() : null;
        const profileData = profileRes.ok ? await profileRes.json() : null;

        const token: string | undefined =
          tokenData?.token ?? tokenData?.accessToken ?? tokenData?.access_token;

        if (window.opener) {
          window.opener.postMessage(
            { type: "auth0:popup-complete", token, profile: profileData },
            window.location.origin,
          );
        }
      } catch {
        if (window.opener) {
          window.opener.postMessage(
            { type: "auth0:popup-error" },
            window.location.origin,
          );
        }
      } finally {
        window.close();
      }
    })();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p>Completing login&hellip; this window will close automatically.</p>
    </div>
  );
}
