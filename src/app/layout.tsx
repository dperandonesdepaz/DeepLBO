import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "DeepLBO — Professional LBO Analysis", template: "%s | DeepLBO" },
  description: "Realiza análisis LBO completos en tiempo real. Proyecciones, retornos, sensibilidades y export profesional.",
  keywords: ["LBO", "private equity", "análisis financiero", "buyout", "IRR", "MOIC"],
  authors: [{ name: "DeepLBO" }],
  openGraph: {
    title: "DeepLBO — Professional LBO Analysis",
    description: "Realiza análisis LBO completos en tiempo real.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
