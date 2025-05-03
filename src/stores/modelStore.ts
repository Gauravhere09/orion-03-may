
import { create } from 'zustand';
import { aiModels, AIModel } from '@/data/models';
import { toast } from '@/components/ui/sonner';

interface ModelStore {
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  handleModelSelect: (model: AIModel) => void;
}

export const useModelStore = create<ModelStore>((set, get) => ({
  selectedModel: aiModels[0],
  
  setSelectedModel: (model: AIModel) => set({ selectedModel: model }),
  
  handleModelSelect: (model: AIModel) => {
    set({ selectedModel: model });
    
    toast(`Switched to ${model.name} ${model.version}`, {
      description: "Your chat history is preserved but the model context has changed."
    });
  }
}));
