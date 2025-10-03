import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
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

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Infi Markets - Distribution Markets Platform",
  description: "A modern platform for prediction markets and distribution trading",
  icons: {
    icon: "/webpage_logo.png",
    shortcut: "/webpage_logo.png",
    apple: "/webpage_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} font-sans antialiased`}>
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
