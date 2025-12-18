import React, { useState } from 'react';
import {
  X,
  Wallet,
  Chrome,
  Mail,
  MessageCircle,
  Star,
  Smartphone,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { WalletOption, WalletType } from '../../types/wallet';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 钱包选项配置
const walletOptions: WalletOption[] = [
  {
    type: WalletType.METAMASK,
    name: 'MetaMask',
    icon: <Chrome className="w-6 h-6" />,
    description: '连接 MetaMask 钱包',
    isPopular: true,
  },
  {
    type: WalletType.WALLET_CONNECT,
    name: 'WalletConnect',
    icon: <Smartphone className="w-6 h-6" />,
    description: '使用移动钱包扫码连接',
    isPopular: true,
  },
  {
    type: WalletType.GOOGLE,
    name: 'Google',
    icon: <Star className="w-6 h-6" />,
    description: '使用 Google 账号登录',
    isPopular: false,
  },
  {
    type: WalletType.TWITTER,
    name: 'Twitter',
    icon: <MessageCircle className="w-6 h-6" />,
    description: '使用 Twitter 账号登录',
    isPopular: false,
  },
  {
    type: WalletType.EMAIL,
    name: 'Email',
    icon: <Mail className="w-6 h-6" />,
    description: '使用邮箱创建钱包',
    isPopular: false,
  },
];

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connect, connectWithMetamask, state } = useWallet();
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  // 处理钱包选择
  const handleWalletSelect = async (option: WalletOption) => {
    switch (option.type) {
      case WalletType.METAMASK:
        await connectWithMetamask();
        break;
      case WalletType.EMAIL:
        setShowEmailInput(true);
        return;
      default:
        // 对于其他类型，使用通用连接方法
        await connect();
        break;
    }
    onClose();
  };

  // 处理邮箱连接
  const handleEmailConnect = async () => {
    if (email) {
      // await connectWithEmail(email);
      await connect(); // 使用通用连接方法
      setEmail('');
      setShowEmailInput(false);
      onClose();
    }
  };

  // 处理模态框背景点击
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setShowEmailInput(false);
      setEmail('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="tech-card max-w-md w-full mx-4 p-6 border border-blue-500/20">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-blue-400">连接钱包</h2>
          <button
            onClick={() => {
              onClose();
              setShowEmailInput(false);
              setEmail('');
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 错误提示 */}
        {state.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {state.error}
          </div>
        )}

        {/* 邮箱输入模式 */}
        {showEmailInput ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                输入您的邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEmailConnect();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEmailConnect}
                disabled={!email || state.isLoading}
                className="flex-1 neon-glow px-4 py-2 rounded-lg bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {state.isLoading ? '连接中...' : '发送验证邮件'}
              </button>
              <button
                onClick={() => {
                  setShowEmailInput(false);
                  setEmail('');
                }}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 钱包选项网格 */}
            <div className="grid grid-cols-1 gap-2">
              {walletOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleWalletSelect(option)}
                  disabled={state.isLoading}
                  className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-left hover:bg-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-blue-400">{option.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{option.name}</span>
                      {option.isPopular && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-300">
                          热门
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">{option.description}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* 说明文字 */}
            <div className="mt-6 pt-4 border-t border-blue-500/20">
              <p className="text-xs text-gray-500 text-center">
                连接钱包即表示您同意我们的服务条款和隐私政策
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};