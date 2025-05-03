
import { useState, useRef, useEffect } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ModelCard from '@/components/ModelCard';
import { AIModel, aiModels } from '@/data/models';
import { Button } from '@/components/ui/button';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

const ModelSelector = ({ selectedModel, onModelSelect }: ModelSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  return (
    <div className="relative py-4 w-full">
      <div className="flex items-center">
        <div className="relative w-full">
          <ScrollArea 
            ref={scrollRef}
            className="w-full"
            onScroll={handleScroll}
          >
            <div className="flex space-x-4 pb-4 px-4">
              {aiModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selectedModel.id === model.id}
                  onClick={() => onModelSelect(model)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>

          <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
            {showLeftButton && (
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-8 w-8 rounded-full p-0 opacity-80"
                onClick={scrollLeft}
              >
                ←
              </Button>
            )}
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
            {showRightButton && (
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-8 w-8 rounded-full p-0 opacity-80"
                onClick={scrollRight}
              >
                →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
