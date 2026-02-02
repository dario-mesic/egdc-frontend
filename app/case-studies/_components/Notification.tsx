"use client";

import { useEffect } from "react";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";

type NotificationProps = Readonly<{
  variant: "success" | "error";
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  autoDismissMs?: number;
}>;

export default function Notification({
  variant,
  title,
  description,
  children,
  onClose,
  autoDismissMs = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (!autoDismissMs) return;

    const t = setTimeout(() => {
      onClose?.();
    }, autoDismissMs);

    return () => clearTimeout(t);
  }, [autoDismissMs, onClose]);

  return (
    <div
      className={`ecl-notification ecl-notification--${variant}`}
      data-ecl-notification
      role="alert"
      data-ecl-auto-init="Notification"
    >
      <ClientIcon className="ecl-icon ecl-icon--l ecl-notification__icon" />

      <div className="ecl-notification__content">
        <div className="ecl-notification__title">{title}</div>

        {description ? (
          <div className="ecl-notification__description">{description}</div>
        ) : null}

        {children ? (
          <div className="ecl-notification__description ecl-u-mt-s">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
