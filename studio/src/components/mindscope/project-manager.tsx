
// src/components/mindscope/project-manager.tsx
"use client";

import React, { useState } from 'react';
import type { UserProject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProjectManagerProps {
  projects: UserProject[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateNewProject: (projectName: string) => Promise<void>; // Make async to handle potential errors
  onDeleteProject: (projectId: string) => Promise<void>; // Make async
  maxProjects: number;
}

export function ProjectManager({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onDeleteProject,
  maxProjects,
}: ProjectManagerProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
      return;
    }
    if (projects.length >= maxProjects) {
      toast({ title: "Limit Reached", description: `You can only create up to ${maxProjects} projects.`, variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      await onCreateNewProject(newProjectName.trim());
      setNewProjectName('');
      toast({ title: "Project Created", description: `Project "${newProjectName.trim()}" has been created.`});
    } catch (error: any) {
      toast({ title: "Creation Error", description: error.message, variant: "destructive" });
    }
    setIsCreating(false);
  };

  const handleDelete = async (projectId: string, projectName?: string) => {
    try {
      await onDeleteProject(projectId);
      toast({ title: "Project Deleted", description: `Project "${projectName || projectId}" has been deleted.`, variant: "destructive"});
    } catch (error: any)      {
      toast({ title: "Deletion Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Card className="w-full shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
            <FolderOpen className="mr-3 h-7 w-7 text-primary" />
            Manage Your Projects
        </CardTitle>
        <CardDescription>Select an existing project, or create a new one to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="project-select" className="block text-sm font-medium text-foreground">Select Project</label>
            <div className="flex items-center space-x-2">
              <Select onValueChange={onSelectProject} value={activeProjectId || ""}>
                <SelectTrigger id="project-select" className="flex-grow">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeProjectId && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" aria-label="Delete selected project" disabled={projects.length <= 0}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the project
                          "{projects.find(p => p.id === activeProjectId)?.name || activeProjectId}" and all its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(activeProjectId, projects.find(p => p.id === activeProjectId)?.name)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
            <label htmlFor="new-project-name" className="block text-sm font-medium text-foreground">Create New Project</label>
            <div className="flex space-x-2">
            <Input
                id="new-project-name"
                placeholder="Enter new project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                disabled={projects.length >= maxProjects || isCreating}
            />
            <Button 
                onClick={handleCreateProject} 
                disabled={projects.length >= maxProjects || isCreating || !newProjectName.trim()}
                aria-label="Create new project"
            >
                <PlusCircle className="h-4 w-4 mr-2" /> {isCreating ? "Creating..." : "Create"}
            </Button>
            </div>
            {projects.length >= maxProjects && (
            <p className="text-xs text-destructive">Project limit of {maxProjects} reached.</p>
            )}
        </div>
         {projects.length === 0 && !isCreating && (
            <p className="text-sm text-muted-foreground text-center py-2">
                You don't have any projects yet. Create one above to begin!
            </p>
        )}
      </CardContent>
    </Card>
  );
}
