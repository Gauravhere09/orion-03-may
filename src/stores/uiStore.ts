
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiStore {
  isPreviewMode: boolean;
  isChatMode: boolean;
  setIsPreviewMode: (isPreviewMode: boolean) => void;
  toggleChatMode: () => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      isPreviewMode: false,
      isChatMode: false,
      
      setIsPreviewMode: (isPreviewMode: boolean) => set({ isPreviewMode }),
      toggleChatMode: () => set(state => ({ isChatMode: !state.isChatMode }))
    }),
    {
      name: 'ui-store',
    }
  )
);
