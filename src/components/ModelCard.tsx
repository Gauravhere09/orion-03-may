
import { AIModel } from '@/data/models';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface ModelCardProps {
  model: AIModel;
  isSelected: boolean;
  onClick: () => void;
}

const ModelCard = ({ model, isSelected, onClick }: ModelCardProps) => {
  return (
    <Card 
      className={cn(
        'w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-0',
        'hover:translate-y-[-5px]',
        isSelected ? 'ring-2 ring-primary' : 'opacity-70'
      )}
      onClick={onClick}
    >
      <div className={cn(
        'h-2 w-full bg-gradient-to-r', 
        model.gradient
      )} />
      <CardContent className="p-4">
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{model.name}</h3>
            <div className="flex items-center space-x-1">
              {model.visionCapable && (
                <span className="text-xs bg-primary/30 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  <span>Vision</span>
                </span>
              )}
              <span className="text-xs bg-secondary rounded-full px-2 py-0.5">{model.version}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{model.provider}</p>
          <div className="mt-2">
            <p className="text-xs line-clamp-2 text-muted-foreground h-8">{model.description}</p>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {model.strengths.slice(0, 3).map((strength, i) => (
              <span 
                key={i}
                className="text-[10px] bg-muted/50 rounded-full px-1.5 py-0.5"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelCard;
