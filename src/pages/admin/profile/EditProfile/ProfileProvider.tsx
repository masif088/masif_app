import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProfileService, ProfileData, ProjectData } from 'utils/supabase/profileService';
import { toast } from 'react-toastify';

interface ProfileContextType {
  profile: ProfileData | null;
  projects: ProjectData[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  createProject: (data: Omit<ProjectData, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateProject: (id: number, data: Partial<ProjectData>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      const profileData = await ProfileService.getCurrentUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshProjects = async () => {
    try {
      const projectsData = await ProfileService.getUserProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const updateProfile = async (data: Partial<ProfileData>) => {
    try {
      setLoading(true);
      const updatedProfile = await ProfileService.updateProfile(data);
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setLoading(true);
      const imageUrl = await ProfileService.uploadProfileImage(file);
      if (imageUrl && profile) {
        setProfile({ ...profile, avatar: imageUrl });
        toast.success('Profile image updated successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: Omit<ProjectData, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const newProject = await ProfileService.createProject(data);
      if (newProject) {
        setProjects(prev => [newProject, ...prev]);
        toast.success('Project created successfully');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      throw error;
    }
  };

  const updateProject = async (id: number, data: Partial<ProjectData>) => {
    try {
      const updatedProject = await ProfileService.updateProject(id, data);
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
        toast.success('Project updated successfully');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await ProfileService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      throw error;
    }
  };

  useEffect(() => {
    refreshProfile();
    refreshProjects();
  }, []);

  const value: ProfileContextType = {
    profile,
    projects,
    loading,
    refreshProfile,
    refreshProjects,
    updateProfile,
    uploadImage,
    createProject,
    updateProject,
    deleteProject,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 