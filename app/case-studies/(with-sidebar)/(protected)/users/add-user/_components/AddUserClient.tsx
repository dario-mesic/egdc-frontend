"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getStoredAccessToken,
  getStoredRole,
  clearAuthAndRedirect,
  isCredentialsError,
} from "@/app/case-studies/_lib/auth";
import Notification from "@/app/case-studies/_components/Notification";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import RoleSelect from "../../_components/RoleSelect";

export default function AddUserClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("data_owner");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (getStoredRole() !== "admin") {
      router.replace("/case-studies/users");
    }
  }, [router]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const token = getStoredAccessToken();
      if (!token) return;
      const emailTrim = email.trim();
      const passwordTrim = password.trim();
      if (!emailTrim || !passwordTrim) {
        setError("Email and password are required.");
        setSuccess(null);
        return;
      }
      setError(null);
      setSuccess(null);
      setCreating(true);
      fetch("/api/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: emailTrim,
          password: passwordTrim,
          role,
        }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (
            res.status === 401 ||
            res.status === 403 ||
            isCredentialsError(data?.error)
          ) {
            clearAuthAndRedirect();
            return;
          }
          if (!res.ok) {
            setError(data?.error ?? "Failed to create user");
            setSuccess(null);
            return;
          }
          setSuccess("User created successfully.");
          setError(null);
          setEmail("");
          setPassword("");
          setRole("data_owner");
          sessionStorage.setItem("user-created", "1");
          router.push("/case-studies/users");
        })
        .catch(() => {
          setError("Failed to create user");
          setSuccess(null);
        })
        .finally(() => setCreating(false));
    },
    [email, password, role, router],
  );

  if (getStoredRole() !== "admin") {
    return null;
  }

  return (
    <div className="ecl-u-pa-l">
      <Link
        href="/case-studies/users"
        className="ecl-link ecl-link--default ecl-link--icon ecl-u-d-inline-flex ecl-u-align-items-center ecl-u-mb-m"
      >
        <ClientIcon className="wt-icon-ecl--arrow-left ecl-icon ecl-icon--m ecl-link__icon" />
        <span className="ecl-link__label">Back to Manage users</span>
      </Link>

      <h1 className="ecl-u-mb-m">Add user</h1>

      {error && (
        <div className="ecl-u-mb-m">
          <Notification
            variant="error"
            title="Failed to create user"
            description={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className=" xl:max-w-4xl">
        <div className="ecl-form-group ecl-u-mb-m">
          <label className="ecl-form-label" htmlFor="add-user-email">
            Email{" "}
            <span className="ecl-form-label__required" aria-label="required">
              *
            </span>
          </label>
          <input
            id="add-user-email"
            type="email"
            className="ecl-text-input ecl-text-input--m ecl-u-mt-2xs ecl-u-width-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={creating}
            placeholder="user@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="ecl-form-group ecl-u-mb-m">
          <label className="ecl-form-label" htmlFor="add-user-password">
            Password{" "}
            <span className="ecl-form-label__required" aria-label="required">
              *
            </span>
          </label>
          <input
            id="add-user-password"
            type="password"
            className="ecl-text-input ecl-text-input--m ecl-u-mt-2xs ecl-u-width-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={creating}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="ecl-form-group ecl-u-mb-m">
          <label className="ecl-form-label" htmlFor="add-user-role">
            Role
          </label>
          <div className="ecl-u-mt-2xs">
            <RoleSelect
              id="add-user-role"
              value={role}
              onChange={setRole}
              disabled={creating}
              aria-label="Role for new user"
            />
          </div>
        </div>
        <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-end ecl-u-mt-xl">
          <button
            type="submit"
            className="ecl-button ecl-button--primary"
            disabled={creating}
          >
            <span className="ecl-button__container">
              {creating ? "Creating…" : "Add user"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
