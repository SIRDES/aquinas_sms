import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import "../utils/secrets";
import AuthContextProvider from "@/context/AuthContext";
import ThemeContextProvider from "@/context/ThemeProvider";
import { BatchesContextProvider } from "@/context/BatchesContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AQ Backoffice",
  description: "Aquinas SHS Backoffice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthContextProvider>
          <ThemeContextProvider>
            <BatchesContextProvider>
              {children}
            </BatchesContextProvider>
          </ThemeContextProvider>
        </AuthContextProvider>{" "}
      </body>
    </html>
  );
}
