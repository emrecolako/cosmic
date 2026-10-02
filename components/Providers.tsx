"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <MotionConfig reducedMotion="user">
        <ToastProvider>{children}</ToastProvider>
      </MotionConfig>
    </PostHogProvider>
  );
}
