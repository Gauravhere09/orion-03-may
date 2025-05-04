import React, { useState, useEffect } from 'react';
import { GeneratedCode } from '@/services/apiTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Save, Edit, Check, Phone } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import Editor from '@monaco-editor/react';
import { useChatStore } from '@/stores/chatStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUiStore } from '@/stores/uiStore';

interface CodeDisplayProps {
  code: GeneratedCode;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  const [editableHtml, setEditableHtml] = useState(code.html || '');
  const [editableCss, setEditableCss] = useState(code.css || '');
  const [editableJs, setEditableJs] = useState(code.js || '');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('html');
  const [editorHeight, setEditorHeight] = useState('500px');

  const { setGeneratedCode } = useChatStore();
  const isMobile = useIsMobile();
  
  // Auto-adjust editor height based on available space
  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.innerHeight;
      const desiredHeight = Math.max(viewportHeight * 0.6, 300); // 60% of viewport, min 300px
      setEditorHeight(`${desiredHeight}px`);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update editable content when code prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditableHtml(code.html || '');
      setEditableCss(code.css || '');
      setEditableJs(code.js || '');
    }
  }, [code, isEditing]);
  
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
    
    if (isEditing) {
      setIsEditing(false);
    }
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      toast("Edit mode enabled", {
        description: "You can now edit the code"
      });
    }
  };

  // Mobile edit button for quick access
  const MobileEditButton = () => (
    <Button
      variant="default"
      size="sm"
      className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg flex items-center gap-1 bg-primary"
      onClick={toggleEditMode}
    >
      <Edit className="h-4 w-4" />
      <Phone className="h-4 w-4" />
      <span>{isEditing ? "Done" : "Edit"}</span>
    </Button>
  );
  
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      <div className="flex justify-between items-center px-2">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
        </TabsList>
        
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 h-8"
            onClick={toggleEditMode}
          >
            {isEditing ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <TabsContent value="html" className="flex-1 overflow-auto p-1 flex flex-col">
        <div className="flex justify-end mb-2 gap-2">
          {isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleSaveChanges}
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-8 h-8 p-0"
            onClick={() => copyToClipboard(editableHtml, 'HTML')}
            title="Copy HTML"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex-1 border rounded-md overflow-hidden">
          <Editor
            height={editorHeight}
            language="html"
            value={editableHtml}
            theme={useUiStore().isDarkMode ? "vs-dark" : "light"}
            options={{
              readOnly: !isEditing,
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            onChange={(value) => setEditableHtml(value || '')}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="css" className="flex-1 overflow-auto p-1 flex flex-col">
        <div className="flex justify-end mb-2 gap-2">
          {isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleSaveChanges}
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-8 h-8 p-0"
            onClick={() => copyToClipboard(editableCss, 'CSS')}
            title="Copy CSS"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex-1 border rounded-md overflow-hidden">
          <Editor
            height={editorHeight}
            language="css"
            value={editableCss}
            theme={useUiStore().isDarkMode ? "vs-dark" : "light"}
            options={{
              readOnly: !isEditing,
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            onChange={(value) => setEditableCss(value || '')}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="js" className="flex-1 overflow-auto p-1 flex flex-col">
        <div className="flex justify-end mb-2 gap-2">
          {isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleSaveChanges}
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="w-8 h-8 p-0" 
            onClick={() => copyToClipboard(editableJs, 'JavaScript')}
            title="Copy JavaScript"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex-1 border rounded-md overflow-hidden">
          <Editor
            height={editorHeight}
            language="javascript"
            value={editableJs}
            theme={useUiStore().isDarkMode ? "vs-dark" : "light"}
            options={{
              readOnly: !isEditing,
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            onChange={(value) => setEditableJs(value || '')}
          />
        </div>
      </TabsContent>
      
      {/* Mobile edit button */}
      {isMobile && <MobileEditButton />}
    </Tabs>
  );
};

export default CodeDisplay;
