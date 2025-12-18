// 钱包类型枚举
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  GOOGLE = 'google',
  TWITTER = 'twitter',
  DISCORD = 'discord',
  EMAIL = 'email'
}

// 钱包状态接口
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: WalletType | null;
  isLoading: boolean;
  error: string | null;
}

// WalletContext 类型定义
export interface WalletContextType {
  state: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  connectWithMetamask: () => Promise<void>;
  connectWithGoogle: () => Promise<void>;
  connectWithTwitter: () => Promise<void>;
  connectWithEmail: (email: string) => Promise<void>;
}

// 钱包选项接口（用于模态框）
export interface WalletOption {
  type: WalletType;
  name: string;
  icon: React.ReactNode;
  description: string;
  isPopular?: boolean;
}

// 本地存储的键名
export const WALLET_STORAGE_KEY = 'wallet_connection_state';

// 钱包地址格式化
export const formatWalletAddress = (address: string | null): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 验证钱包地址格式（以太坊地址）
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};