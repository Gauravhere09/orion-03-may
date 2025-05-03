
import { AIModel, aiModels } from '@/data/models';
import ModelCard from '@/components/ModelCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select an AI Model</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {aiModels.map((model) => (
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
