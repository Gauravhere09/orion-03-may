
import { supabase } from "@/integrations/supabase/client";
import { Message } from './apiTypes';

export interface SavedProject {
  id: string;
  project_name: string;
  chats: Message[];
  preview_image?: string;
}

// Save a project to Supabase
export const saveProjectToSupabase = async (
  projectId: string,
  projectName: string,
  chats: Message[],
  previewImage?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_projects')
      .upsert(
        { 
          id: projectId,
          project_name: projectName || 'Untitled Project', 
          chats: JSON.stringify(chats),
          preview_image: previewImage
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error saving project to Supabase:', error);
      return false;
    }
    
    console.log('Project saved to Supabase');
    return true;
  } catch (e) {
    console.error('Failed to save project to Supabase:', e);
    return false;
  }
};

// Get all saved projects from Supabase
export const getProjectsFromSupabase = async (): Promise<SavedProject[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_projects')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching projects from Supabase:', error);
      return [];
    }
    
    return data?.map(project => ({
      id: project.id,
      project_name: project.project_name,
      chats: project.chats,
      preview_image: project.preview_image
    })) || [];
  } catch (e) {
    console.error('Failed to get projects from Supabase:', e);
    return [];
  }
};

// Delete a project from Supabase
export const deleteProjectFromSupabase = async (projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
    }
    
    console.log('Project deleted from Supabase');
    return true;
  } catch (e) {
    console.error('Failed to delete project from Supabase:', e);
    return false;
  }
};

// Auto-save the current chat as a project
export const autoSaveCurrentChat = async (
  projectId: string, 
  chats: Message[]
): Promise<void> => {
  try {
    // Check if this project already exists
    const { data } = await supabase
      .from('saved_projects')
      .select('project_name, preview_image')
      .eq('id', projectId)
      .single();
    
    if (data) {
      // If it exists, update just the chats
      await supabase
        .from('saved_projects')
        .update({ 
          chats: JSON.stringify(chats),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
    }
    
    // If it doesn't exist, we don't auto-create it (that should be done by explicit save)
  } catch (e) {
    console.error('Failed to auto-save chat:', e);
  }
};
