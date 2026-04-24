import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { StartingPointUI } from "@/components/starting-point-ui";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.startingpointui.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Starting Point UI",
    template: "%s - Starting Point UI",
  },
  description:
    "A framework-agnostic component library for Tailwind CSS, inspired by shadcn/ui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <StartingPointUI />
      </body>
    </html>
  );
}
