import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { StartingPointUI } from "@/components/starting-point-ui";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.startingpointui.com"),
  alternates: {
    canonical: "/",
  },
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
        <Analytics basePath="/starting-point-ui-analytics" />
      </body>
    </html>
  );
}
