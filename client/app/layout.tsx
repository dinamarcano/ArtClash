import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MascotsProvider } from "@/context/MascotsContext";
import { UsersProvider } from "@/context/UsersContext";
import { VotesProvider } from "@/context/VotesContext";
import { RoomsProvider } from "@/context/RoomsContext";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <MascotsProvider>
          <UsersProvider>
            <VotesProvider>
              <RoomsProvider>
                {children}
                <BottomNav />
              </RoomsProvider>
            </VotesProvider>
          </UsersProvider>
        </MascotsProvider>
        <Toaster theme="dark" position="top-center" style={toasterStyle} />
      </body>
    </html>
  );
}
