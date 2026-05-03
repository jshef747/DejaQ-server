import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DejaQ Chat",
  description: "Chat with your organization's AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
