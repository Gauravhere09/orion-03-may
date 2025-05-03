
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Plus, Save, Trash } from 'lucide-react';
import { ApiKey, getAllApiKeys, saveApiKeys, saveApiKey, removeApiKey, reorderApiKeys } from '@/services/storage';

// Hardcoded credentials (would be replaced with Supabase auth later)
const ADMIN_EMAIL = "admin@codechat.ai";
const ADMIN_PASSWORD = "admin123";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    serviceId: '',
    templateId: '',
    userId: ''
  });
  
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
      console.error('Error adding API key:', error);
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
  
  const handleSaveEmailConfig = () => {
    // This would save EmailJS configuration to storage
    // For now, just log it
    console.log('Email config saved:', emailConfig);
    alert('Email configuration saved!');
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {loginError && (
                <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Login</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Return to App
        </Button>
      </div>
      
      <Tabs defaultValue="api-keys">
        <TabsList className="mb-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Management</CardTitle>
              <CardDescription>
                Manage API keys for the application. Keys are ordered by priority.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter new API key"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddApiKey}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                {apiKeys.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    No API keys added yet
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
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure EmailJS for error reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceId">EmailJS Service ID</Label>
                <Input
                  id="serviceId"
                  value={emailConfig.serviceId}
                  onChange={(e) => setEmailConfig({...emailConfig, serviceId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateId">EmailJS Template ID</Label>
                <Input
                  id="templateId"
                  value={emailConfig.templateId}
                  onChange={(e) => setEmailConfig({...emailConfig, templateId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">EmailJS User ID</Label>
                <Input
                  id="userId"
                  value={emailConfig.userId}
                  onChange={(e) => setEmailConfig({...emailConfig, userId: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEmailConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save Email Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
