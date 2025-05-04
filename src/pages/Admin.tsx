
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is an admin by querying a separate admin table or checking roles
        // For now, we'll use a simple approach - checking if the email contains "admin"
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Since is_admin doesn't exist in the profiles table yet, we'll 
        // simulate the admin check using email for now
        // A proper implementation would check a roles table or a specific admin flag
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-background">
        <h1 className="text-3xl font-bold">Admin Page</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You do not have permission to view this page.
        </p>
        <Button onClick={() => toast.error('Access Denied')}>
          Request Access
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-background">
      <h1 className="text-3xl font-bold">Admin Page</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Welcome, Admin!
      </p>
      {/* Add admin-specific content here */}
    </div>
  );
};

export default AdminPage;
