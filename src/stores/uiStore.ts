
import { create } from 'zustand';

interface UiStore {
  isPreviewMode: boolean;
  isChatMode: boolean;
  setIsPreviewMode: (isPreviewMode: boolean) => void;
  toggleChatMode: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isPreviewMode: false,
  isChatMode: false,
  
  setIsPreviewMode: (isPreviewMode: boolean) => set({ isPreviewMode }),
  toggleChatMode: () => set(state => ({ isChatMode: !state.isChatMode }))
}));
