"use client";

import { useWeb3 } from "@/hooks/useWeb3";
import { useContracts } from "@/hooks/useContracts";
import { useState } from "react";
import Link from "next/link";

interface Tweet {
  id: bigint;
  author: string;
  content: string;
  timestamp: bigint;
  likes: bigint;
}

export const TweetCard = ({ tweet, onActionComplete }: { tweet: Tweet; onActionComplete?: () => void }) => {
  const { account } = useWeb3();
  const { twitterContract } = useContracts();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!twitterContract || !account) return;
    setIsLiking(true);
    try {
      // Updated: User's contract requires likeTweet(address author, uint256 id)
      const tx = await twitterContract.likeTweet(tweet.author, tweet.id);
      await tx.wait();
      onActionComplete?.();
    } catch (err: any) {
      console.error("Like failed:", err);
      alert(err.reason || "Action failed. Make sure you have a profile!");
    } finally {
      setIsLiking(false);
    }
  };

  const date = new Date(Number(tweet.timestamp) * 1000).toLocaleDateString();

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <Link href={`/profile/${tweet.author}`} className="font-mono text-sm text-blue-400 hover:underline">
          {tweet.author.slice(0, 6)}...{tweet.author.slice(-4)}
        </Link>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      
      <p className="text-gray-200 text-lg mb-6 leading-relaxed">
        {tweet.content}
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            isLiking ? "bg-red-500/20 text-red-500" : "bg-gray-800 hover:bg-red-500/10 hover:text-red-500 text-gray-400"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className="font-medium">{Number(tweet.likes)}</span>
        </button>
      </div>
    </div>
  );
};
