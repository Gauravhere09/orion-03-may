
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Code, Sun, Moon, Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const Navigation = () => {
  const { isDarkMode, toggleDarkMode } = useUiStore();
  const { handleNewChat } = useChatStore();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r-2 border-border/50">
          <SidebarHeader>
            <div className="flex items-center p-4">
              <img
                src={isDarkMode 
                  ? "/lovable-uploads/b8b23fd4-5e37-45df-a71f-69c1687f384b.png" 
                  : "/lovable-uploads/8f162460-5a85-4a8e-82f5-343312051ee5.png"}
                alt="Orion AI"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold">Orion AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/')}>
                  <Link to="/">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/chat')}>
                  <Link to="/chat">
                    <Code className="h-5 w-5" />
                    <span>AI Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/community')}>
                  <Link to="/community">
                    <Users className="h-5 w-5" />
                    <span>Community</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleDarkMode}
                className="glass-morphism border-2 border-border/50"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex items-center justify-between p-4 h-16 w-full bg-background border-b-2 border-border/30 fixed top-0 left-0 z-10">
          <SidebarTrigger className="border-2 border-border/50 rounded-md h-10 w-10 flex items-center justify-center">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          
          {/* New Chat button in right side of header if on chat page */}
          {location.pathname === '/chat' && (
            <Button
              variant="outline"
              className="ml-auto mr-2 border-2 border-border/50 rounded-full"
              onClick={handleNewChat}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Navigation;
