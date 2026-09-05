import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { StartingPointUI } from "@/components/starting-point-ui";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://startingpointui.com"),
  title: {
    default: "Starting Point UI",
    template: "%s - Starting Point UI",
  },
  description:
    "A framework-agnostic component library for Tailwind CSS, inspired by shadcn/ui.",
  openGraph: {
    type: "website",
    siteName: "Starting Point UI",
    locale: "en_US",
    images: [{ url: "/og?title=Starting%20Point%20UI&description=Beautiful%20components%20for%20Tailwind%20CSS.", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og?title=Starting%20Point%20UI&description=Beautiful%20components%20for%20Tailwind%20CSS."] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <StartingPointUI />
      </body>
    </html>
  );
}
