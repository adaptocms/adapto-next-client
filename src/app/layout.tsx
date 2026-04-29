import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adapto CMS",
  description: "Next.js client for Adapto CMS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
