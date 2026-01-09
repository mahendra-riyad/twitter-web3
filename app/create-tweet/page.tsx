"use client";

import { useState, useEffect } from "react";
import { useContracts } from "@/hooks/useContracts";
import { useWeb3 } from "@/hooks/useWeb3";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";

export default function CreateTweet() {
  const { twitterContract } = useContracts();
  const { account, profile } = useWeb3();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twitterContract || !account) return;

    setIsSubmitting(true);
    try {
      const tx = await twitterContract.createTweet(content);
      await tx.wait();
      router.push("/");
    } catch (err: any) {
      console.error("Tweet failed:", err);
      alert(err.reason || "Failed to post tweet. Only registered users can post!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet first</h2>
      </div>
    );
  }

  if (!profile?.displayName) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-yellow-500 mb-4">Identity Required</h2>
        <p className="text-gray-400 mb-8">
          You need to set up your on-chain profile before you can post tweets.
        </p>
        <button
          onClick={() => router.push("/create-profile")}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-full font-bold transition-all"
        >
          Set Up Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create New Tweet</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          required
          maxLength={280}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-800 rounded-3xl p-6 text-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[200px] resize-none"
          placeholder="What's happening in the metaverse?"
        />

        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${content.length > 250 ? "text-red-500" : "text-gray-500"}`}>
            {content.length}/280
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3 rounded-full transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Broadcasting..." : "Tweet"}
          </button>
        </div>
      </form>
    </div>
  );
}
