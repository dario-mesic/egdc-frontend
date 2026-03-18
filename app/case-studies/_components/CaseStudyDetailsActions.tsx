"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ClientIcon from "./icons/ClientIcon";
import BackToCaseStudiesLink from "./BackToCaseStudiesLink";
import ConfirmDialog from "./ConfirmDialog";
import Notification from "./Notification";
import {
  isAuthenticated,
  getStoredAccessToken,
  getStoredRole,
  clearAuthAndRedirect,
  isCredentialsError,
} from "../_lib/auth";

function canDelete(status: string | undefined): boolean {
  const s = status?.toLowerCase().replaceAll("-", "_");
  return s === "draft";
}

function canReview(status: string | undefined): boolean {
  const s = status?.toLowerCase().replaceAll("-", "_");
  return s === "pending_approval";
}

type CaseStudyDetailsActionsProps = Readonly<{
  id: number;
  title: string;
  status?: string;
  preview?: boolean;
}>;

export default function CaseStudyDetailsActions({
  id,
  title,
  status,
  preview = false,
}: CaseStudyDetailsActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [rejectCommentError, setRejectCommentError] = useState<string | null>(
    null,
  );
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const rejectDialogRef = useRef<HTMLDialogElement>(null);

  const role = getStoredRole();
  const isCustodian = role === "custodian";
  const isAdmin = role === "admin";
  const showReviewActions = (isCustodian || isAdmin) && canReview(status);

  useEffect(() => {
    const dialog = rejectDialogRef.current;
    if (!dialog) return;
    if (showRejectDialog) {
      dialog.showModal();
      setRejectComment("");
      setRejectCommentError(null);
      setReviewError(null);
    } else dialog.close();
  }, [showRejectDialog]);

  useEffect(() => {
    const dialog = rejectDialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      if (rejectSubmitting) e.preventDefault();
      else setShowRejectDialog(false);
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [rejectSubmitting]);

  const handleReview = useCallback(
    async (body: { status: string; rejection_comment?: string }) => {
      const token = getStoredAccessToken();
      if (!token) return;
      setReviewError(null);
      setRejectSubmitting(true);
      try {
        const res = await fetch(`/api/case-studies/${id}/review`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
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
        if (!res.ok) {
          setReviewError(data?.error ?? "Request failed.");
          return;
        }
        if (body.status === "published") {
          sessionStorage.setItem("case-study-approved", "1");
        } else {
          sessionStorage.setItem("case-study-rejected", "1");
        }
        setShowRejectDialog(false);
        window.location.href = "/case-studies/my";
      } finally {
        setRejectSubmitting(false);
      }
    },
    [id],
  );

  const handleApprove = useCallback(() => {
    handleReview({ status: "published" });
  }, [handleReview]);

  const handleRejectSubmit = useCallback(() => {
    const comment = rejectComment.trim();
    if (rejectSubmitting) return;
    if (!comment) {
      setRejectCommentError("Comment is required.");
      return;
    }
    setRejectCommentError(null);
    handleReview({ status: "draft", rejection_comment: comment });
  }, [rejectComment, rejectSubmitting, handleReview]);

  const handleDeleteConfirm = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/case-studies/${id}`, {
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
        setShowDeleteDialog(false);
        setDeleteError(null);
        window.location.href = "/case-studies/my";
        return;
      }
      setDeleteError(data?.error ?? "Failed to delete case study.");
      setShowDeleteDialog(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setDeleting(false);
    }
  }, [id]);

  if (preview) {
    return (
      <div className="ecl-u-mb-m">
        <BackToCaseStudiesLink />
      </div>
    );
  }

  const authed = isAuthenticated();
  const showDelete = authed && !isCustodian && !isAdmin && canDelete(status);
  const isReviewing = rejectSubmitting;

  return (
    <>
      {(deleteError || reviewError) && (
        <div className="ecl-u-mb-m">
          <Notification
            variant="error"
            title={reviewError ? "Review failed" : "Delete failed"}
            description={reviewError ?? deleteError ?? ""}
            onClose={() => {
              setDeleteError(null);
              setReviewError(null);
            }}
          />
        </div>
      )}
      <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center ecl-u-justify-content-between ecl-u-mb-m">
        <BackToCaseStudiesLink />
        <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
          {showReviewActions && (
            <>
              <button
                type="button"
                title="Approve"
                className="ecl-button ecl-button--primary"
                onClick={handleApprove}
                disabled={isReviewing}
              >
                <span className="ecl-button__container">Approve</span>
              </button>
              <button
                type="button"
                title="Reject"
                className="ecl-button ecl-button--primary bg-(--ecl-color-error-500)! hover:bg-(--ecl-color-error-600)!"
                onClick={() => setShowRejectDialog(true)}
                disabled={isReviewing}
              >
                <span className="ecl-button__container">Reject</span>
              </button>
            </>
          )}
          {showDelete && (
            <button
              type="button"
              title="Delete"
              className="ecl-button ecl-button--primary bg-(--ecl-color-error-500)! hover:bg-(--ecl-color-error-600)!"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
            >
              <span className="ecl-button__container">
                <ClientIcon className="wt-icon--trash ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
                Delete
              </span>
            </button>
          )}
        </div>
      </div>
      <dialog
        ref={rejectDialogRef}
        aria-modal="true"
        aria-labelledby="reject-dialog-title"
        className="ecl-modal ecl-modal--m"
      >
        <div className="ecl-modal__container">
          <div className="ecl-modal__content ecl-container">
            <header className="ecl-modal__header">
              <div
                className="ecl-modal__header-content"
                id="reject-dialog-title"
              >
                Reject case study
              </div>
              <button
                type="button"
                className="ecl-button ecl-button--tertiary ecl-modal__close ecl-button--icon-only"
                onClick={() => !rejectSubmitting && setShowRejectDialog(false)}
                disabled={rejectSubmitting}
                aria-label="Close"
              >
                <span className="ecl-button__container">
                  <ClientIcon className="wt-icon-ecl--close ecl-icon ecl-icon--m ecl-button__icon" />
                </span>
              </button>
            </header>
            <div className="ecl-modal__body">
              <div className="ecl-modal__body-scroll">
                <div className="ecl-form-group ecl-u-mb-m">
                  <label className="ecl-form-label" htmlFor="reject-comment">
                    Comment{" "}
                    <span
                      className="ecl-form-label__required"
                      role="note"
                      aria-label="required"
                    >
                      *
                    </span>
                  </label>
                  <div className="ecl-help-block" id="reject-comment-helper">
                    Provide feedback for the data owner.
                  </div>
                  <textarea
                    id="reject-comment"
                    className={[
                      "ecl-text-area ecl-u-width-100 ecl-u-mt-2xs",
                      rejectCommentError ? "ecl-u-border-color-error" : "",
                    ].join(" ")}
                    rows={4}
                    value={rejectComment}
                    onChange={(e) => {
                      setRejectComment(e.target.value);
                      if (rejectCommentError) setRejectCommentError(null);
                    }}
                    required
                    disabled={rejectSubmitting}
                    placeholder="Explain why this case study is being rejected…"
                    aria-describedby="reject-comment-helper"
                  />
                  {rejectCommentError ? (
                    <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                      <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />
                      {rejectCommentError}
                    </div>
                  ) : null}
                  {reviewError ? (
                    <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                      <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />
                      {reviewError}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <footer className="ecl-modal__footer">
              <div className="ecl-modal__footer-content ecl-u-d-flex gap-2">
                <button
                  type="button"
                  className="ecl-button ecl-button--secondary"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={rejectSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ecl-button ecl-button--primary bg-(--ecl-color-error-500)! hover:bg-(--ecl-color-error-600)!"
                  onClick={handleRejectSubmit}
                  disabled={rejectSubmitting}
                >
                  {rejectSubmitting ? "Rejecting…" : "Reject"}
                </button>
              </div>
            </footer>
          </div>
        </div>
      </dialog>
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete case study"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        isBlocking={deleting}
        onClose={() => {
          if (!deleting) {
            setShowDeleteDialog(false);
            setDeleteError(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      >
        <>
          <p className="ecl-u-type-paragraph ecl-u-mv-none">
            Are you sure you want to delete &quot;{title}&quot;? This action
            cannot be undone.
          </p>
        </>
      </ConfirmDialog>
    </>
  );
}
