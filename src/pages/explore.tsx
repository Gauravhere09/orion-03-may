
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from '@/layouts/MainLayout';

interface ExplorePageProps {
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const ExplorePage = ({ authModalOpen, setAuthModalOpen }: ExplorePageProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const handleTryNow = () => {
    navigate('/');
  };
  
  const handleImageGenerator = () => {
    navigate('/image-generator');
  };
  
  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  return (
    <MainLayout
      apiKeyModalOpen={apiKeyModalOpen}
      onApiKeyModalOpenChange={setApiKeyModalOpen}
      isPreviewMode={isPreviewMode}
      onExitPreview={handleExitPreview}
      authModalOpen={authModalOpen}
      setAuthModalOpen={setAuthModalOpen}
    >
      <div className="container max-w-6xl py-12">
        {/* Hero section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create with <span className="text-cyan-500">AI</span> Assistance
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build websites, apps, and digital experiences with our AI-powered tools
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={handleTryNow}
              className="cyan-glow px-8 py-6"
              size="lg"
            >
              Start Creating
            </Button>
          </div>
        </section>
        
        {/* Features section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Powerful AI Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>AI Code Generator</CardTitle>
                <CardDescription>Generate code snippets and components</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Describe what you want to build, and our AI will generate the code for you. 
                  Perfect for creating React components, animations, and more.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={handleTryNow} className="w-full">Try Now</Button>
              </CardFooter>
            </Card>
            
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>Image Generator</CardTitle>
                <CardDescription>Create stunning AI-generated images</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Turn your ideas into beautiful images with our AI image generator.
                  Perfect for creating illustrations, mockups, and visual content.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={handleImageGenerator} className="w-full">Generate Images</Button>
              </CardFooter>
            </Card>
            
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>Save & Organize</CardTitle>
                <CardDescription>Keep track of your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Save your projects and access them anytime. 
                  Organize your work and continue where you left off.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => user ? navigate('/dashboard') : setAuthModalOpen(true)} 
                  className="w-full"
                >
                  {user ? 'View Dashboard' : 'Sign In'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        {/* Orion logo section */}
        <section className="py-12 text-center">
          <div className="max-w-md mx-auto">
            <img 
              src="/lovable-uploads/b8b23fd4-5e37-45df-a71f-69c1687f384b.png" 
              alt="Orion AI" 
              className="h-16 mx-auto mb-6"
              loading="eager"
              fetchPriority="high"
            />
            <h2 className="text-2xl font-bold mb-4">Orion AI</h2>
            <p className="text-muted-foreground mb-6">
              Empowering creators with next-generation AI tools
            </p>
          </div>
        </section>

        {/* Support us section */}
        <section className="mt-12 pt-6 border-t text-center">
          <h3 className="text-lg font-medium mb-3">Support Us</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            If you find Orion AI helpful, consider supporting our development efforts
          </p>
          <Button
            variant="outline"
            className="bg-[#ffdd00] text-black hover:bg-[#ffcc00] border-[#ffcc00]"
            onClick={() => window.open('https://www.buymeacoffee.com', '_blank')}
          >
            Buy me a coffee
          </Button>
        </section>
      </div>
    </MainLayout>
  );
};

export default ExplorePage;
