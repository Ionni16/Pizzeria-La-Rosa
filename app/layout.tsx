// app/layout.tsx
import "./globals.css";
import type { Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.className} ${playfair.variable}`}>{children}</body>
    </html>
  );
}
