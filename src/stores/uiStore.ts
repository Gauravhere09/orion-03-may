
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiStore {
  isPreviewMode: boolean;
  isChatMode: boolean;
  isDarkMode: boolean;
  setIsPreviewMode: (isPreviewMode: boolean) => void;
  toggleChatMode: () => void;
  toggleDarkMode: () => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      isPreviewMode: false,
      isChatMode: false,
      isDarkMode: true,
      
      setIsPreviewMode: (isPreviewMode: boolean) => set({ isPreviewMode }),
      toggleChatMode: () => set(state => ({ isChatMode: !state.isChatMode })),
      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode }))
    }),
    {
      name: 'ui-store',
    }
  )
);
