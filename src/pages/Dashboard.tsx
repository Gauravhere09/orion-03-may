
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProjectsFromSupabase, SavedProject } from '@/services/projectService';
import { useChatStore } from '@/stores/chatStore';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import { Loader2, Plus } from 'lucide-react';

interface DashboardProps {
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const Dashboard = ({ authModalOpen, setAuthModalOpen }: DashboardProps) => {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadChatFromSaved } = useChatStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Load saved projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      if (user) {
        try {
          const projects = await getProjectsFromSupabase();
          setSavedProjects(projects);
        } catch (error) {
          console.error('Error loading projects:', error);
        }
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [user]);

  const handleLoadProject = (project: SavedProject) => {
    // Store the project in localStorage for loading
    localStorage.setItem('currentProject', JSON.stringify(project));
    loadChatFromSaved(project);
    navigate('/');
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      setAuthModalOpen(true);
    }
  }, [user, isLoading, setAuthModalOpen]);

  return (
    <MainLayout
      apiKeyModalOpen={apiKeyModalOpen}
      onApiKeyModalOpenChange={setApiKeyModalOpen}
      isPreviewMode={isPreviewMode}
      onExitPreview={handleExitPreview}
      authModalOpen={authModalOpen}
      setAuthModalOpen={setAuthModalOpen}
    >
      <div className="container py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <Button asChild className="cyan-glow">
            <Link to="/">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : savedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover-scale">
                {project.preview_image ? (
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={project.preview_image}
                      alt={project.project_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-cyan-600/70 dark:text-cyan-400/70">
                      {project.project_name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <CardHeader className="py-4">
                  <CardTitle className="line-clamp-1">{project.project_name}</CardTitle>
                </CardHeader>
                <CardFooter className="flex justify-between pb-4">
                  <Button variant="outline" onClick={() => handleLoadProject(project)}>
                    Open Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/10">
            <h3 className="text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to see it here
            </p>
            <Button asChild className="cyan-glow">
              <Link to="/">
                <Plus className="mr-2 h-4 w-4" /> Create New Project
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-12 pt-6 border-t text-center">
          <h3 className="text-lg font-medium mb-3">Support Us</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            If you find this tool helpful, consider supporting our development efforts
          </p>
          <Button
            variant="outline"
            className="bg-[#ffdd00] text-black hover:bg-[#ffcc00] border-[#ffcc00]"
            onClick={() => window.open('https://www.buymeacoffee.com', '_blank')}
          >
            Buy me a coffee
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
