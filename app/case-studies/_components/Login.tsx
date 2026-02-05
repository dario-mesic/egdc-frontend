"use client";

import { useState } from "react";

type LoginProps = Readonly<{
  onSuccess: () => void;
}>;

export default function Login({ onSuccess }: LoginProps) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState<{
    username?: boolean;
    password?: boolean;
  }>({});
  const [error, setError] = useState("");

  const errors = {
    username: !form.username.trim() ? "Username is required." : "",
    password: !form.password ? "Password is required." : "",
  };

  const canSubmit = !errors.username && !errors.password;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setError("");
    if (!canSubmit) return;

    if (form.username === "custodian1" && form.password === "custodian1") {
      sessionStorage.setItem("cs-authed", "1");
      onSuccess();
      return;
    }

    setError("Please enter a correct username and password.");
  }
  return (
    <div className="ecl-u-bg-grey-25 min-h-screen ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center ecl-u-pa-l">
      <div className="ecl-container" style={{ maxWidth: 520 }}>
        <article className="ecl-card ecl-u-width-100">
          <div className="ecl-card__body">
            <div className="ecl-u-d-flex ecl-u-flex-column ecl-u-align-items-center ecl-u-mb-l">
              <img
                src="https://www.greendigitalcoalition.eu/assets/uploads/2022/02/EGDC-Emblem-Colour-on-light-bg-LRES.png"
                alt="European Green Digital Coalition"
                className="ecl-u-mb-m"
                style={{ height: 64, width: "auto" }}
              />
              <h1 className="ecl-u-type-heading-3 ecl-u-mb-2xs">LOGIN</h1>
            </div>

            {error ? (
              <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mb-m">
                {error}
              </div>
            ) : null}

            <form onSubmit={submit} className="ecl-u-mt-l">
              <div className="ecl-form-group ecl-u-mb-m">
                <label className="ecl-form-label" htmlFor="login-username">
                  Username{" "}
                </label>

                <input
                  id="login-username"
                  className="ecl-text-input ecl-u-width-100"
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                  aria-describedby="login-username-help"
                  autoComplete="username"
                />

                {touched.username && errors.username ? (
                  <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                    {errors.username}
                  </div>
                ) : null}
              </div>

              <div className="ecl-form-group ecl-u-mb-l">
                <label className="ecl-form-label" htmlFor="login-password">
                  Password{" "}
                </label>

                <input
                  id="login-password"
                  type="password"
                  className="ecl-text-input ecl-u-width-100"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  autoComplete="current-password"
                />

                {touched.password && errors.password ? (
                  <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                    {errors.password}
                  </div>
                ) : null}
              </div>

              <div className="ecl-u-d-flex ecl-u-flex-column gap-3">
                <button
                  type="submit"
                  className="ecl-button ecl-button--primary ecl-u-width-100"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </article>
      </div>
    </div>
  );
}
