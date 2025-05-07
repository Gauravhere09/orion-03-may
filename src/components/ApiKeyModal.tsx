
import { FormEvent, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveApiKey } from '@/services/apiKeyService';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySaved?: () => void;
}

const API_SERVICES = [
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'dream_studio', name: 'Dream Studio (Stability AI)' }
];

const ApiKeyModal = ({ open, onOpenChange, onApiKeySaved = () => {} }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [service, setService] = useState('openrouter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (apiKey.trim().length < 10) {
        toast.error("Invalid API key", {
          description: `Please enter a valid ${API_SERVICES.find(s => s.id === service)?.name} API key`
        });
        setIsSubmitting(false);
        return;
      }
      
      // Save API key to Supabase via the apiKeyService
      const success = await saveApiKey(service, apiKey);
      
      if (success) {
        toast.success("API key saved", {
          description: `Your ${API_SERVICES.find(s => s.id === service)?.name} API key has been saved to Supabase`
        });
        
        // Notify parent component
        onApiKeySaved();
        onOpenChange(false);
        setApiKey('');
      } else {
        toast.error("Failed to save API key", {
          description: "There was a problem connecting to Supabase"
        });
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key", {
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
          <DialogTitle>Add API Key</DialogTitle>
          <DialogDescription>
            Enter your API key to use with our AI features. You can add keys for different services.
            Keys are stored securely in Supabase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="service" className="text-left">
              Service
            </Label>
            <Select
              value={service}
              onValueChange={setService}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {API_SERVICES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="apiKey" className="text-left">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={`Enter your ${API_SERVICES.find(s => s.id === service)?.name} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground text-left">
              {service === 'openrouter' && (
                <>Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenRouter Console</a></>
              )}
              {service === 'gemini' && (
                <>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a></>
              )}
              {service === 'dream_studio' && (
                <>Get your API key from <a href="https://stability.ai/platform/account/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">Stability AI Platform</a></>
              )}
            </p>
          </div>
          <DialogFooter>
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
