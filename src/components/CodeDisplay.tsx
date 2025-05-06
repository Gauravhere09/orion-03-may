
import React, { useState, useEffect } from 'react';
import { GeneratedCode } from '@/services/apiTypes';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Check, Phone, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';
import { useChatStore } from '@/stores/chatStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUiStore } from '@/stores/uiStore';
import { useNavigate } from 'react-router-dom';

interface CodeDisplayProps {
  code: GeneratedCode;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  const [editableHtml, setEditableHtml] = useState(code.html || '');
  const [isEditing, setIsEditing] = useState(false);

  const { setGeneratedCode } = useChatStore();
  const { isDarkMode, setIsPreviewMode } = useUiStore();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Update editable content when code prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditableHtml(code.html || '');
    }
  }, [code, isEditing]);
  
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast(`HTML copied to clipboard`);
  };

  const handleSaveChanges = () => {
    const updatedCode = {
      html: editableHtml,
      css: code.css || '',
      js: code.js || '',
      preview: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${code.css || ''}</style>
        </head>
        <body>
          ${editableHtml}
          <script>${code.js || ''}</script>
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

  const viewPreview = () => {
    setIsPreviewMode(true);
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h2 className="text-sm font-medium">HTML Code</h2>
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
          <Button 
            variant="outline" 
            size="sm" 
            className="w-8 h-8 p-0"
            onClick={() => copyToClipboard(editableHtml)}
            title="Copy HTML"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-2 flex flex-col">
        {isEditing && (
          <div className="mb-2 flex justify-end">
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </div>
        )}
        
        <div className="flex-1 border rounded-md overflow-hidden h-full">
          <Editor
            height="100%"
            language="html"
            value={editableHtml}
            theme={isDarkMode ? "vs-dark" : "light"}
            options={{
              readOnly: !isEditing,
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
              }
            }}
            onChange={(value) => setEditableHtml(value || '')}
          />
        </div>
      </div>
      
      {/* Preview button at bottom */}
      <div className="p-2 border-t flex justify-center">
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={viewPreview}
        >
          <Eye className="h-4 w-4" />
          View Preview
        </Button>
      </div>
      
      {/* Mobile edit button */}
      {isMobile && <MobileEditButton />}
    </div>
  );
};

export default CodeDisplay;
