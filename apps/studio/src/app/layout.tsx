import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperSeller AI Studio | Video Generator",
  description: "AI-powered video generation studio by SuperSeller AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-winner-bg text-winner-text font-heebo antialiased">
        {children}
      </body>
    </html>
  );
}
