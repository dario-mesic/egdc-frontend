"use client";

import { useEffect, useState } from "react";
import Notification from "@/app/case-studies/_components/Notification";

export default function CreatedNotification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem("case-study-created");
    if (flag === "1") {
      setVisible(true);
      sessionStorage.removeItem("case-study-created");
    }
  }, []);

  if (!visible) return null;

  return (
    <Notification
      variant="success"
      title="Case study created"
      description="Your case study was successfully added."
      onClose={() => setVisible(false)}
    />
  );
}
