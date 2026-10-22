import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";

import { AppNav } from "@/components/AppNav";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MineWords",
  description: "Minecraft English learning buddy for kids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${pixel.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4">
          {children}
        </div>
        <AppNav />
      </body>
    </html>
  );
}
