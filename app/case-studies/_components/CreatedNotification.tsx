"use client";

import { useEffect, useState } from "react";
import Notification from "@/app/case-studies/_components/Notification";

type NotificationType =
  | "created"
  | "draft-saved"
  | "deleted"
  | "approved"
  | "rejected"
  | null;

const KEYS: { key: string; type: NotificationType }[] = [
  { key: "case-study-created", type: "created" },
  { key: "case-study-draft-saved", type: "draft-saved" },
  { key: "case-study-deleted", type: "deleted" },
  { key: "case-study-approved", type: "approved" },
  { key: "case-study-rejected", type: "rejected" },
];

export default function CreatedNotification() {
  const [notification, setNotification] = useState<NotificationType>(null);

  useEffect(() => {
    for (const { key, type } of KEYS) {
      if (sessionStorage.getItem(key) === "1") {
        sessionStorage.removeItem(key);
        setNotification(type);
        break;
      }
    }
  }, []);

  if (!notification) return null;

  const config = {
    created: {
      variant: "success" as const,
      title: "Case study created",
      description: "Your case study was successfully added.",
    },
    "draft-saved": {
      variant: "success" as const,
      title: "Draft saved",
      description: "Your case study was saved as a draft.",
    },
    deleted: {
      variant: "success" as const,
      title: "Case study deleted",
      description: "The case study was successfully deleted.",
    },
    approved: {
      variant: "success" as const,
      title: "Case study approved",
      description: "The case study was published successfully.",
    },
    rejected: {
      variant: "success" as const,
      title: "Case study rejected",
      description: "The case study was rejected and returned to draft.",
    },
  }[notification];

  return (
    <Notification
      variant={config.variant}
      title={config.title}
      description={config.description}
      onClose={() => setNotification(null)}
    />
  );
}
