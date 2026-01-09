"use client";

import Link from "next/link";
import { useWeb3 } from "@/hooks/useWeb3";
import { useContracts } from "@/hooks/useContracts";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const { account, connectWallet, disconnectWallet, isLoading } = useWeb3();
  const { profileContract } = useContracts();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (account && profileContract) {
        try {
          const profile = await profileContract.getProfile(account);
          if (profile.displayName) {
            setDisplayName(profile.displayName);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setDisplayName(null);
      }
    };
    fetchProfile();
  }, [account, profileContract]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Twitter3
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">Feed</Link>
          {account && (
            <>
              <Link href="/create-tweet" className="text-gray-300 hover:text-white transition-colors">Tweet</Link>
              <Link href={`/profile/${account}`} className="text-gray-300 hover:text-white transition-colors">My Content</Link>
            </>
          )}
          
          {account ? (
            <div className="flex items-center gap-4">
              {!displayName && (
                <Link 
                  href="/create-profile" 
                  className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full border border-yellow-500/30 animate-pulse"
                >
                  Set Profile
                </Link>
              )}
              <div className="flex flex-col items-end border-r border-gray-800 pr-4">
                <span className="text-sm font-medium text-white">
                  {displayName || truncateAddress(account)}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Connected</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                title="Disconnect Wallet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3l3-3m0 0l3 3m-3-3H9" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
