import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import "../styles/wallet-selector.css";
import ThemeProvider from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import ThemeCSS from "@/components/ThemeCSS";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Infi Markets - Distribution Markets Platform",
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
            <div className="min-h-screen">
              <Navbar />
              <CategoryNav />
              <main className="pt-32">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
