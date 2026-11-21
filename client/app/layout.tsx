import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import DataProviders from "@/context/DataProviders";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";
import type { CSSProperties } from "react";


const toasterStyle = {
  "--normal-bg": "var(--color-arena-surface)",
  "--normal-border": "var(--color-arena-border)",
  "--normal-text": "var(--color-arena-text)",
} as CSSProperties;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArtClash",
  description: "Vota en vivo entre dos artistas en eventos de anime",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        {/* AuthProvider va por fuera: los demás providers pueden necesitar la sesión */}
        <AuthProvider>
          <DataProviders>
            {children}
            <BottomNav />
          </DataProviders>
        </AuthProvider>
        <Toaster theme="dark" position="top-center" style={toasterStyle} />
      </body>
    </html>
  );
}
