"use client";

import { useEffect, useState, useCallback, use } from "react";
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

interface Profile {
  displayName: string;
  bio: string;
}

export default function UserProfile({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const { twitterContract, profileContract } = useContracts();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalLikes, setTotalLikes] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!twitterContract || !profileContract) {
      setIsLoading(false);
      return;
    }
    try {
      // Updated: Calling user-specific tweets and stats
      const [userTweets, userProfile, likes] = await Promise.all([
        twitterContract.getAllTweets(resolvedParams.address),
        profileContract.getProfile(resolvedParams.address),
        twitterContract.getTotalLikes(resolvedParams.address),
      ]);
      
      setTweets([...userTweets].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)));
      
      const displayName = userProfile.displayName || userProfile[0];
      const bio = userProfile.bio || userProfile[1];
      
      setProfile(displayName ? { displayName, bio } : null);
      setTotalLikes(likes);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [twitterContract, profileContract, resolvedParams.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-12">
      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 flex items-center justify-center text-3xl font-bold">
          {profile?.displayName?.slice(0, 1) || "?"}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {profile?.displayName || resolvedParams.address}
        </h1>
        <p className="text-gray-400 mb-6 max-w-md">{profile?.bio || "No bio set."}</p>
        
        <div className="flex gap-12 border-t border-gray-800 pt-8 w-full justify-center">
          <div className="text-center">
            <span className="block text-2xl font-bold">{tweets.length}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Tweets</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold">{Number(totalLikes)}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Total Likes</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold px-2">Tweets</h2>
        {tweets.length > 0 ? (
          tweets.map((tweet) => (
            <TweetCard key={tweet.id.toString()} tweet={tweet} onActionComplete={fetchData} />
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-3xl">
            <p className="text-gray-500">No tweets from this user.</p>
          </div>
        )}
      </div>
    </div>
  );
}
