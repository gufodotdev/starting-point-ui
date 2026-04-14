import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { StartingPointUI } from "@/components/starting-point-ui";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.startingpointui.com"),
  alternates: {
    canonical: "/",
  },
  title: "Starting Point UI",
  description: "An open-source component library built for Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=inter:400,500,600,700"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var e=localStorage.getItem("sp-theme-exp");if(e&&Date.now()>Number(e)){localStorage.removeItem("sp-theme");localStorage.removeItem("sp-theme-config");localStorage.removeItem("sp-theme-font");localStorage.removeItem("sp-theme-exp");return}var t=localStorage.getItem("sp-theme");if(t){var s=document.createElement("style");s.id="sp-theme";s.textContent=t;document.head.appendChild(s)}var f=localStorage.getItem("sp-theme-font");if(f){var l=document.createElement("link");l.rel="stylesheet";l.href=f;document.head.appendChild(l)}}catch(e){}})()`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <StartingPointUI />
      </body>
    </html>
  );
}
