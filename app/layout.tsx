import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SupportWidget } from "@/components/support-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trending - Dex Tracker Fast Trade Screener",
  description: "Cryptocurrency trading by following prices all in one exchanges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ ['colorScheme']: "dark" }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupportWidget />
        <SidebarProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <div className="mt-13 w-full flex">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </SidebarProvider>
      </body>
    </html >
  );
}
