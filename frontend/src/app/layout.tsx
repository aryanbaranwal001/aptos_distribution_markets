import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/wallet-selector.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import ThemeProvider from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import ThemeCSS from "@/components/ThemeCSS";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mirae - Distribution Markets Platform",
  description: "A modern platform for prediction markets and distribution trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <WalletProvider>
          <ThemeProvider>
            <ThemeCSS />
            {children}
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
