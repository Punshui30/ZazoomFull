import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { BlockchainMonitor } from '../lib/blockchain';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import toast from 'react-hot-toast';

interface PaymentProps {
  amount: number;
  orderId: string;
  onPaymentComplete: (txHash: string) => void;
}

export function CryptoPayment({ amount, orderId, onPaymentComplete }: PaymentProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [btcAmount, setBtcAmount] = useState<string>('0');
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [monitor, setMonitor] = useState<BlockchainMonitor | null>(null);
  
  const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET;
  
  useEffect(() => {
    if (!ADMIN_WALLET) {
      setError('Payment system is not properly configured');
      logger.error('Missing admin wallet configuration');
      return;
    }

    try {
      const blockchainMonitor = new BlockchainMonitor(ADMIN_WALLET);
      setMonitor(blockchainMonitor);
      
      const updateBTCAmount = async () => {
        try {
          const price = await blockchainMonitor.getBTCPrice();
          setBtcPrice(price);
          const btcValue = (amount / price).toFixed(8);
          setBtcAmount(btcValue);
        } catch (err) {
          logger.error('Failed to fetch BTC price:', err);
          setError('Failed to fetch BTC price. Please try again.');
        }
      };

      updateBTCAmount();
      const interval = setInterval(updateBTCAmount, 60000);

      return () => {
        clearInterval(interval);
        blockchainMonitor.stopMonitoring();
      };
    } catch (err) {
      logger.error('Failed to initialize blockchain monitor:', err);
      setError('Failed to initialize payment system');
    }
  }, [amount, ADMIN_WALLET]);
  
  const paymentUrl = `bitcoin:${ADMIN_WALLET}?amount=${btcAmount}`;

  const checkPaymentStatus = async () => {
    if (!monitor || !ADMIN_WALLET) {
      setError('Payment system is not properly configured');
      return;
    }

    setPaymentStatus('processing');
    setError(null);
    
    try {
      const txHash = await monitor.monitorPayment(btcAmount, orderId);
      setPaymentStatus('completed');
      onPaymentComplete(txHash);
      toast.success('Payment confirmed! Your order is being processed.');
    } catch (err) {
      logger.error('Payment verification failed:', err);
      setError('Payment verification failed. Please try again.');
      setPaymentStatus('pending');
    }
  };

  if (error) {
    return (
      <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-red-500/20">
        <div className="flex items-center mb-4 text-red-400">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <p>{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="bg-red-500/20 text-red-400 px-4 py-2 rounded hover:bg-red-500/30 transition-colors w-full"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-[#39ff14]/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#39ff14]">Secure Payment</h2>
        <Wallet className="w-6 h-6 text-[#39ff14]" />
      </div>

      <div className="mb-6">
        <p className="text-[#39ff14] mb-2">Amount to pay:</p>
        <div className="flex justify-between items-center bg-black/30 p-3 rounded border border-[#39ff14]/20">
          <span className="text-lg font-semibold text-[#39ff14]">${amount.toFixed(2)} USD</span>
          <span className="text-[#39ff14]">≈ {btcAmount} BTC</span>
        </div>
        <p className="text-xs text-[#39ff14]/70 mt-1">1 BTC = ${btcPrice.toFixed(2)} USD</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG 
            value={paymentUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-[#39ff14] text-sm mb-2">Scan QR code with your Bitcoin wallet</p>
        <p className="text-[#39ff14]/70 text-xs">
          Payment will be automatically verified
        </p>
      </div>

      {paymentStatus === 'pending' && (
        <button
          onClick={checkPaymentStatus}
          className="w-full bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg hover:bg-[#39ff14]/30 transition-colors border border-[#39ff14]/20"
        >
          Check Payment Status
        </button>
      )}

      {paymentStatus === 'processing' && (
        <div className="flex items-center justify-center text-[#39ff14] py-3">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          Verifying Payment...
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="text-center">
          <div className="bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg border border-[#39ff14]/20 mb-4">
            Payment Completed!
          </div>
          <p className="text-[#39ff14]/70 text-sm">
            Your order will be processed shortly
          </p>
        </div>
      )}
    </div>
  );
}