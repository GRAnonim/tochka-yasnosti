import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Точка ясности",
  description:
    "Telegram Mini App для саморефлексии и спокойных решений. Не заменяет терапию.",
  applicationName: "Точка ясности",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom for low-vision users (Lighthouse/axe fail on maximum-scale=1)
  themeColor: "#cfdad6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-atmosphere="dusk">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='tochka-atmosphere-v1';var v=localStorage.getItem(k);if(v==='mist'||v==='dusk'||v==='warm'){document.documentElement.dataset.atmosphere=v;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
