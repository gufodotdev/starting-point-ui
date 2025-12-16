import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StartingPointUI } from "@/components/StartingPointUI";

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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <StartingPointUI />
      </body>
    </html>
  );
}
