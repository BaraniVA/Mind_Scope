// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Project, Phase, Microtask, UserProject } from '@/lib/types';
import { AppHeader } from '@/components/mindscope/app-header';
import { ProjectSetup } from '@/components/mindscope/project-setup';
import { TaskList } from '@/components/mindscope/task-list';
import { OverallProgress } from '@/components/mindscope/overall-progress';
import { ProjectManager } from '@/components/mindscope/project-manager';
import { useToast } from "@/hooks/use-toast";
import { suggestTasks as suggestTasksAction } from '@/ai/flows/suggest-tasks';
import { parseAISuggestions } from '@/lib/ai-parser';
import { useAuth } from '@/contexts/auth-user-context';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase/config';
import { ref, set, onValue, remove, serverTimestamp, off, push, update } from 'firebase/database';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const MAX_PROJECTS = 5;
const DEFAULT_PROJECT: Project = {
  title: '',
  description: '',
  phases: [],
  team: [],
  lastModified: null,
};

export default function MindScopePage() {
  const { authUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentProjectData, setCurrentProjectData] = useState<Project | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [localCurrentUserIdentifier, setLocalCurrentUserIdentifier] = useState<string>('');
  const [isWritingToDb, setIsWritingToDb] = useState(false);


  // Effect for auth state and initial data load
  useEffect(() => {
    if (!authIsLoading) {
      if (!authUser) {
        router.push('/login');
      } else {
        setLocalCurrentUserIdentifier(authUser.displayName || authUser.email || authUser.uid);
        const projectsRef = ref(database, `users/${authUser.uid}/projects`);
        onValue(projectsRef, (snapshot) => {
          const projectsData = snapshot.val();
          if (projectsData) {
            const loadedProjects: UserProject[] = Object.entries(projectsData).map(([id, data]: [string, any]) => ({
              id,
              name: data.title || 'Untitled Project',
              lastModified: data.lastModified || 0,
            })).sort((a,b) => (b.lastModified || 0) - (a.lastModified || 0)); // Sort by lastModified desc
            setUserProjects(loadedProjects);
            
            if (loadedProjects.length > 0 && !activeProjectId) {
               // If no active project ID set, or if the current active one is no longer valid, set to the most recent.
               if (!activeProjectId || !loadedProjects.find(p => p.id === activeProjectId)) {
                 setActiveProjectId(loadedProjects[0].id);
               }
            } else if (loadedProjects.length === 0) {
                setActiveProjectId(null);
                setCurrentProjectData(null); // No projects, so no active data
            }
          } else {
            setUserProjects([]);
            setActiveProjectId(null);
            setCurrentProjectData(null);
          }
          setIsDataLoading(false);
        }, (error) => {
          console.error("Error loading user projects:", error);
          toast({ title: "Error", description: "Could not load user projects.", variant: "destructive"});
          setIsDataLoading(false);
        });
        return () => off(projectsRef);
      }
    }
  }, [authUser, authIsLoading, router, activeProjectId, toast]);


  // Effect for loading active project data
  useEffect(() => {
    if (authUser && activeProjectId) {
      setIsDataLoading(true);
      const projectDataRef = ref(database, `users/${authUser.uid}/projects/${activeProjectId}`);
      
      const unsubscribe = onValue(projectDataRef, (snapshot) => {
        // Skip updates if we're currently writing to the database
        // This prevents the listener from overwriting our optimistic updates
        if (isWritingToDb) {
          setIsDataLoading(false);
          return;
        }
        
        const data = snapshot.val();
        if (data) {
          setCurrentProjectData({ ...DEFAULT_PROJECT, ...data });
        } else {
          setCurrentProjectData(null);
        }
        setIsDataLoading(false);
      }, (error) => {
        console.error("Error loading project data:", error);
        toast({ title: "Error", description: "Could not load project data.", variant: "destructive"});
        setIsDataLoading(false);
      });
      
      return () => unsubscribe();
    } else if (!activeProjectId) {
      setCurrentProjectData(null);
      setIsDataLoading(false);
    }
  }, [authUser, activeProjectId, toast, isWritingToDb]); // Add isWritingToDb to dependencies

  // Debounced save effect for currentProjectData
  useEffect(() => {
    if (authUser && activeProjectId && currentProjectData && !isDataLoading) { 
      const debounceTimeout = setTimeout(() => {
        const projectRef = ref(database, `users/${authUser.uid}/projects/${activeProjectId}`);
        const projectDataWithTimestamp = {
          ...currentProjectData,
          lastModified: serverTimestamp(),
        };
        
        // Set the write lock before saving
        setIsWritingToDb(true);
        
        set(projectRef, projectDataWithTimestamp)
          .catch(error => {
            console.error("Failed to save project:", error);
            toast({ title: "Save Error", description: "Could not save project changes.", variant: "destructive" });
          })
          .finally(() => {
            // Release the write lock after a short delay to ensure the
            // onValue listener doesn't pick up the change too quickly
            setTimeout(() => {
              setIsWritingToDb(false);
            }, 1000); // Increase from 500ms to 1000ms
          });
      }, 1000); 

      return () => clearTimeout(debounceTimeout);
    }
  }, [currentProjectData, authUser, activeProjectId, toast, isDataLoading]);


  const generateId = () => push(ref(database, `users/${authUser?.uid}/temp`)).key || crypto.randomUUID();


  const handleCreateNewProject = async (projectName: string) => {
    if (!authUser) return;
    if (userProjects.length >= MAX_PROJECTS) {
      toast({ title: "Limit Reached", description: `Cannot create more than ${MAX_PROJECTS} projects.`, variant: "destructive" });
      throw new Error("Project limit reached");
    }
    
    setIsWritingToDb(true); // Add this line
    try {
      const newProjectRef = push(ref(database, `users/${authUser.uid}/projects`));
      const newProjectId = newProjectRef.key;
      if (!newProjectId) {
          toast({ title: "Error", description: "Failed to generate project ID.", variant: "destructive"});
          throw new Error("Failed to generate project ID");
      }

      const newProject: Project = {
        ...DEFAULT_PROJECT,
        title: projectName,
        lastModified: serverTimestamp() as any, 
      };
      await set(newProjectRef, newProject);
      setActiveProjectId(newProjectId);
    } finally {
      // Small delay to ensure database operations complete
      setTimeout(() => setIsWritingToDb(false), 500);
    }
  };

  const handleDeleteProject = async (projectIdToDelete: string) => {
    if (!authUser || !projectIdToDelete) return;
    const projectRef = ref(database, `users/${authUser.uid}/projects/${projectIdToDelete}`);
    await remove(projectRef);
    if (activeProjectId === projectIdToDelete) {
        setActiveProjectId(null); 
        setCurrentProjectData(null); 
    }
  };


  const handleProjectTitleDescriptionChange = (title: string, description: string) => {
    setCurrentProjectData(prev => prev ? { ...prev, title, description } : null);
  };

  const handleAISuggestions = useCallback((rawSuggestions: string[]) => {
    if (!currentProjectData) {
        toast({ title: "No Active Project", description: "Please select or create a project first.", variant: "destructive"});
        return;
    }
    const lines: string[] = Array.isArray(rawSuggestions)
      ? rawSuggestions.flatMap(s => (typeof s === 'string' ? s.split(/\r\n|\r|\n/) : []))
      : [];
    
    const parsedPhases = parseAISuggestions(lines);
     if (parsedPhases.length === 0) {
       toast({
        title: "No Suggestions Parsed",
        description: "The AI did not provide suggestions that could be structured, or the format was unrecognized.",
        variant: "default",
      });
      return;
    }

    setCurrentProjectData(prev => {
      if (!prev) return null;
      const newPhases: Phase[] = parsedPhases.map(pp => ({
        id: generateId(),
        name: pp.name,
        microtasks: pp.microtasks.map(pm => ({
          id: generateId(),
          name: pm.name,
          estimatedTime: 0,
          isCompleted: false,
        })),
      }));
      return { ...prev, phases: newPhases };
    });

    toast({
      title: "AI Suggestions Applied",
      description: `${parsedPhases.length} phase(s) with ${parsedPhases.reduce((acc, curr) => acc + curr.microtasks.length, 0)} microtask(s) have been added.`,
    });
  }, [currentProjectData, toast]);


  const handleAddPhase = (phaseName: string) => {
    if (!currentProjectData) return;
    const newPhase: Phase = { id: generateId(), name: phaseName, microtasks: [] };
    setCurrentProjectData(prev => prev ? { ...prev, phases: [...prev.phases, newPhase] } : null);
    toast({ title: "Phase Added", description: `Phase "${phaseName}" created.`});
  };

  const handleUpdatePhase = (updatedPhase: Phase) => {
    setCurrentProjectData(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p => p.id === updatedPhase.id ? updatedPhase : p),
    } : null);
  };

  const handleDeletePhase = (phaseId: string) => {
    setCurrentProjectData(prev => prev ? {
      ...prev,
      phases: prev.phases.filter(p => p.id !== phaseId),
    } : null);
    toast({ title: "Phase Deleted", variant: "destructive"});
  };

  const handleAddMicrotask = (phaseId: string, microtaskName: string) => {
    if (!currentProjectData) return;
    const newMicrotask: Microtask = { id: generateId(), name: microtaskName, estimatedTime: 0, isCompleted: false};
    setCurrentProjectData(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId ? { ...p, microtasks: [...p.microtasks, newMicrotask] } : p
      ),
    } : null);
    toast({ title: "Microtask Added", description: `Microtask "${microtaskName}" created.`});
  };

  const handleUpdateMicrotask = (phaseId: string, updatedMicrotask: Microtask) => {
    console.log("Updating microtask:", updatedMicrotask.id, "Time:", updatedMicrotask.estimatedTime);
    
    setCurrentProjectData(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId
          ? { ...p, microtasks: p.microtasks.map(mt => mt.id === updatedMicrotask.id ? updatedMicrotask : mt) }
          : p
      ),
    } : null);
  };

  const handleDeleteMicrotask = (phaseId: string, microtaskId: string) => {
    setCurrentProjectData(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId
          ? { ...p, microtasks: p.microtasks.filter(mt => mt.id !== microtaskId) }
          : p
      ),
    } : null);
    toast({ title: "Microtask Deleted", variant: "destructive"});
  };
  
  const handleUpdateTeam = (team: string[]) => {
    setCurrentProjectData(prev => {
        if (!prev) return null;
        const newProjectData = { ...prev, team };
        if (localCurrentUserIdentifier && !team.includes(localCurrentUserIdentifier) && prev.team.includes(localCurrentUserIdentifier)) {
            // Potentially handle if current user removed themselves from team
        }
        return newProjectData;
    });
  };


  if (authIsLoading || (authUser && isDataLoading && !currentProjectData && activeProjectId)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground mt-4">Loading MindScope...</p>
      </div>
    );
  }
  
  if (!authUser) return null; 

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <AppHeader />
        
        <ProjectManager
            projects={userProjects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onCreateNewProject={handleCreateNewProject}
            onDeleteProject={handleDeleteProject}
            maxProjects={MAX_PROJECTS}
        />

        {activeProjectId && currentProjectData ? (
          <>
            <ProjectSetup 
              project={currentProjectData} 
              onProjectChange={handleProjectTitleDescriptionChange}
              onAISuggestions={handleAISuggestions}
              suggestTasksAction={suggestTasksAction}
            />
          

            {currentProjectData.phases.length > 0 && <OverallProgress project={currentProjectData} />}
            
            <TaskList
              project={currentProjectData}
              onAddPhase={handleAddPhase}
              onUpdatePhase={handleUpdatePhase}
              onDeletePhase={handleDeletePhase}
              onAddMicrotask={handleAddMicrotask}
              onUpdateMicrotask={handleUpdateMicrotask}
              onDeleteMicrotask={handleDeleteMicrotask}
            />
          </>
        ) : userProjects.length > 0 && !activeProjectId ? (
            <Card className="text-center">
                <CardHeader><CardTitle>Select a Project</CardTitle></CardHeader>
                <CardContent><p>Please select a project from the manager above to start working.</p></CardContent>
            </Card>
        ) : userProjects.length === 0 && !activeProjectId && !isDataLoading ? (
             <Card className="text-center">
                <CardHeader><CardTitle>Welcome to MindScope!</CardTitle></CardHeader>
                <CardContent><p>Create your first project using the project manager above.</p></CardContent>
            </Card>
        ) : null 
        }

      </div>
    </div>
  );
}

