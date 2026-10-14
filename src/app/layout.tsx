import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
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
    <html lang="ru" className={manrope.variable}>
      <body className={`${manrope.className} antialiased`}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
