// src/components/mindscope/project-manager.tsx
"use client";

import React from 'react';
import type { UserProject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, FolderOpen, Sparkles } from 'lucide-react';
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
  onDeleteProject: (projectId: string) => Promise<void>; // Make async
  onOpenAISetup: () => void; // New prop to open AI setup modal
  maxProjects: number;
  isNewUser?: boolean; // Optional prop to indicate if user is new
}

export function ProjectManager({
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
  onOpenAISetup,
  maxProjects,
  isNewUser = false,
}: ProjectManagerProps) {
  const { toast } = useToast();

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
        <CardDescription>Select an existing project, or create a new AI-powered project.</CardDescription>
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

        <div className="space-y-4">
          <Button 
            onClick={onOpenAISetup}
            className="w-full flex items-center gap-2"
            size="lg"
            disabled={projects.length >= maxProjects}
          >
            <Sparkles className="h-4 w-4" />
            {projects.length >= maxProjects ? 'Project Limit Reached' : 'Create New AI Project'}
          </Button>
          
          {projects.length >= maxProjects && (
            <p className="text-sm text-destructive text-center py-2">
              {isNewUser 
                ? `New users are limited to ${maxProjects} project. Contact support to upgrade your account for more projects.`
                : `You've reached the maximum of ${maxProjects} projects.`
              }
            </p>
          )}
          
          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              You don't have any projects yet. Create one above to begin!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
