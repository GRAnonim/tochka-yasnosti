import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

/** Manrope — спокойный гротеск с кириллицей, OFL, бесплатно для продукта */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Точка ясности",
  description:
    "Telegram Mini App для саморефлексии и спокойных решений. Не заменяет терапию.",
  applicationName: "Точка ясности",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1f6f6b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${geistMono.variable} antialiased`}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
