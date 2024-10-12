import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import Script from 'next/script'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Ultimate Screen-Print Calculator ",
  description: "Calculate the cost of multi-part print jobs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        "dark:bg-black dark:text-white"
      )}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster />
        <Script id="disable-zoom" strategy="afterInteractive">
          {`
            document.addEventListener('gesturestart', function(e) {
              e.preventDefault();
              document.body.style.zoom = 1;
            });
          `}
        </Script>
      </body>
    </html>
  );
}
