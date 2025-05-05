
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { saveApiKey } from '@/services/apiKeyService';
import { useForm } from 'react-hook-form';

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedService, setSelectedService] = useState('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // For demo purposes, these are the admin credentials
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is an admin by querying a separate admin table or checking roles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Since is_admin doesn't exist in the profiles table yet, we'll 
        // simulate the admin check using email for now
        const userEmail = data?.email || '';
        const adminCheck = userEmail.includes('admin') || false;
        setIsAdmin(adminCheck);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Simple credential check for demo purposes
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      toast.success('Admin access granted');
    } else {
      toast.error('Invalid admin credentials');
    }
    
    setIsAuthenticating(false);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveApiKey(selectedService, apiKey);
      if (saved) {
        toast.success('API key saved to database');
        setApiKey('');
      } else {
        toast.error('Failed to save API key');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-background">
        <h1 className="text-3xl font-bold">Admin Access</h1>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the admin dashboard.
              <br />
              <span className="text-xs text-primary">(For demo: email: admin@example.com, password: admin123)</span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAdminLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email" 
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  type="password" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Authenticating...' : 'Access Admin Dashboard'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-background">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Welcome, Admin! Here you can manage API keys for the application.
      </p>
      
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>Add or update API keys for various services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Select Service</Label>
              <Select 
                value={selectedService} 
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="dream_studio">Dream Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input 
                type="password" 
                placeholder="Enter API key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {selectedService === 'openrouter' && 'Get your key from OpenRouter Console'}
                {selectedService === 'gemini' && 'Get your key from Google AI Studio'}
                {selectedService === 'dream_studio' && 'Get your key from Stability AI Platform'}
              </p>
            </div>
            
            <Button 
              onClick={handleSaveApiKey} 
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save API Key'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
