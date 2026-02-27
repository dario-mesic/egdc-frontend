"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Login from "@/app/case-studies/_components/Login";
import { isAuthenticated } from "@/app/case-studies/_lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/case-studies/my");
    }
  }, [router]);

  return (
    <Login
      onSuccess={() => {
        router.replace("/case-studies/my");
      }}
    />
  );
}
