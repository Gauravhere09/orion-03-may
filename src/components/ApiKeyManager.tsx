
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { ApiKey, getAllApiKeys, saveApiKeys, removeApiKey, saveApiKey, reorderApiKeys } from '@/services/storage';
import { AlertCircle, Trash2, ArrowUp, ArrowDown, Plus, Key } from 'lucide-react';

interface ApiKeyManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ open, onOpenChange }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    if (open) {
      loadApiKeys();
    }
  }, [open]);

  const loadApiKeys = () => {
    const keys = getAllApiKeys();
    setApiKeys(keys);
  };

  const handleAddApiKey = () => {
    if (!newApiKey.trim()) {
      toast("Error", {
        description: "Please enter a valid API key"
      });
      return;
    }
    
    if (newApiKey.trim().length < 10) {
      toast("Error", {
        description: "API key seems too short. Please check and try again."
      });
      return;
    }
    
    // Check for duplicates
    if (apiKeys.some(k => k.key === newApiKey)) {
      toast("Error", {
        description: "This API key is already in your list"
      });
      return;
    }
    
    saveApiKey(newApiKey);
    setNewApiKey('');
    loadApiKeys();
    
    toast("API key added", {
      description: "Your OpenRouter API key has been added successfully"
    });
  };

  const handleRemoveApiKey = (key: string) => {
    // Don't allow removing if it would leave no keys
    if (apiKeys.length <= 1) {
      toast("Error", {
        description: "You must have at least one API key"
      });
      return;
    }
    
    // Don't allow removing default keys unless user has added their own keys
    const isDefault = apiKeys.find(k => k.key === key)?.isDefault;
    const userAddedKeys = apiKeys.filter(k => !k.isDefault);
    
    if (isDefault && userAddedKeys.length === 0) {
      toast("Error", {
        description: "Cannot remove default API key without adding your own keys first"
      });
      return;
    }
    
    removeApiKey(key);
    loadApiKeys();
    
    toast("API key removed", {
      description: "The API key has been removed from your list"
    });
  };

  const moveApiKeyPriority = (key: ApiKey, direction: 'up' | 'down') => {
    const index = apiKeys.findIndex(k => k.key === key.key);
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === apiKeys.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newKeys = [...apiKeys];
    [newKeys[index], newKeys[newIndex]] = [newKeys[newIndex], newKeys[index]];
    
    setApiKeys(newKeys);
    reorderApiKeys(newKeys);
    
    toast("Priority updated", {
      description: `API key priority ${direction === 'up' ? 'increased' : 'decreased'}`
    });
  };
  
  const maskApiKey = (key: string): string => {
    if (key.length <= 10) return '****';
    return `${key.substring(0, 5)}...${key.substring(key.length - 5)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Key Manager</DialogTitle>
          <DialogDescription>
            Manage your OpenRouter API keys. Keys are tried in order from top to bottom.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Your API Keys:</h3>
            
            {apiKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground">No API keys found</div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((apiKey, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">
                        {index + 1}
                      </span>
                      <div className="flex flex-col">
                        <code className="text-xs">{maskApiKey(apiKey.key)}</code>
                        {apiKey.isDefault && (
                          <span className="text-[10px] text-muted-foreground">Default key</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveApiKeyPriority(apiKey, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveApiKeyPriority(apiKey, 'down')}
                        disabled={index === apiKeys.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleRemoveApiKey(apiKey.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">Add a new API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="OpenRouter API Key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
              />
              <Button 
                onClick={handleAddApiKey}
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </div>
            
            <div className="flex items-start space-x-2 text-xs text-muted-foreground mt-1">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <p>
                You can add up to 5 API keys for fallback. Get your API key from{" "}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenRouter Console
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyManager;
