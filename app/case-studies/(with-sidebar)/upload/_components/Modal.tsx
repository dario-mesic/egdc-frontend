"use client";

import { useEffect, useRef } from "react";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";

type ModalProps = Readonly<{
  id: string;
  title: string;
  triggerLabel: string;
  triggerClassName?: string;
  size?: "s" | "m" | "l";
  modalClassName?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isBlocking?: boolean;
  onOpen?: () => void;
}>;

export default function Modal({
  id,
  title,
  triggerLabel,
  triggerClassName = "ecl-button ecl-button--primary",
  size = "l",
  modalClassName,
  children,
  footer,
  isBlocking = false,
  onOpen,
}: ModalProps) {
  const toggleId = `${id}-toggle`;
  const dialogId = `${id}-modal`;
  const headerId = `${dialogId}-header`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    globalThis.ECL?.autoInit?.();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onCancel = (e: Event) => {
      if (!isBlocking) return;
      e.preventDefault(); // blocks ESC close
    };

    const onClose = () => {
      if (!isBlocking) return;

      if (!dialog.open) dialog.showModal();
    };

    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);

    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, [isBlocking]);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        id={toggleId}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        {triggerLabel}
      </button>

      <dialog
        data-ecl-auto-init="Modal"
        data-ecl-modal-toggle={toggleId}
        id={dialogId}
        aria-modal="true"
        className={`ecl-modal ecl-modal--${size}`}
        aria-labelledby={headerId}
        ref={dialogRef}
      >
        <div className="ecl-modal__container">
          <div
            className={`ecl-modal__content ecl-container ${modalClassName ?? ""}`}
          >
            <header className="ecl-modal__header">
              <div className="ecl-modal__header-content" id={headerId}>
                {title}
              </div>

              <button
                className="ecl-button ecl-button--tertiary ecl-modal__close ecl-button--icon-only"
                type="button"
                data-ecl-modal-close
              >
                <span className="ecl-button__container">
                  <span className="ecl-button__label" data-ecl-label="true">
                    Close
                  </span>
                  <ClientIcon className="wt-icon-ecl--close ecl-icon ecl-icon--m ecl-button__icon" />
                </span>
              </button>
            </header>

            <div className="ecl-modal__body">
              <div className="ecl-modal__body-scroll" data-ecl-modal-scroll>
                {children}
              </div>
              <div className="ecl-modal__body-overflow" aria-hidden="true" />
            </div>

            {footer ? (
              <footer className="ecl-modal__footer">
                <div className="ecl-modal__footer-content">{footer}</div>
              </footer>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
