"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getStoredAccessToken,
  getStoredRole,
  clearAuthAndRedirect,
  isCredentialsError,
} from "@/app/case-studies/_lib/auth";
import LoadingIndicator from "@/app/case-studies/_components/LoadingIndicator";
import Notification from "@/app/case-studies/_components/Notification";
import Pagination from "@/app/case-studies/_components/Pagination";
import PageSizeSelect from "@/app/case-studies/_components/PageSizeSelect";
import ConfirmDialog from "@/app/case-studies/_components/ConfirmDialog";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import RoleSelect from "./RoleSelect";

type UserItem = { id: number; email: string; role: string };

export default function ManageUsersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? "10")),
  );

  const [items, setItems] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    email: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(() => {
    const token = getStoredAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch(`/api/users?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
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
          throw new Error(data?.error ?? "Failed to load users");
        }
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotal(typeof data?.total === "number" ? data.total : 0);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load users");
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, limit]);

  useEffect(() => {
    if (getStoredRole() !== "admin") {
      router.replace("/case-studies/my");
      return;
    }
    load();
  }, [router, load]);

  useEffect(() => {
    if (sessionStorage.getItem("user-created") === "1") {
      sessionStorage.removeItem("user-created");
      setActionSuccess("User created successfully.");
      setActionError(null);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("user-deleted") === "1") {
      sessionStorage.removeItem("user-deleted");
      setActionSuccess("User deleted successfully.");
      setActionError(null);
    }
  }, []);

  const searchParamsObj = useMemo(
    () => ({ limit: String(limit), page: String(page) }),
    [limit, page],
  );

  useEffect(() => {
    if (loading || error) return;
    const t = requestAnimationFrame(() => {
      const root = document.getElementById("app-root");
      if (root)
        (
          globalThis as unknown as {
            ECL?: { autoInit?: (el: HTMLElement) => void };
          }
        ).ECL?.autoInit?.(root);
      globalThis.dispatchEvent(new Event("ecl:autoinit"));
    });
    return () => cancelAnimationFrame(t);
  }, [loading, error]);

  const handleRoleChange = useCallback(
    (userId: number, newRole: string) => {
      const token = getStoredAccessToken();
      if (!token) return;
      const previous = items.find((u) => u.id === userId);
      const previousRole = previous?.role ?? "";
      setActionError(null);
      setActionSuccess(null);
      setItems((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      setUpdatingRoleId(userId);
      fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ role: newRole }),
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
            setItems((prev) =>
              prev.map((u) =>
                u.id === userId ? { ...u, role: previousRole } : u,
              ),
            );
            setActionError(data?.error ?? "Failed to update role");
            setActionSuccess(null);
            return;
          }
          setActionSuccess("Role updated successfully.");
          setActionError(null);
        })
        .catch(() => {
          setItems((prev) =>
            prev.map((u) =>
              u.id === userId ? { ...u, role: previousRole } : u,
            ),
          );
          setActionError("Failed to update role");
          setActionSuccess(null);
        })
        .finally(() => setUpdatingRoleId(null));
    },
    [items],
  );

  const handleDeleteClick = useCallback((user: UserItem) => {
    setDeleteTarget({ id: user.id, email: user.email });
    setDeleteError(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const token = getStoredAccessToken();
    if (!token) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json().catch(() => ({}));
      if (
        res.status === 401 ||
        res.status === 403 ||
        isCredentialsError(data?.error)
      ) {
        clearAuthAndRedirect();
        return;
      }
      if (res.ok) {
        sessionStorage.setItem("user-deleted", "1");
        setDeleteTarget(null);
        setDeleteError(null);
        window.location.href = "/case-studies/users";
        return;
      }
      setDeleteError(data?.error ?? "Failed to delete user");
      setDeleteTarget(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setDeleteError("Failed to delete user");
      setDeleteTarget(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const isRowBusy = (userId: number) =>
    updatingRoleId === userId || (deleteTarget?.id === userId && deleting);

  if (getStoredRole() !== "admin") {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  if (loading) {
    return (
      <div className="ecl-u-d-flex ecl-u-flex-column ecl-u-align-items-center ecl-u-justify-content-center min-h-90 ecl-u-pa-xl">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ecl-u-pa-l">
        <div className="ecl-feedback-message ecl-feedback-message--error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="ecl-u-pa-l">
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteError(null);
            requestAnimationFrame(() => {
              (document.activeElement as HTMLElement | null)?.blur();
            });
          }
        }}
        onConfirm={handleDeleteConfirm}
        isBlocking={deleting}
      >
        {deleteTarget ? (
          <p className="ecl-u-type-paragraph ecl-u-mv-none">
            Are you sure you want to delete the user &quot;{deleteTarget.email}
            &quot;? This action cannot be undone.
          </p>
        ) : null}
      </ConfirmDialog>

      {deleteError && (
        <div className="ecl-u-mb-m">
          <Notification
            variant="error"
            title="Delete failed"
            description={deleteError}
            onClose={() => setDeleteError(null)}
          />
        </div>
      )}
      {actionError && (
        <div className="ecl-u-mb-m">
          <Notification
            variant="error"
            title="Action failed"
            description={actionError}
            onClose={() => setActionError(null)}
          />
        </div>
      )}
      {actionSuccess && (
        <div className="ecl-u-mb-m">
          <Notification
            variant="success"
            title="Success"
            description={actionSuccess}
            onClose={() => setActionSuccess(null)}
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-[1140px]">
        <div className="ecl-u-mb-xl flex flex-col min-[1140px]:flex-row min-[1140px]:justify-between min-[1140px]:items-center justify-end gap-4">
          <h1 className="ecl-u-mb-m">Manage users</h1>
          <Link
            href="/case-studies/users/add-user"
            className="ecl-button ecl-button--primary self-end min-[1140px]:self-auto"
          >
            <span className="ecl-button__container">
              <ClientIcon className="wt-icon--plus ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
              Add user
            </span>
          </Link>
        </div>

        <div className="max-h-[80vh] overflow-y-auto ecl-u-mb-l">
          <div className="ecl-table-responsive overflow-y-hidden">
            <table
              className="ecl-table w-full table-auto"
              id="users-table"
              data-ecl-table
              data-ecl-auto-init="Table"
              data-ecl-table-sort-label-asc="Sort ascending"
              data-ecl-table-sort-label-desc="Sort descending"
              data-ecl-table-sort-label-default="Sort"
            >
              <caption className="ecl-table__caption">Users</caption>
              <thead className="ecl-table__head bg-(--ecl-color-neutral-50)!">
                <tr className="ecl-table__row">
                  <th
                    id="users-header-email"
                    scope="col"
                    className="ecl-table__header min-w-max"
                    data-ecl-table-sort-toggle
                  >
                    Email
                  </th>
                  <th
                    id="users-header-role"
                    scope="col"
                    className="ecl-table__header min-w-max"
                    data-ecl-table-sort-toggle
                  >
                    Role
                  </th>
                  <th
                    id="users-header-remove"
                    scope="col"
                    className="ecl-table__header  ecl-u-type-align-center max-[996px]:text-left! min-w-max"
                  >
                    Remove User?
                  </th>
                </tr>
              </thead>
              <tbody className="ecl-table__body">
                {items.map((user) => (
                  <tr key={user.id} className="ecl-table__row">
                    <td
                      data-ecl-table-header="Email"
                      headers="users-header-email"
                      className="ecl-table__cell min-w-max"
                    >
                      {user.email}
                    </td>
                    <td
                      data-ecl-table-header="Role"
                      headers="users-header-role"
                      className="ecl-table__cell min-w-max"
                    >
                      <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
                        <RoleSelect
                          value={user.role}
                          onChange={(v) => handleRoleChange(user.id, v)}
                          disabled={isRowBusy(user.id)}
                          aria-label={`Change role for ${user.email}`}
                        />
                        {updatingRoleId === user.id && (
                          <span role="status" aria-label="Updating role…">
                            <ClientIcon className="wt-icon--spinner ecl-icon ecl-icon--s wt-icon--rotate-animate" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      data-ecl-table-header="Remove User?"
                      headers="users-header-remove"
                      className="ecl-table__cell  ecl-u-type-align-center max-[996px]:text-left!"
                    >
                      <button
                        type="button"
                        title="Delete user"
                        className="ecl-button ecl-button--primary bg-(--ecl-color-error-500)! hover:bg-(--ecl-color-error-600)!"
                        disabled={isRowBusy(user.id)}
                        onClick={() => handleDeleteClick(user)}
                        aria-label={`Delete user ${user.email}`}
                      >
                        <span className="ecl-button__container">
                          <ClientIcon className="wt-icon--trash ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
                          Delete user
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {items.length === 0 && (
          <p className="ecl-u-type-paragraph ecl-u-mb-l">No users found.</p>
        )}

        {total > 0 && (
          <div className="ecl-u-d-flex gap-4 flex-col min-[1140px]:flex-row min-[1140px]:items-end min-[1140px]:justify-between ecl-u-mt-l">
            <div className="ecl-u-d-flex ecl-u-justify-content-center min-[1140px]:ecl-u-justify-content-start!">
              <PageSizeSelect />
            </div>
            {totalPages > 1 && (
              <div className="ecl-u-d-flex ecl-u-justify-content-center min-[1140px]:flex-1">
                <Pagination
                  total={total}
                  page={safePage}
                  limit={limit}
                  searchParams={
                    searchParamsObj as import("@/app/case-studies/_types/search").CaseStudySearchParams
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
