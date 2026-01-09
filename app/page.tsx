"use client";

import { useEffect, useState, useCallback } from "react";
import { useContracts } from "@/hooks/useContracts";
import { useWeb3 } from "@/hooks/useWeb3";
import { TweetCard } from "@/components/TweetCard";
import { Loading } from "@/components/Loading";

interface Tweet {
  id: bigint;
  author: string;
  content: string;
  timestamp: bigint;
  likes: bigint;
}

export default function Home() {
  const { twitterContract } = useContracts();
  const { account, connectWallet } = useWeb3();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTweets = useCallback(async () => {
    if (!twitterContract) {
      setIsLoading(false);
      return;
    }
    try {
      // Updated: User's contract requires an address for getAllTweets(address _owner).
      // Since there is no global feed, we'll try to fetch the current user's tweets if connected.
      // If not connected, we cannot show a feed without a target address.
      if (account) {
        const userTweets = await twitterContract.getAllTweets(account);
        const sortedTweets = [...userTweets].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        setTweets(sortedTweets);
      } else {
        setTweets([]);
      }
    } catch (err) {
      console.error("Failed to fetch tweets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [twitterContract, account]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-12">
      <header className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          The Future of <span className="text-blue-500">Social</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
          A decentralized platform where you own your identity and your content. No algorithms, no censorship, just the community.
        </p>
        
        {!account && (
          <button
            onClick={connectWallet}
            className="mt-6 bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
          >
            Join the Conversation
          </button>
        )}
      </header>

      <div className="grid gap-6">
        {tweets.length > 0 ? (
          tweets.map((tweet) => (
            <TweetCard key={tweet.id.toString()} tweet={tweet} onActionComplete={fetchTweets} />
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-3xl">
            <p className="text-gray-500 text-lg">No tweets yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
