import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProviders from "@/providers/QueryProvider";
// 🟢 NEW: Import the Toaster
import { Toaster } from "sonner";
// Use the @ alias to point to the src or root directory
import "@/app/globals.css";
import { AdminSidebar } from "@/components/module/dashboard/adminSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineHub",
  description:
    "Watch movies and TV shows online. Stream anywhere, anytime on CineHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
        <QueryProviders>
          <div className="flex">
            <AdminSidebar />
            {children}
          </div>
          {/* 🟢 NEW: Add Toaster here so notifications work across the whole app! */}
          <Toaster theme="dark" position="top-right" richColors />
        </QueryProviders>
      </body>
    </html>
  );
}
