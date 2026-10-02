import type { Metadata } from "next";

// Personal, session-only page: keep it out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
