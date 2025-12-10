import type { Metadata } from "next";
// Note: We need to update the Geist fonts if they are no longer in your local setup, but keeping for now.
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import the new providers wrapper from the src folder
import AppProviders from '@/AppProviders';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Metadata fields updated from index.html
  title: "ReRouteLah - Safe Navigation for Everyone",
  description: "ReRouteLah helps Persons with Intellectual Disabilities navigate Singapore's public transport system safely with AR guidance, real-time alerts, and emergency support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap all page content in the new provider component */}
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}