"use client";

import { useMemo } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3";
import ProfileABI from "@/contracts/Profile.json";
import TwitterABI from "@/contracts/Twitter.json";
import { PROFILE_ADDRESS, TWITTER_ADDRESS } from "@/contracts/addresses";

export const useContracts = () => {
  const { provider, signer } = useWeb3();

  const profileContract = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(PROFILE_ADDRESS, ProfileABI, signer || provider);
  }, [provider, signer]);

  const twitterContract = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(TWITTER_ADDRESS, TwitterABI, signer || provider);
  }, [provider, signer]);

  return { profileContract, twitterContract };
};
