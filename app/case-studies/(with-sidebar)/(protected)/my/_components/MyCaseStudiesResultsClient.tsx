"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import CaseStudiesList from "../../../../_components/CaseStudiesList";
import Pagination from "../../../../_components/Pagination";
import PageSizeSelect from "../../../../_components/PageSizeSelect";
import SortPopover from "../../../../_components/SortPopover";
import ConfirmDialog from "../../../../_components/ConfirmDialog";
import Notification from "../../../../_components/Notification";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import {
  getStoredAccessToken,
  getStoredRole,
  clearAuthAndRedirect,
  isCredentialsError,
} from "../../../../_lib/auth";
import type { CaseStudy } from "../../../../_types/caseStudy";
import type { CaseStudySearchParams } from "../../../../_types/search";
import LoadingIndicator from "@/app/case-studies/_components/LoadingIndicator";

function normalizeItems(data: unknown): CaseStudy[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: CaseStudy[] }).items;
  }
  return [];
}

function sortItems(
  items: CaseStudy[],
  sortBy: string,
  sortOrder: string,
): CaseStudy[] {
  const dir = sortOrder === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (sortBy === "title") {
      return (
        (a.title ?? "").localeCompare(b.title ?? "", "en", {
          sensitivity: "base",
        }) * dir
      );
    }
    return 0;
  });
}

export default function MyCaseStudiesResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCustodian = getStoredRole() === "custodian";
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sortBy = (searchParams.get("sort_by") ?? "created_date") as
    | "created_date"
    | "title";
  const sortOrder = (searchParams.get("sort_order") ?? "desc") as
    | "asc"
    | "desc";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? "10")),
  );

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    if (isCustodian) {
      const url = `/api/case-studies/pending?page=${page}&limit=${limit}`;
      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          const isAuthFailure =
            res.status === 401 ||
            res.status === 403 ||
            isCredentialsError(data?.error);
          if (isAuthFailure) {
            clearAuthAndRedirect();
            return;
          }
          if (!res.ok) {
            throw new Error(
              data?.error ?? "Failed to load pending case studies",
            );
          }
          setItems(normalizeItems(data));
          setServerTotal(typeof data?.total === "number" ? data.total : 0);
        })
        .catch((e) => {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load pending case studies",
          );
          setItems([]);
          setServerTotal(0);
        })
        .finally(() => setLoading(false));
      return;
    }

    fetch("/api/users/me/case-studies", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        const isAuthFailure =
          res.status === 401 ||
          res.status === 403 ||
          isCredentialsError(data?.error);
        if (isAuthFailure) {
          clearAuthAndRedirect();
          return;
        }
        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to load case studies");
        }
        setItems(normalizeItems(data));
      })
      .catch((e) => {
        setError(
          e instanceof Error ? e.message : "Failed to load case studies",
        );
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [isCustodian, page, limit]);

  const sorted = useMemo(
    () => (isCustodian ? items : sortItems(items, sortBy, sortOrder)),
    [items, isCustodian, sortBy, sortOrder],
  );

  const total = isCustodian ? serverTotal : sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const pageItems = isCustodian ? items : sorted.slice(start, start + limit);

  const searchParamsObj = useMemo((): CaseStudySearchParams => {
    const o: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      const prev = o[key];
      if (prev === undefined) o[key] = value;
      else o[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    });
    return o as CaseStudySearchParams;
  }, [searchParams]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const token = getStoredAccessToken();
    if (!token) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/case-studies/${deleteTarget.id}`, {
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
        sessionStorage.setItem("case-study-deleted", "1");
        setDeleteTarget(null);
        setDeleteError(null);
        window.location.href = "/case-studies/my";
        return;
      }
      setDeleteError(data?.error ?? "Failed to delete case study.");
      setDeleteTarget(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleEdit = useCallback(
    (id: number) => {
      router.push(`/case-studies/upload?edit=${id}`);
    },
    [router],
  );

  if (loading) {
    return (
      <div className="ecl-u-d-flex ecl-u-flex-column ecl-u-align-items-center ecl-u-justify-content-center min-h-90 ecl-u-pa-xl">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ecl-u-d-flex ecl-u-flex-column ecl-u-align-items-center ecl-u-justify-content-center min-h-90 ecl-u-pa-xl">
        <div className="ecl-feedback-message ecl-feedback-message--error">
          {error}
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <>
        <div className="ecl-row ecl-u-mb-s">
          <div className="ecl-col-12">
            <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center ecl-u-justify-content-between gap-4">
              <span className="ecl-u-type-s ecl-u-type-italic">
                {isCustodian
                  ? "Pending case studies (0)"
                  : "My case studies (0)"}
              </span>{" "}
              {!isCustodian && (
                <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
                  <Link
                    className="ecl-button ecl-button--primary"
                    href="/case-studies/upload"
                  >
                    <span className="ecl-button__container">
                      <ClientIcon className="wt-icon--plus ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
                      Upload new
                    </span>
                  </Link>
                  <SortPopover />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ecl-row">
          <div className="ecl-col-12">
            <div className="ecl-u-bg-grey-25 ecl-u-pa-l ecl-u-border-all ecl-u-border-color-grey-50">
              <h2 className="ecl-u-type-heading-4 ecl-u-mb-s">
                No results found
              </h2>
              <p className="ecl-u-type-paragraph">
                {isCustodian
                  ? "No case studies pending approval."
                  : "You don't have any case studies yet. Upload your first case study to get started."}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete case study"
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
          <>
            <p className="ecl-u-type-paragraph ecl-u-mv-none">
              Are you sure you want to delete &quot;{deleteTarget.title}&quot;?
              This action cannot be undone.
            </p>
          </>
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

      <div className="ecl-row ecl-u-mb-s">
        <div className="ecl-col-12">
          <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center ecl-u-justify-content-between gap-4">
            <span className="ecl-u-type-s ecl-u-type-italic">
              {isCustodian ? "Pending case studies" : "My case studies"} (
              {total})
            </span>{" "}
            {!isCustodian && (
              <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
                <Link
                  className="ecl-button ecl-button--primary"
                  href="/case-studies/upload"
                >
                  <span className="ecl-button__container">
                    <ClientIcon className="wt-icon--plus ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
                    Upload new
                  </span>
                </Link>
                <SortPopover />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ecl-row">
        <div className="ecl-col-12">
          <div className="ecl-u-d-flex ecl-u-flex-column max-h-[calc(100vh-200px)] min-h-90">
            <div
              id="case-studies-scroll"
              className="flex-1 min-h-0 overflow-y-auto"
            >
              <CaseStudiesList
                caseStudies={pageItems}
                showStatusLabels
                onEdit={isCustodian ? undefined : handleEdit}
                onDelete={isCustodian ? undefined : (cs) => setDeleteTarget(cs)}
              />
            </div>

            <div className="mt-auto ecl-u-bg-white ecl-u-pt-2xl">
              <div className="ecl-u-d-flex gap-4 flex-col min-[1140px]:flex-row min-[1140px]:items-end min-[1140px]:justify-between">
                <div className="order-2 min-[1140px]:order-1 ecl-u-d-flex ecl-u-justify-content-center min-[1140px]:ecl-u-justify-content-start! mt-4 min-[1140px]:mt-0">
                  <PageSizeSelect />
                </div>

                {totalPages > 1 && (
                  <div className="order-1 min-[1140px]:order-2 ecl-u-d-flex ecl-u-justify-content-center min-[1140px]:flex-1">
                    <Pagination
                      total={total}
                      page={safePage}
                      limit={limit}
                      searchParams={searchParamsObj}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
