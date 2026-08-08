import "../styles/globals.css";
import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "ZubaElektro — Elektrik bo'lishni o'rgan",
  description: "Elektrik montaj kasbini bosqichma-bosqich o'rganing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-bg text-textPrimary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
