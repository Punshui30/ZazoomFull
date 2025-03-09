import React, { useState } from 'react';
import { Share2, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const referralCode = user?.id?.slice(0, 8) || 'ZAZOOM';
  const referralLink = `https://zazoom.store/ref/${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
      <div className="flex items-center mb-6">
        <Share2 className="w-6 h-6 text-green-500 mr-2" />
        <h2 className="text-2xl font-bold text-green-500">Refer & Earn</h2>
      </div>

      <div className="space-y-6">
        {/* Rewards Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
            <h3 className="text-green-400 font-bold mb-2">Invite Friends</h3>
            <p className="text-green-400/70 text-sm">Share your unique referral code</p>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
            <h3 className="text-green-400 font-bold mb-2">They Order</h3>
            <p className="text-green-400/70 text-sm">Friends make their first order</p>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
            <h3 className="text-green-400 font-bold mb-2">You Earn</h3>
            <p className="text-green-400/70 text-sm">Get $10 credit per referral</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
          <label className="block text-sm font-medium text-green-400 mb-2">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-black/50 border border-green-500/20 rounded px-3 py-2 text-green-400"
            />
            <button
              onClick={handleCopy}
              className="bg-green-500/20 text-green-400 px-4 py-2 rounded hover:bg-green-500/30 transition-colors flex items-center"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Use my referral code ${referralCode} at ZaZoom! ${referralLink}`)}`)}
            className="flex-1 bg-green-500/20 text-green-400 py-2 rounded hover:bg-green-500/30 transition-colors"
          >
            Share on WhatsApp
          </button>
          <button
            onClick={() => window.open(`https://telegram.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Use my referral code ${referralCode} at ZaZoom!`)}`)}
            className="flex-1 bg-green-500/20 text-green-400 py-2 rounded hover:bg-green-500/30 transition-colors"
          >
            Share on Telegram
          </button>
        </div>
      </div>
    </div>
  );
}