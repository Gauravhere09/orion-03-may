
import { AIModel, aiModels } from '@/data/models';
import ModelCard from '@/components/ModelCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, ImageIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [modelFilter, setModelFilter] = useState<'all' | 'vision' | 'text'>('all');
  
  const filteredModels = aiModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          model.provider.toLowerCase().includes(searchTerm.toLowerCase());
                          
    if (modelFilter === 'all') return matchesSearch;
    if (modelFilter === 'vision') return matchesSearch && model.visionCapable === true;
    if (modelFilter === 'text') return matchesSearch && model.visionCapable !== true;
    
    return matchesSearch;
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select an AI Model</DialogTitle>
          <div className="flex flex-col space-y-4 mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs defaultValue="all" onValueChange={(value) => setModelFilter(value as 'all' | 'vision' | 'text')}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All Models</TabsTrigger>
                <TabsTrigger value="vision" className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Vision</span>
                </TabsTrigger>
                <TabsTrigger value="text">Text Only</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
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
            
            {filteredModels.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No models match your search criteria
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectorDialog;
