
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ApiKey {
  name: string;
  key: string;
}

const AdminPage = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { name: 'Default API Key', key: 'sk-xxxx-xxxx-xxxx-xxxx' }
  ]);
  
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    key: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewApiKey(prev => ({ ...prev, [name]: value }));
  };
  
  const addApiKey = () => {
    if (!newApiKey.name || !newApiKey.key) {
      toast("Missing API Key details", {
        description: "Please provide both a name and key",
        icon: <AlertTriangle className="h-5 w-5" />
      });
      return;
    }
    
    setApiKeys(prev => [...prev, newApiKey]);
    setNewApiKey({ name: '', key: '' });
    
    toast("API Key added successfully", {
      description: "Your new API key has been added",
      icon: <CheckCircle className="h-5 w-5" />
    });
  };
  
  const deleteApiKey = (index: number) => {
    setApiKeys(prev => prev.filter((_, i) => i !== index));
    
    toast("API Key removed", {
      description: "The API key has been removed",
      icon: <CheckCircle className="h-5 w-5" />
    });
  };
  
  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Keys Management</h1>
        <p className="text-muted-foreground mt-2">
          Add, edit or remove API keys for AI model integration
        </p>
      </div>
      
      <Card className="glass-morphism border-2 border-border/50">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for various AI models
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add new API key section */}
          <div className="grid gap-4 p-4 rounded-lg bg-background/40 border border-border">
            <h3 className="text-lg font-medium">Add New API Key</h3>
            
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr_auto]">
              <div className="grid gap-2">
                <Label htmlFor="name">Key Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="OpenAI Key" 
                  value={newApiKey.name}
                  onChange={handleInputChange}
                  className="border-2 border-border/50"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="key">API Key</Label>
                <Input 
                  id="key" 
                  name="key"
                  placeholder="sk-..." 
                  value={newApiKey.key}
                  onChange={handleInputChange}
                  className="border-2 border-border/50"
                  type="password"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={addApiKey} 
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Key
                </Button>
              </div>
            </div>
          </div>
          
          {/* List of API keys */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your API Keys</h3>
            
            {apiKeys.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-lg border-border">
                <p className="text-muted-foreground">No API keys added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((apiKey, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/40 border border-border">
                    <div>
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {apiKey.key.substring(0, 3)}...{apiKey.key.substring(apiKey.key.length - 4)}
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteApiKey(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-border p-4 bg-background/40">
          <p className="text-xs text-muted-foreground">
            Your API keys are stored securely in your browser's local storage.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminPage;
