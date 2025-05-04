
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (open) {
      // Reset form when modal is opened
      setEmail('');
      setPassword('');
      setError(null);
    }
  }, [open]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Account created! Check your email for verification instructions.');
        onOpenChange(false);
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Logged in successfully!');
        onOpenChange(false);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Create Account' : 'Login'}</DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? 'Create an account to save and manage your projects' 
              : 'Login to access your saved projects'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleAuth} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Logging in...'}
                </>
              ) : isSignUp ? 'Create Account' : 'Login'}
            </Button>
          </DialogFooter>
        </form>
        
        <div className="mt-4 text-center text-sm">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(false)}>
                Login
              </Button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(true)}>
                Create Account
              </Button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
