
import { useState } from 'react';
import { Sparkles, Code, MessageSquare, User, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

const Dashboard = () => {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-background to-background -z-10"></div>
        <div className="absolute inset-0 bg-[url('/lovable-uploads/b24c48d9-a185-4882-b651-69c215850cb0.png')] opacity-10 bg-cover bg-center -z-20"></div>
        
        <div className="container mx-auto text-center glass-morphism p-8 rounded-xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gradient-primary">
            Welcome to <span className="text-cyan-400">Orion AI</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
            Create, collaborate, and build amazing AI-powered applications in seconds with your personal AI assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
                  <User className="mr-2 h-4 w-4" /> Sign Up
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md glass-morphism rounded-xl">
                <DialogHeader>
                  <DialogTitle>Sign Up / Login</DialogTitle>
                  <DialogDescription>
                    Join Orion AI to save your creations and collaborate with others
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input type="email" placeholder="Email" className="glass-morphism" />
                  <Input type="password" placeholder="Password" className="glass-morphism" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setLoginOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">Login</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button size="lg" variant="outline" asChild>
              <a href="/chat" className="glass-morphism">
                <Sparkles className="mr-2 h-4 w-4" /> Try Orion AI
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-cyan-900/20">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Orion AI?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-morphism border-cyan-500/20 animate-scale-in">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 mb-4 text-cyan-400" />
                <h3 className="text-xl font-semibold mb-2">Advanced AI</h3>
                <p>Powered by state-of-the-art AI models to deliver intelligent responses and generate high-quality code.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-cyan-500/20 animate-scale-in delay-100">
              <CardContent className="pt-6">
                <Code className="h-12 w-12 mb-4 text-cyan-400" />
                <h3 className="text-xl font-semibold mb-2">Code Generation</h3>
                <p>Generate clean, well-structured code for your web applications with simple natural language prompts.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-cyan-500/20 animate-scale-in delay-200">
              <CardContent className="pt-6">
                <MessageSquare className="h-12 w-12 mb-4 text-cyan-400" />
                <h3 className="text-xl font-semibold mb-2">Chat Memory</h3>
                <p>Orion remembers your conversations, allowing for more contextual and helpful responses over time.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How to Use Orion AI</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-cyan-600 rounded-full h-8 w-8 flex items-center justify-center mr-4">1</div>
                  <h3 className="text-xl font-semibold">Describe What You Need</h3>
                </div>
                <p className="ml-12">Simply tell Orion what you want to create using natural language.</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-cyan-600 rounded-full h-8 w-8 flex items-center justify-center mr-4">2</div>
                  <h3 className="text-xl font-semibold">Review Generated Code</h3>
                </div>
                <p className="ml-12">Orion generates clean, well-structured code based on your description.</p>
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-cyan-600 rounded-full h-8 w-8 flex items-center justify-center mr-4">3</div>
                  <h3 className="text-xl font-semibold">Preview & Refine</h3>
                </div>
                <p className="ml-12">See a live preview of your application and refine it through conversation.</p>
              </div>
            </div>
            
            <div className="glass-morphism p-6 rounded-xl border border-cyan-500/20">
              <div className="bg-card/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-cyan-500 mb-2">User</p>
                <p>Create a responsive navigation bar with a logo, links, and a dark mode toggle</p>
              </div>
              
              <div className="bg-cyan-900/20 rounded-lg p-4">
                <p className="text-sm text-cyan-400 mb-2">Orion AI</p>
                <p>I'll create a responsive navigation bar with all those features. Here's the code...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-cyan-900/20 to-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-morphism animate-fade-in">
              <CardContent className="pt-6">
                <p className="mb-4 italic">"Orion AI revolutionized how I prototype applications. What used to take days now takes hours."</p>
                <p className="font-semibold">- Alex Johnson, Developer</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism animate-fade-in delay-100">
              <CardContent className="pt-6">
                <p className="mb-4 italic">"The code quality is impressive. I've been able to build and deploy features faster than ever before."</p>
                <p className="font-semibold">- Samantha Lee, Product Manager</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism animate-fade-in delay-200">
              <CardContent className="pt-6">
                <p className="mb-4 italic">"As someone learning to code, Orion AI has been an incredible teaching tool. It explains concepts clearly and generates example code."</p>
                <p className="font-semibold">- Michael Chen, Student</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Contact Us</h2>
          
          <Card className="glass-morphism">
            <CardContent className="pt-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name">Name</label>
                  <Input id="name" placeholder="Your Name" className="glass-morphism" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email">Email</label>
                  <Input id="email" type="email" placeholder="your.email@example.com" className="glass-morphism" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="subject">Subject</label>
                  <Input id="subject" placeholder="How can we help you?" className="glass-morphism" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="message">Message</label>
                  <Textarea id="message" placeholder="Your message..." className="glass-morphism min-h-32" />
                </div>
                
                <div className="md:col-span-2">
                  <Button className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700">
                    <Mail className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30 mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img
                  src={"/lovable-uploads/b8b23fd4-5e37-45df-a71f-69c1687f384b.png"}
                  alt="Orion AI"
                  className="h-6 w-auto mr-2"
                />
                <span className="text-lg font-semibold">Orion AI</span>
              </div>
              <p className="text-muted-foreground">Building the future with AI-powered development tools.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <NavigationMenu orientation="vertical">
                <NavigationMenuList className="flex flex-col items-start space-y-2">
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
                      Home
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/chat">
                      AI Chat
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/community">
                      Community
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-muted-foreground mb-2">info@orion-ai.example.com</p>
              <p className="text-muted-foreground">123 AI Street, Tech City</p>
            </div>
          </div>
          
          <div className="border-t border-border/30 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Orion AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
