import React, { useState } from 'react';
import { WalletButton } from './WalletButton';
import { WalletModal } from './WalletModal';
import { useWallet } from '../../context/WalletContext';

interface WalletConnectorProps {
  className?: string;
  showModal?: boolean;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  className = '',
  showModal: externalShowModal,
}) => {
  const [internalShowModal, setInternalShowModal] = useState(false);
  const { state } = useWallet();

  // 如果外部控制了 modal 状态，使用外部状态；否则使用内部状态
  const showModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;

  // 处理连接按钮点击
  const handleConnectClick = () => {
    if (externalShowModal === undefined) {
      setInternalShowModal(true);
    }
  };

  // 处理模态框关闭
  const handleCloseModal = () => {
    if (externalShowModal === undefined) {
      setInternalShowModal(false);
    }
  };

  return (
    <>
      <WalletButton
        onConnectClick={handleConnectClick}
        className={className}
      />

      {/* 错误提示 */}
      {state.error && (
        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs max-w-xs">
          {state.error}
        </div>
      )}

      {/* 钱包选择模态框 */}
      <WalletModal
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default WalletConnector;