import { create } from 'zustand';
import { ISubscription } from '@/typesDefined/index';

interface SubscriptionState {
  subscriptions: ISubscription[];
  selectedSubscription: ISubscription | null;
  setSubscriptions: (subs: ISubscription[]) => void;
  addSubscription: (sub: ISubscription) => void;
  updateSubscription: (id: string, sub: Partial<ISubscription>) => void;
  removeSubscription: (id: string) => void;
  setSelected: (sub: ISubscription | null) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  selectedSubscription: null,
  setSubscriptions: (subs) => set({ subscriptions: subs }),
  addSubscription: (sub) =>
    set((state) => ({
      subscriptions: [...state.subscriptions, sub],
    })),
  updateSubscription: (id, updates) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s._id.toString() === id ? ({ ...s, ...updates } as ISubscription) : s
      ),
    })),
  removeSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s._id.toString() !== id),
    })),
  setSelected: (sub) => set({ selectedSubscription: sub }),
}));