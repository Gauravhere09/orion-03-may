
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKey, getAllApiKeys, removeApiKey, reorderApiKeys, saveApiKey } from '@/services/storage';
import { CheckCircle2, Copy, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load API keys
  useEffect(() => {
    loadApiKeys();
  }, []);
  
  // Check if user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        // Check if user has admin status in Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // If not an admin, redirect to home
        if (error || !data?.is_admin) {
          toast.error('You do not have permission to access this page');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status', error);
      }
    };
    
    checkAdminStatus();
  }, [user, navigate]);

  const loadApiKeys = () => {
    const keys = getAllApiKeys();
    // Sort keys by priority
    const sortedKeys = [...keys].sort((a, b) => a.priority - b.priority);
    setApiKeys(sortedKeys);
  };

  const handleAddApiKey = () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!newApiKey.startsWith('sk-or-v1-')) {
      toast.error('Invalid OpenRouter API key format');
      return;
    }

    try {
      saveApiKey(newApiKey);
      setNewApiKey('');
      setIsOpen(false);
      loadApiKeys();
      toast.success('API key added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add API key');
    }
  };

  const handleRemoveApiKey = (key: string) => {
    removeApiKey(key);
    loadApiKeys();
    toast.success('API key removed');
  };

  const handleReorderApiKeys = (dragIndex: number, dropIndex: number) => {
    const newKeys = [...apiKeys];
    const draggedItem = newKeys[dragIndex];
    
    // Remove the dragged item
    newKeys.splice(dragIndex, 1);
    
    // Insert it at the new position
    newKeys.splice(dropIndex, 0, draggedItem);
    
    // Update priorities
    reorderApiKeys(newKeys);
    loadApiKeys();
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setIsCopied({ ...isCopied, [key]: true });
    
    setTimeout(() => {
      setIsCopied({ ...isCopied, [key]: false });
    }, 1500);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              Please log in with an administrator account to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to App
        </Button>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>OpenRouter API Keys</CardTitle>
              <CardDescription>
                Manage API keys for OpenRouter. Keys are used in order of priority.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Available Keys</h3>
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" /> Add API Key
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add API Key</DialogTitle>
                        <DialogDescription>
                          Enter your OpenRouter API key below.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="apikey">API Key</Label>
                          <Input
                            id="apikey"
                            placeholder="sk-or-v1-..."
                            value={newApiKey}
                            onChange={(e) => setNewApiKey(e.target.value)}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddApiKey} disabled={isSubmitting}>
                          {isSubmitting ? 'Adding...' : 'Add Key'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {apiKeys.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground">
                      No API keys have been added yet.
                    </div>
                  ) : (
                    apiKeys.map((apiKey, index) => (
                      <div
                        key={apiKey.key}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text', index.toString());
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const dragIndex = parseInt(e.dataTransfer.getData('text'));
                          handleReorderApiKeys(dragIndex, index);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1 font-mono text-sm">
                            {apiKey.key.substring(0, 10)}...{apiKey.key.substring(apiKey.key.length - 5)}
                            {apiKey.isDefault && <span className="ml-2 text-xs">(Default)</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyApiKey(apiKey.key)}
                          >
                            {isCopied[apiKey.key] ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span className="sr-only">Copy</span>
                          </Button>
                          {!apiKey.isDefault && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveApiKey(apiKey.key)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
