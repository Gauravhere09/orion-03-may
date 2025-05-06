
import { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface ImageGenerationLoadingProps {
  className?: string;
}

const ImageGenerationLoading = ({ className }: ImageGenerationLoadingProps) => {
  // Generate layers for the loading animation
  const layers = Array(5).fill(0);
  
  return (
    <div className={cn(
      "flex items-center justify-center w-full h-full min-h-[300px] relative", 
      className
    )}>
      <div className="relative w-48 h-48">
        {layers.map((_, index) => (
          <div 
            key={index} 
            className="absolute inset-0 border-4 border-dashed rounded-full animate-spin" 
            style={{
              borderColor: `hsla(${200 + index * 30}, 70%, 60%, 0.${7 - index})`,
              animationDuration: `${10 - index}s`,
              animationDirection: index % 2 === 0 ? 'normal' : 'reverse',
              width: `${100 - index * 5}%`,
              height: `${100 - index * 5}%`,
              top: `${index * 2.5}%`,
              left: `${index * 2.5}%`
            } as CSSProperties}
          />
        ))}
        
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="text-lg font-medium mb-2">Generating your image...</p>
            <p className="text-sm text-muted-foreground">
              Creating something amazing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationLoading;
