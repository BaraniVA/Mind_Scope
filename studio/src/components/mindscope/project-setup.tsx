"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2 } from 'lucide-react';
import type { suggestTasks, SuggestTasksOutput } from '@/ai/flows/suggest-tasks';
import type { Project } from '@/lib/types';

interface ProjectSetupProps {
  project: Project;
  onProjectChange: (title: string, description: string) => void;
  onAISuggestions: (suggestions: string[]) => void;
  suggestTasksAction: typeof suggestTasks; 
}

export function ProjectSetup({ project, onProjectChange, onAISuggestions, suggestTasksAction }: ProjectSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState(project.title);
  const [currentDescription, setCurrentDescription] = useState(project.description);
  
  // Keep track of last valid description to prevent loss
  const lastValidDescriptionRef = useRef(project.description);
  
  // Update local state only when project props actually change (not during typing)
  useEffect(() => {
    if (project.title !== currentTitle && document.activeElement?.id !== 'title') {
      setCurrentTitle(project.title);
    }
    
    // Only update description if it's not empty and different from current
    if (project.description !== currentDescription && document.activeElement?.id !== 'description') {
      if (project.description) {
        setCurrentDescription(project.description);
        lastValidDescriptionRef.current = project.description;
      } else if (lastValidDescriptionRef.current) {
        // If project description becomes empty but we have a last valid one, restore it
        onProjectChange(currentTitle, lastValidDescriptionRef.current);
      }
    }
  }, [project.title, project.description]);

  // Debounce updates to parent to avoid cursor jumping
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Only update parent if user isn't currently typing
      if (document.activeElement?.id !== 'title' && document.activeElement?.id !== 'description') {
        onProjectChange(currentTitle, currentDescription);
        
        // Store last valid description
        if (currentDescription) {
          lastValidDescriptionRef.current = currentDescription;
        }
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [currentTitle, currentDescription, onProjectChange]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentDescription(e.target.value);
    if (e.target.value) {
      lastValidDescriptionRef.current = e.target.value;
    }
  };
  
  // Handle blur events to update parent state when user finishes typing
  const handleBlur = () => {
    onProjectChange(currentTitle, currentDescription);
    if (currentDescription) {
      lastValidDescriptionRef.current = currentDescription;
    }
  };

  const handleGetSuggestions = async () => {
    if (!currentDescription.trim()) {
      setError("Please provide a project description to get suggestions.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    // Store current description to prevent loss
    const descriptionToUse = currentDescription;
    lastValidDescriptionRef.current = descriptionToUse;
    
    try {
      const result: SuggestTasksOutput = await suggestTasksAction({ projectDescription: descriptionToUse });
      if (result && result.suggestions) {
        // Ensure we update with current values
        onProjectChange(currentTitle, descriptionToUse);
        onAISuggestions(result.suggestions);
      } else {
        setError("Received no suggestions from AI.");
        onAISuggestions([]);
      }
    } catch (err) {
      console.error("AI Suggestion Error:", err);
      let message = "Failed to get AI suggestions. Please try again.";
      if (err instanceof Error) {
        message = `AI Error: ${err.message}`;
      }
      setError(message);
      onAISuggestions([]);
    }
    setIsLoading(false);
    
    // Re-apply our stored description after AI process completes
    setTimeout(() => {
      if (lastValidDescriptionRef.current) {
        setCurrentDescription(lastValidDescriptionRef.current);
        onProjectChange(currentTitle, lastValidDescriptionRef.current);
      }
    }, 100);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Project Details: {currentTitle || "New Project"}</CardTitle>
        <CardDescription>Define your project and get AI-powered task suggestions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input 
            id="title" 
            name="title"
            placeholder="e.g., My Awesome App" 
            value={currentTitle}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            className="text-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your project goals, target audience, and key features..."
            value={currentDescription}
            onChange={handleDescriptionChange}
            onBlur={handleBlur}
            rows={5}
            className="text-base"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetSuggestions} disabled={isLoading || !currentDescription.trim()} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Getting Suggestions..." : "Get AI Task Suggestions"}
        </Button>
      </CardFooter>
    </Card>
  );
}
