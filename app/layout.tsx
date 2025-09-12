import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Press_Start_2P, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Providers } from "./provider";

const VT323P = VT323({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kas together - Stream & Relax",
  description:
    "A modern lofi webapp for music streaming, ambient sounds, and productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/app-logo.png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Open+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        
      </head>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${VT323P.variable}`}
      >
        <Suspense>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            <Providers>
              <AuthProvider>{children}</AuthProvider>
            </Providers>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
