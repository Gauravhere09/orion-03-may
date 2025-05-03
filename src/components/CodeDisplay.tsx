
import React, { useState } from 'react';
import { GeneratedCode } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/stores/chatStore';

interface CodeDisplayProps {
  code: GeneratedCode;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  const [editableHtml, setEditableHtml] = useState(code.html || '');
  const [editableCss, setEditableCss] = useState(code.css || '');
  const [editableJs, setEditableJs] = useState(code.js || '');

  const { setGeneratedCode } = useChatStore();
  
  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast(`${label} copied to clipboard`);
  };

  const handleSaveChanges = () => {
    const updatedCode = {
      html: editableHtml,
      css: editableCss,
      js: editableJs,
      preview: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${editableCss || ''}</style>
        </head>
        <body>
          ${editableHtml}
          <script>${editableJs || ''}</script>
        </body>
        </html>
      `
    };
    
    setGeneratedCode(updatedCode);
    toast("Changes saved", {
      description: "Your code changes have been applied to the preview"
    });
  };
  
  return (
    <Tabs defaultValue="html" className="h-full flex flex-col">
      <TabsList className="grid grid-cols-3 mx-auto">
        <TabsTrigger value="html">HTML</TabsTrigger>
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="js">JavaScript</TabsTrigger>
      </TabsList>
      
      <TabsContent value="html" className="flex-1 overflow-auto p-1 flex flex-col">
        <div className="flex justify-end mb-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleSaveChanges}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => copyToClipboard(editableHtml, 'HTML')}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </Button>
        </div>
        <Textarea
          value={editableHtml}
          onChange={(e) => setEditableHtml(e.target.value)}
          className="font-mono text-sm flex-1 h-full bg-muted rounded-md p-4 resize-none focus:outline-none"
          placeholder="No HTML code generated"
          spellCheck={false}
        />
      </TabsContent>
      
      <TabsContent value="css" className="flex-1 overflow-auto p-1 flex flex-col">
        <div className="flex justify-end mb-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleSaveChanges}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => copyToClipboard(editableCss, 'CSS')}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </Button>
        </div>
        <Textarea
          value={editableCss}
          onChange={(e) => setEditableCss(e.target.value)}
          className="font-mono text-sm flex-1 h-full bg-muted rounded-md p-4 resize-none focus:outline-none"
          placeholder="No CSS code generated"
          spellCheck={false}
        />
      </TabsContent>
      
      <TabsContent value="js" className="flex-1 overflow-auto p-1 flex flex-col">
        <div className="flex justify-end mb-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleSaveChanges}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => copyToClipboard(editableJs, 'JavaScript')}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </Button>
        </div>
        <Textarea
          value={editableJs}
          onChange={(e) => setEditableJs(e.target.value)}
          className="font-mono text-sm flex-1 h-full bg-muted rounded-md p-4 resize-none focus:outline-none"
          placeholder="No JavaScript code generated"
          spellCheck={false}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CodeDisplay;
