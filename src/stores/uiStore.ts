
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiStore {
  isPreviewMode: boolean;
  isChatMode: boolean;
  isDarkMode: boolean;
  logoUrl: string;
  setIsPreviewMode: (isPreviewMode: boolean) => void;
  toggleChatMode: () => void;
  toggleDarkMode: () => void;
  setLogoUrl: (logoUrl: string) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      isPreviewMode: false,
      isChatMode: false,
      isDarkMode: true,
      logoUrl: "/lovable-uploads/b8b23fd4-5e37-45df-a71f-69c1687f384b.png",
      
      setIsPreviewMode: (isPreviewMode: boolean) => set({ isPreviewMode }),
      toggleChatMode: () => set(state => ({ isChatMode: !state.isChatMode })),
      toggleDarkMode: () => set(state => {
        const newIsDarkMode = !state.isDarkMode;
        // Update logo URL based on theme
        const logoUrl = newIsDarkMode 
          ? "/lovable-uploads/b8b23fd4-5e37-45df-a71f-69c1687f384b.png" 
          : "/lovable-uploads/8f162460-5a85-4a8e-82f5-343312051ee5.png";
        return { 
          isDarkMode: newIsDarkMode,
          logoUrl
        };
      }),
      setLogoUrl: (logoUrl: string) => set({ logoUrl })
    }),
    {
      name: 'ui-store',
    }
  )
);
