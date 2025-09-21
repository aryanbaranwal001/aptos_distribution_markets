import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  connect: (address: string, network: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      address: null,
      network: null,
      connect: (address, network) => set({ isConnected: true, address, network }),
      disconnect: () => set({ isConnected: false, address: null, network: null }),
    }),
    {
      name: 'wallet-storage',
    }
  )
);
