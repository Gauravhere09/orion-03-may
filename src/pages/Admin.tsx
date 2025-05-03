
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Save, Trash } from 'lucide-react';
import { ApiKey, getAllApiKeys, saveApiKey, removeApiKey, reorderApiKeys } from '@/services/storage';
import { useUiStore } from '@/stores/uiStore';

// Sample credentials (to be replaced later with Supabase)
const ADMIN_EMAIL = "admin@orion.com";
const ADMIN_PASSWORD = "admin123";

const AdminPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useUiStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  
  useEffect(() => {
    // Load API keys if authenticated
    if (isAuthenticated) {
      const keys = getAllApiKeys();
      setApiKeys(keys || []);
    }
  }, [isAuthenticated]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid email or password');
    }
  };
  
  const handleAddApiKey = () => {
    if (newApiKey.trim() === '') return;
    
    try {
      saveApiKey(newApiKey);
      const updatedKeys = getAllApiKeys();
      setApiKeys(updatedKeys || []);
      setNewApiKey('');
    } catch (error) {
      console.error('Error adding key:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };
  
  const handleRemoveKey = (key: string) => {
    removeApiKey(key);
    const updatedKeys = getAllApiKeys();
    setApiKeys(updatedKeys || []);
  };
  
  const handleReorderApiKeys = (keys: ApiKey[]) => {
    reorderApiKeys(keys);
    setApiKeys(getAllApiKeys() || []);
  };
  
  const moveKeyUp = (index: number) => {
    if (index <= 0) return;
    const newKeys = [...apiKeys];
    [newKeys[index], newKeys[index - 1]] = [newKeys[index - 1], newKeys[index]];
    handleReorderApiKeys(newKeys);
  };
  
  const moveKeyDown = (index: number) => {
    if (index >= apiKeys.length - 1) return;
    const newKeys = [...apiKeys];
    [newKeys[index], newKeys[index + 1]] = [newKeys[index + 1], newKeys[index]];
    handleReorderApiKeys(newKeys);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md glass-morphism">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {loginError && (
                <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-primary/20"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full cyan-glow">Login</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/')} className="border-primary/20">
          Return to App
        </Button>
      </div>
      
      <Card className="mb-6 glass-morphism">
        <CardHeader>
          <CardTitle>Key Management</CardTitle>
          <CardDescription>
            Manage keys for the application. Keys are ordered by priority.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="flex-1 border-primary/20"
              />
              <Button onClick={handleAddApiKey} className="cyan-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Key
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {apiKeys.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                No keys added yet
              </div>
            ) : (
              apiKeys.map((apiKey, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                  <div className="overflow-hidden">
                    <div className="font-mono text-sm truncate">
                      {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 8)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Priority: {apiKey.priority} {apiKey.isDefault ? '(Default)' : ''}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => moveKeyUp(index)} disabled={index === 0}>
                      ↑
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveKeyDown(index)} disabled={index === apiKeys.length - 1}>
                      ↓
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveKey(apiKey.key)} disabled={apiKey.isDefault}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
