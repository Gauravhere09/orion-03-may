
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ChevronDown, LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AuthModal from '@/components/AuthModal';

interface SavedProject {
  id: string;
  project_name: string;
  updated_at: string;
  preview_image?: string;
  chats: any[];
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
    setLogoutConfirmOpen(false);
  };

  const handleProjectClick = (project: SavedProject) => {
    // Store the selected project in localStorage so it can be loaded in the main app
    localStorage.setItem('currentProject', JSON.stringify(project));
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-background">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You need to log in to view your dashboard and saved projects.
        </p>
        <Button onClick={() => setAuthModalOpen(true)}>
          Login / Sign Up
        </Button>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">
              {user.email}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Navigate
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/')}>
                  Chat with AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/explore')}>
                  Explore
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <Button onClick={() => navigate('/')}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-[200px] animate-pulse">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 rounded-full bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You don't have any saved projects yet</p>
            <Button onClick={() => navigate('/')}>
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="overflow-hidden cursor-pointer hover:border-primary transition-all"
                onClick={() => handleProjectClick(project)}
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {project.preview_image ? (
                    <img 
                      src={project.preview_image} 
                      alt={project.project_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Preview
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg truncate">{project.project_name}</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0 border-t text-xs text-muted-foreground">
                  Updated {format(new Date(project.updated_at), 'PPP')}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to log back in to access your saved projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Yes, Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Dashboard;
