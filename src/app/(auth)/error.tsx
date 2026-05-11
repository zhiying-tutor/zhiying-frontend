"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 py-12 text-center">
      <div className="text-5xl">🔐</div>
      <h2 className="text-xl font-extrabold text-brand-dark">页面加载失败</h2>
      <p className="max-w-md text-sm leading-relaxed text-brand-medium">
        {error.message && /[一-鿿]/.test(error.message)
          ? error.message
          : "登录页出了点问题，请重试。"}
      </p>
      <Button onClick={() => reset()}>重试</Button>
    </div>
  );
}
