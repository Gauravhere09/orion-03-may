
import { FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveApiKey, hasApiKeys, initializeApiKeys } from '@/services/storage';
import { toast } from '@/components/ui/sonner';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved?: () => void;
}

const ApiKeyModal = ({ open, onOpenChange, onApiKeySaved = () => {} }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (apiKey.trim().length < 10) {
        toast.error("Invalid API key", {
          description: "Please enter a valid OpenRouter API key"
        });
        return;
      }
      
      // Initialize default keys if needed
      if (!hasApiKeys()) {
        initializeApiKeys();
      }
      
      saveApiKey(apiKey);
      onApiKeySaved();
      toast.success("API key saved", {
        description: "Your OpenRouter API key has been added to your API key list"
      });
      onOpenChange(false);
      setApiKey('');
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUseDefaultKeys = () => {
    setIsSubmitting(true);
    try {
      initializeApiKeys();
      onApiKeySaved();
      onOpenChange(false);
      toast.success("Default API keys activated", {
        description: "Using the provided default OpenRouter API keys"
      });
    } catch (error) {
      console.error("Error initializing default keys:", error);
      toast.error("Failed to initialize default keys", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenRouter API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenRouter API key to use the AI models. You can also use our default keys or add multiple keys later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="apiKey" className="text-left">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground text-left">
              Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenRouter Console</a>
            </p>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseDefaultKeys}
              disabled={isSubmitting}
            >
              Use Default Keys
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save API Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
