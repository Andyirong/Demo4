import { WalletType, WalletState } from '../types/wallet';
import { LocalStorage } from '../utils/storage';

// 钱包服务类
export class WalletService {
  private isInitialized = false;
  private privy: any = null;

  // 初始化服务
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 先尝试从本地存储恢复连接状态
      const savedConnection = LocalStorage.getItem<{
        address: string;
        walletType: WalletType;
      }>('wallet_connection');

      if (savedConnection) {
        this.isInitialized = true;
        console.log('Restored wallet connection from local storage');
        return;
      }

      // 模拟初始化
      await new Promise(resolve => setTimeout(resolve, 100));
      this.isInitialized = true;
      console.log('Wallet service initialized');
    } catch (error) {
      console.error('Failed to initialize wallet service:', error);
    }
  }

  // 连接钱包
  async connect(): Promise<{ address: string; walletType: WalletType }> {
    console.log('Starting wallet connection...');

    // 由于 Privy 有模块兼容性问题，我们先使用模拟连接
    // 您可以在 Privy Dashboard 中配置应用后，我们再尝试集成真实的 Privy
    return await this.connectWithPrivy();
  }

  // 尝试使用 Privy 连接
  private async connectWithPrivy(): Promise<{ address: string; walletType: WalletType }> {
    // 动态导入 Privy
    try {
      const { createPrivy } = await import('@privy-io/react-auth');

      const PRIVY_APP_ID = 'cmayugmew01guju0m8b6nrsnv';

      this.privy = await createPrivy({
        appId: PRIVY_APP_ID,
        config: {
          appearance: {
            theme: 'dark',
            accentColor: '#00d4ff',
          },
          loginMethods: ['email', 'google', 'twitter', 'wallet'],
        },
      });

      // 进行认证
      const authResult = await this.privy.authenticate();

      if (authResult && authResult.user) {
        const walletAccount = authResult.user.linkedAccounts.find(
          (account: any) => account.type === 'wallet' || account.type === 'embedded_wallet'
        );

        if (walletAccount && walletAccount.address) {
          let walletType: WalletType = WalletType.METAMASK;

          if (authResult.user.loginMethod === 'google') {
            walletType = WalletType.GOOGLE;
          } else if (authResult.user.loginMethod === 'twitter') {
            walletType = WalletType.TWITTER;
          } else if (authResult.user.loginMethod === 'email') {
            walletType = WalletType.EMAIL;
          }

          const result = {
            address: walletAccount.address,
            walletType,
          };

          LocalStorage.setItem('wallet_connection', result);
          return result;
        }
      }
    } catch (error: any) {
      console.warn('Privy connection failed, using mock:', error.message);
    }

    // 如果 Privy 连接失败，使用模拟连接
    return await this.connectMock();
  }

  // 模拟连接
  private async connectMock(): Promise<{ address: string; walletType: WalletType }> {
    // 显示提示信息
    alert('模拟钱包连接\n\n这是一个演示连接。\n实际部署时将使用 Privy 真实登录。');

    // 模拟连接过程
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 生成模拟钱包地址
    const mockAddress = '0x' + Array.from({length: 40}, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const walletType = WalletType.METAMASK;

    const result = {
      address: mockAddress,
      walletType,
    };

    // 保存到本地存储
    LocalStorage.setItem('wallet_connection', result);
    console.log('Mock wallet connected:', result);
    return result;
  }

  // 断开连接
  async disconnect(): Promise<void> {
    try {
      if (this.privy) {
        await this.privy.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    LocalStorage.removeItem('wallet_connection');
    console.log('Wallet disconnected');
  }

  // 获取已连接的钱包状态
  async getConnectedWallet(): Promise<{ address: string; walletType: WalletType } | null> {
    // 从本地存储获取
    const savedConnection = LocalStorage.getItem<{
      address: string;
      walletType: WalletType;
    }>('wallet_connection');

    return savedConnection || null;
  }

  // 检查是否已连接
  async isConnected(): Promise<boolean> {
    const wallet = await this.getConnectedWallet();
    return wallet !== null;
  }

  // 获取钱包余额
  async getBalance(address: string): Promise<string> {
    // 模拟余额
    return (Math.random() * 10).toFixed(4) + ' ETH';
  }
}

// 导出单例实例
export const walletService = new WalletService();