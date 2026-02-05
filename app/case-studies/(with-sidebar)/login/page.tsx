"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Login from "@/app/case-studies/_components/Login";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("cs-authed") === "1") {
      router.replace("/case-studies/my");
    }
  }, [router]);

  return (
    <Login
      onSuccess={() => {
        sessionStorage.setItem("cs-authed", "1");
        router.replace("/case-studies/my");
      }}
    />
  );
}
