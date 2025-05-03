
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { toast } from '@/components/ui/sonner';

const AdminPage = () => {
  const [emailjsStatus, setEmailjsStatus] = useState<'unconfigured' | 'configured' | 'testing'>('unconfigured');
  const [supabaseStatus, setSupabaseStatus] = useState<'unconfigured' | 'configured' | 'testing'>('unconfigured');
  
  const [emailjsData, setEmailjsData] = useState({
    serviceId: '',
    templateId: '',
    publicKey: ''
  });
  
  const [supabaseData, setSupabaseData] = useState({
    url: '',
    anonKey: ''
  });
  
  const handleEmailjsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailjsData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSupabaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupabaseData(prev => ({ ...prev, [name]: value }));
  };
  
  const saveEmailjsConfig = () => {
    if (!emailjsData.serviceId || !emailjsData.templateId || !emailjsData.publicKey) {
      toast("Missing EmailJS details", {
        description: "Please fill in all EmailJS configuration fields",
        icon: <ExclamationTriangleIcon className="h-5 w-5" />
      });
      return;
    }
    
    setEmailjsStatus('testing');
    // Simulate API request
    setTimeout(() => {
      setEmailjsStatus('configured');
      toast("EmailJS configured successfully", {
        description: "Your EmailJS integration is now ready to use",
        icon: <CheckCircledIcon className="h-5 w-5" />
      });
    }, 1500);
  };
  
  const saveSupabaseConfig = () => {
    if (!supabaseData.url || !supabaseData.anonKey) {
      toast("Missing Supabase details", {
        description: "Please fill in all Supabase configuration fields",
        icon: <ExclamationTriangleIcon className="h-5 w-5" />
      });
      return;
    }
    
    setSupabaseStatus('testing');
    // Simulate API request
    setTimeout(() => {
      setSupabaseStatus('configured');
      toast("Supabase configured successfully", {
        description: "Your Supabase integration is now ready to use",
        icon: <CheckCircledIcon className="h-5 w-5" />
      });
    }, 1500);
  };
  
  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your application integrations and settings
        </p>
      </div>
      
      <Tabs defaultValue="emailjs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="emailjs">EmailJS</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
        </TabsList>
        
        <TabsContent value="emailjs" className="space-y-4">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>EmailJS Configuration</CardTitle>
              <CardDescription>
                Connect your EmailJS account to enable contact form functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="serviceId">Service ID</Label>
                  <Input 
                    id="serviceId" 
                    name="serviceId"
                    placeholder="service_xxxxxxxx" 
                    value={emailjsData.serviceId}
                    onChange={handleEmailjsChange}
                    className="glass-morphism"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="templateId">Template ID</Label>
                  <Input 
                    id="templateId" 
                    name="templateId"
                    placeholder="template_xxxxxxxx" 
                    value={emailjsData.templateId}
                    onChange={handleEmailjsChange}
                    className="glass-morphism"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="publicKey">Public Key</Label>
                  <Input 
                    id="publicKey" 
                    name="publicKey"
                    placeholder="XXXXXXXXXXXXXXXXXXXX" 
                    value={emailjsData.publicKey}
                    onChange={handleEmailjsChange}
                    className="glass-morphism"
                  />
                </div>
              </div>
              
              {emailjsStatus === 'configured' && (
                <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircledIcon className="h-4 w-4" />
                  <AlertTitle>Connected</AlertTitle>
                  <AlertDescription>
                    EmailJS is configured and ready to use.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="glass-morphism">Reset</Button>
              <Button 
                onClick={saveEmailjsConfig} 
                disabled={emailjsStatus === 'testing'}
                className={emailjsStatus === 'testing' ? 'opacity-70' : 'bg-cyan-600 hover:bg-cyan-700'}
              >
                {emailjsStatus === 'testing' ? (
                  <>
                    <div className="mr-2 h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                    Testing Connection
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="supabase" className="space-y-4">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>Supabase Integration</CardTitle>
              <CardDescription>
                Connect your Supabase project for backend functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">Project URL</Label>
                  <Input 
                    id="url" 
                    name="url"
                    placeholder="https://xxxxxxxxxx.supabase.co" 
                    value={supabaseData.url}
                    onChange={handleSupabaseChange}
                    className="glass-morphism"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="anonKey">Anon Key</Label>
                  <Input 
                    id="anonKey" 
                    name="anonKey"
                    placeholder="eyJxxxx...xxxxxxx" 
                    value={supabaseData.anonKey}
                    onChange={handleSupabaseChange}
                    className="glass-morphism"
                  />
                </div>
              </div>
              
              {supabaseStatus === 'configured' && (
                <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircledIcon className="h-4 w-4" />
                  <AlertTitle>Connected</AlertTitle>
                  <AlertDescription>
                    Supabase is configured and ready to use.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="glass-morphism">Reset</Button>
              <Button 
                onClick={saveSupabaseConfig} 
                disabled={supabaseStatus === 'testing'}
                className={supabaseStatus === 'testing' ? 'opacity-70' : 'bg-cyan-600 hover:bg-cyan-700'}
              >
                {supabaseStatus === 'testing' ? (
                  <>
                    <div className="mr-2 h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                    Testing Connection
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
