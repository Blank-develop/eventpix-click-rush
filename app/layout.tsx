import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "EventPix Click Rush",
  description: "Find the EventPix logo, click fast, and beat the 30-second clock.",
  metadataBase: new URL("https://eventpix-click-rush.jilayouthbank.chatgpt.site"),
  openGraph: {
    title: "EventPix Click Rush",
    description: "Find the real EventPix logo before time runs out.",
    images: [{ url: "/og.png", width: 1792, height: 939 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EventPix Click Rush",
    description: "Find the real EventPix logo before time runs out.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
