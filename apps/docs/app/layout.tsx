import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import "./globals.css";
import { StartingPointUI } from "@/components/starting-point-ui";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Starting Point UI",
  description: "Stop building from scratch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          {children}
        </ThemeProvider>
        <StartingPointUI />
        <Script id="va-init" strategy="beforeInteractive">
          {`window.va = window.va || function() { (window.vaq = window.vaq || []).push(arguments) }`}
        </Script>
        <Script
          async
          src="/starting-point-ui-analytics/script.js"
          data-endpoint="/starting-point-ui-analytics"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
