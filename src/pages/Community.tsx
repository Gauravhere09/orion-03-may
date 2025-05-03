
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface App {
  id: string;
  name: string;
  description: string;
  author: string;
  image: string;
  tags: string[];
}

const sampleApps: App[] = [
  {
    id: '1',
    name: 'Weather Dashboard',
    description: 'Real-time weather updates with interactive maps and forecasts',
    author: 'Alex Johnson',
    image: 'https://placehold.co/300x200/0EA5E9/ffffff?text=Weather+App',
    tags: ['React', 'API', 'Dashboard']
  },
  {
    id: '2',
    name: 'Task Manager',
    description: 'Simple and elegant task management with drag-and-drop interface',
    author: 'Samantha Lee',
    image: 'https://placehold.co/300x200/0EA5E9/ffffff?text=Task+Manager',
    tags: ['Productivity', 'React', 'Drag & Drop']
  },
  {
    id: '3',
    name: 'Recipe Finder',
    description: 'Find recipes based on ingredients you have at home',
    author: 'Michael Chen',
    image: 'https://placehold.co/300x200/0EA5E9/ffffff?text=Recipe+Finder',
    tags: ['Food', 'Search', 'Database']
  },
  {
    id: '4',
    name: 'Personal Budget Tracker',
    description: 'Track your expenses and income with visual reports',
    author: 'Emily Wong',
    image: 'https://placehold.co/300x200/0EA5E9/ffffff?text=Budget+App',
    tags: ['Finance', 'Dashboard', 'Charts']
  },
  {
    id: '5',
    name: 'Movie Recommendations',
    description: 'Get personalized movie recommendations based on your tastes',
    author: 'David Smith',
    image: 'https://placehold.co/300x200/0EA5E9/ffffff?text=Movie+App',
    tags: ['Entertainment', 'AI', 'Recommendations']
  },
  {
    id: '6',
    name: 'Fitness Tracker',
    description: 'Track your workouts and monitor your progress',
    author: 'Jessica Brown',
    image: 'https://placehold.co/300x200/0EA5E9/ffffff?text=Fitness+App',
    tags: ['Health', 'Tracking', 'Charts']
  }
];

const Community = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filteredApps = sampleApps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAppClick = (app: App) => {
    setSelectedApp(app);
    setPreviewOpen(true);
  };

  return (
    <div className="pt-16">
      <div className="container mx-auto p-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Community Projects</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore projects created by the Orion AI community. Get inspired and see what others are building!
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
            <Input 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-morphism"
            />
            <Button variant="outline" className="glass-morphism">
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <Card 
                    key={app.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 glass-morphism cursor-pointer"
                    onClick={() => handleAppClick(app)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={app.image} 
                        alt={app.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        by {app.author}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm">{app.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                      {app.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 rounded-full bg-cyan-900/20 text-cyan-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="popular">
            <div className="text-center py-12">
              <p className="text-muted-foreground">This section will display the most popular projects.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="text-center py-12">
              <p className="text-muted-foreground">This section will display recently added projects.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* App Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl glass-morphism">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApp.name}</DialogTitle>
                <DialogDescription>Created by {selectedApp.author}</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img 
                    src={selectedApp.image} 
                    alt={selectedApp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">About this project</h3>
                  <p>{selectedApp.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedApp.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-cyan-900/20 text-cyan-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    View Live Demo
                  </Button>
                  <Button variant="outline" className="glass-morphism">
                    Clone Project
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
