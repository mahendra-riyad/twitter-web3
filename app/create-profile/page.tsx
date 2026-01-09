"use client";

import { useState } from "react";
import { useContracts } from "@/hooks/useContracts";
import { useWeb3 } from "@/hooks/useWeb3";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";

export default function CreateProfile() {
  const { profileContract } = useContracts();
  const { account, refreshProfile } = useWeb3();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileContract || !account) return;

    setIsSubmitting(true);
    try {
      const tx = await profileContract.setProfile(displayName, bio);
      await tx.wait();
      await refreshProfile();
      router.push("/");
    } catch (err: any) {
      console.error("Failed to set profile:", err);
      alert(err.reason || "Failed to set profile. Check your wallet.");
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

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Create Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 p-8 rounded-3xl border border-gray-800">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="CryptoNomad"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
          <textarea
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] resize-none"
            placeholder="Tell the world who you are..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Updating Ledger...</span>
            </>
          ) : (
            "Save Profile"
          )}
        </button>
      </form>
    </div>
  );
}
