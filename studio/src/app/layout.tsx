
// src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthUserProvider } from "@/contexts/auth-user-context";
import { Toaster } from "@/components/ui/toaster";
import "@/lib/console-override";

export const metadata: Metadata = {
  title: "MindScope - Visual Task Scoper",
  description: "Interactive mind-map tool for indie devs to break down projects into phases and microtasks.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning={true}>
      {/* Next.js automatically manages the head content when a metadata object is exported */}
      <body
        className="font-sans antialiased" // Use Tailwind's font-sans utility
        suppressHydrationWarning={true} 
      >
        <AuthUserProvider>
          {children}
          <Toaster />
        </AuthUserProvider>
      </body>
    </html>
  );
}
