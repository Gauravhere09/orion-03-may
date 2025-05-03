
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { GeneratedCode } from '@/services/api';

interface CodePreviewProps {
  code: GeneratedCode;
  onBack: () => void;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, onBack }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    if (iframeRef.current && code.preview) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(code.preview);
        iframeDoc.close();
      }
    }
  }, [code.preview]);
  
  return (
    <div className="flex flex-col h-screen w-screen fixed inset-0 z-50 bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Code</span>
        </Button>
        <h2 className="text-lg font-medium">Preview</h2>
      </div>
      
      <div className="flex-1 overflow-hidden bg-white">
        <iframe 
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default CodePreview;
