import React, { useState } from 'react';
import { Wallet, Loader2 } from 'lucide-react';

export const SimpleWalletButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);

    // 模拟连接过程
    setTimeout(() => {
      setIsConnected(true);
      setAddress('0x1234...5678');
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
  };

  return (
    <button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isLoading}
      className={`neon-glow px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isLoading
          ? 'opacity-50 cursor-not-allowed'
          : isConnected
          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
          : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
          连接中...
        </>
      ) : isConnected ? (
        <>
          <Wallet className="w-4 h-4 inline mr-2" />
          {address}
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 inline mr-2" />
          连接钱包
        </>
      )}
    </button>
  );
};