import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DejaQ Chat",
  description: "Chat with your organization's AI assistant",
};

// This layout intentionally has no Supabase auth check.
// Authentication is handled via org API keys stored in localStorage.
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
