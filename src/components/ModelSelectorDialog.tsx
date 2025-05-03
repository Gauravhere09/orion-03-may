
import { AIModel, aiModels } from '@/data/models';
import ModelCard from '@/components/ModelCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface ModelSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

const ModelSelectorDialog = ({
  open,
  onOpenChange,
  selectedModel,
  onModelSelect,
}: ModelSelectorDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredModels = aiModels.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select an AI Model</DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 gap-4 py-4">
            {filteredModels.map((model) => (
              <div key={model.id} onClick={() => {
                onModelSelect(model);
                onOpenChange(false);
              }}>
                <ModelCard
                  model={model}
                  isSelected={selectedModel.id === model.id}
                  onClick={() => {}}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectorDialog;
