
import { create } from 'zustand';

interface ChatActionsState {
  selectedCodeBlock: string | null;
  setSelectedCodeBlock: (id: string | null) => void;
}

export const useChatActions = create<ChatActionsState>((set) => ({
  selectedCodeBlock: null,
  setSelectedCodeBlock: (id) => set({ selectedCodeBlock: id }),
}));
