
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Trash2, ArrowUp, ArrowDown, Plus, Key } from 'lucide-react';
import { ApiKey, getAllApiKeys, saveApiKeys, removeApiKey, saveApiKey, reorderApiKeys } from '@/services/storage';

interface ApiKeyManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ open, onOpenChange }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadApiKeys();
      setError(null);
    }
  }, [open]);

  const loadApiKeys = () => {
    const keys = getAllApiKeys();
    setApiKeys(keys);
  };

  const handleAddApiKey = () => {
    setError(null);
    
    if (!newApiKey.trim()) {
      setError("Please enter a valid API key");
      return;
    }
    
    if (newApiKey.trim().length < 10) {
      setError("API key seems too short. Please check and try again.");
      return;
    }
    
    // Check for duplicates
    if (apiKeys.some(k => k.key === newApiKey)) {
      setError("This API key is already in your list");
      return;
    }
    
    // Check for maximum keys
    if (apiKeys.length >= 20) {
      setError("You've reached the maximum limit of 20 API keys. Please remove some keys first.");
      return;
    }
    
    try {
      saveApiKey(newApiKey);
      setNewApiKey('');
      loadApiKeys();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleRemoveApiKey = (key: string) => {
    setError(null);
    
    // Don't allow removing if it would leave no keys
    if (apiKeys.length <= 1) {
      setError("You must have at least one API key");
      return;
    }
    
    // Don't allow removing default keys unless user has added their own keys
    const isDefault = apiKeys.find(k => k.key === key)?.isDefault;
    const userAddedKeys = apiKeys.filter(k => !k.isDefault);
    
    if (isDefault && userAddedKeys.length === 0) {
      setError("Cannot remove default API key without adding your own keys first");
      return;
    }
    
    removeApiKey(key);
    loadApiKeys();
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
            You can add up to 20 API keys.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Your API Keys: {apiKeys.length}/20</h3>
            
            {apiKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground">No API keys found</div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                disabled={apiKeys.length >= 20}
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </div>
            
            <div className="flex items-start space-x-2 text-xs text-muted-foreground mt-1">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <p>
                You can add up to 20 API keys for fallback. Get your API key from{" "}
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
