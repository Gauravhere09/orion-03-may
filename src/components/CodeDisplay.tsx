
import React from 'react';
import { GeneratedCode } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CodeDisplayProps {
  code: GeneratedCode;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`${label} copied to clipboard`);
  };
  
  return (
    <Tabs defaultValue="html" className="h-full flex flex-col">
      <TabsList className="grid grid-cols-3 mx-auto">
        <TabsTrigger value="html">HTML</TabsTrigger>
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="js">JavaScript</TabsTrigger>
      </TabsList>
      
      <TabsContent value="html" className="flex-1 overflow-auto p-1">
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => code.html && copyToClipboard(code.html, 'HTML')}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </Button>
        </div>
        <pre className="bg-muted rounded-md p-4 overflow-auto h-[calc(100%-40px)] whitespace-pre-wrap text-sm">
          <code>{code.html || 'No HTML code generated'}</code>
        </pre>
      </TabsContent>
      
      <TabsContent value="css" className="flex-1 overflow-auto p-1">
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => code.css && copyToClipboard(code.css, 'CSS')}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </Button>
        </div>
        <pre className="bg-muted rounded-md p-4 overflow-auto h-[calc(100%-40px)] whitespace-pre-wrap text-sm">
          <code>{code.css || 'No CSS code generated'}</code>
        </pre>
      </TabsContent>
      
      <TabsContent value="js" className="flex-1 overflow-auto p-1">
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => code.js && copyToClipboard(code.js, 'JavaScript')}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </Button>
        </div>
        <pre className="bg-muted rounded-md p-4 overflow-auto h-[calc(100%-40px)] whitespace-pre-wrap text-sm">
          <code>{code.js || 'No JavaScript code generated'}</code>
        </pre>
      </TabsContent>
    </Tabs>
  );
};

export default CodeDisplay;
