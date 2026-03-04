"use client";

import { useEffect, useRef } from "react";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";

type ConfirmDialogProps = Readonly<{
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  onCancel?: () => void;
  isBlocking?: boolean;
  confirmVariant?: "primary" | "danger";
}>;

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  onCancel,
  isBlocking = false,
  confirmVariant = "primary",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      if (isBlocking) e.preventDefault();
      else onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [isBlocking, onClose]);

  const confirmClass =
    confirmVariant === "danger"
      ? "ecl-button ecl-button--primary bg-(--ecl-color-error-500)! hover:bg-(--ecl-color-error-600)!"
      : "ecl-button ecl-button--primary";

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="ecl-modal ecl-modal--m"
    >
      <div className="ecl-modal__container">
        <div className="ecl-modal__content ecl-container">
          <header className="ecl-modal__header">
            <div
              className="ecl-modal__header-content"
              id="confirm-dialog-title"
            >
              {title}
            </div>
            <button
              type="button"
              className="ecl-button ecl-button--tertiary ecl-modal__close ecl-button--icon-only"
              onClick={onClose}
              disabled={isBlocking}
              aria-label="Close"
            >
              <span className="ecl-button__container">
                <ClientIcon className="wt-icon-ecl--close ecl-icon ecl-icon--m ecl-button__icon" />
              </span>
            </button>
          </header>
          <div className="ecl-modal__body">
            <div className="ecl-modal__body-scroll">{children}</div>
          </div>
          <footer className="ecl-modal__footer">
            <div className="ecl-modal__footer-content ecl-u-d-flex gap-2">
              <button
                type="button"
                className="ecl-button ecl-button--secondary"
                onClick={onCancel ?? onClose}
                disabled={isBlocking}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={confirmClass}
                onClick={() => onConfirm()}
                disabled={isBlocking}
              >
                {confirmLabel}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </dialog>
  );
}
