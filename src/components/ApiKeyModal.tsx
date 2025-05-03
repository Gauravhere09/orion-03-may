
import { FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveApiKey } from '@/services/storage';
import { toast } from '@/components/ui/sonner';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved: () => void;
}

const ApiKeyModal = ({ open, onOpenChange, onApiKeySaved }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (apiKey.trim().length < 10) {
      toast("Invalid API key", {
        description: "Please enter a valid Groq API key"
      });
      return;
    }
    
    saveApiKey(apiKey);
    onApiKeySaved();
    toast("API key saved", {
      description: "Your Groq API key has been saved to local storage"
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Groq API Key</DialogTitle>
          <DialogDescription>
            Enter your Groq API key to use the AI models. It will be stored only in your browser's local storage.
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
              placeholder="Enter your Groq API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground text-left">
              Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">Groq Console</a>
            </p>
          </div>
          <DialogFooter>
            <Button type="submit">Save API Key</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
