"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  profile: { displayName: string; bio: string } | null;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [profile, setProfile] = useState<{ displayName: string; bio: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async (currentAccount: string, currentProvider: ethers.BrowserProvider) => {
    try {
      const { PROFILE_ADDRESS } = await import("@/contracts/addresses");
      const ProfileABI = (await import("@/contracts/Profile.json")).default;
      const contract = new ethers.Contract(PROFILE_ADDRESS, ProfileABI, currentProvider);
      
      const data = await contract.getProfile(currentAccount);
      console.log("Profile data fetched:", data);

      // Handle both named and indexed returns from the tuple
      const displayName = data.displayName || data[0];
      const bio = data.bio || data[1];

      if (displayName && displayName.trim() !== "") {
        setProfile({ displayName, bio });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile in context:", err);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (account && provider) {
      await fetchProfileData(account, provider);
    }
  }, [account, provider, fetchProfileData]);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install it to use this dApp.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const browserSigner = await browserProvider.getSigner();

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(browserSigner);

      await fetchProfileData(accounts[0], browserProvider);

      // Clear disconnection flag on manual connect
      localStorage.removeItem("twitter3_isDisconnected");

      // Check network and switch to Sepolia if necessary
      const network = await browserProvider.getNetwork();
      if (network.chainId !== BigInt(11155111)) {
        try {
          await window.ethereum?.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            await window.ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: "Sepolia Test Network",
                  nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
                  rpcUrls: ["https://rpc.sepolia.org"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
    localStorage.setItem("twitter3_isDisconnected", "true");
  }, []);

  useEffect(() => {
    const init = async () => {
      // Respect manual disconnect flag
      if (localStorage.getItem("twitter3_isDisconnected") === "true") {
        return;
      }

      if (typeof window.ethereum !== "undefined") {
        try {
          // Check if already connected
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await browserProvider.send("eth_accounts", []);
          
          if (accounts.length > 0) {
            const browserSigner = await browserProvider.getSigner();
            setAccount(accounts[0]);
            setProvider(browserProvider);
            setSigner(browserSigner);
            await fetchProfileData(accounts[0], browserProvider);
          }
        } catch (err) {
          console.error("Auto-connect failed:", err);
        }
      }
    };
    init();

    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setSigner(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum?.on("accountsChanged", handleAccountsChanged);
      window.ethereum?.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        profile,
        refreshProfile,
        isLoading,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
