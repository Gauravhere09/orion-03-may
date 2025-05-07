
import React from 'react';

interface ImageGenerationLoadingProps {
  visible: boolean;
}

const ImageGenerationLoading: React.FC<ImageGenerationLoadingProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden loading-bar">
      {/* The animation is now handled via the loading-bar class and its ::after pseudo-element */}
      <div className="z-10 flex flex-col items-center">
        <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Generating image...
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          This might take a moment
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationLoading;
