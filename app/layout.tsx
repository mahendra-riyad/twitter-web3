import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/hooks/useWeb3";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Twitter3 - Web3 Social dApp",
  description: "A decentralized Twitter-like application built with Next.js and ethers v6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen selection:bg-blue-500/30`}>
        <Web3Provider>
          <div className="relative min-h-screen">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>
            
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">
              {children}
            </main>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
