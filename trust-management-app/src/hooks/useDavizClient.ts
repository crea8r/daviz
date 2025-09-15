import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { DavizClient } from '../lib/anchor-client';

export const useDavizClient = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    return new DavizClient(connection, wallet as any);
  }, [connection, wallet]);

  return client;
};