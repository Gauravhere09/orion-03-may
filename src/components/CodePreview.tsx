
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
        
        // Ensure styles don't leak into the main app
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.backgroundColor = 'white';
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
          className="w-full h-full"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin"
          style={{
            border: 'none',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default CodePreview;
