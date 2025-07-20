// src/components/mindscope/project-setup-enhanced.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Loader2, 
  Sparkles, 
  Target, 
  Users, 
  Clock, 
  Code,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import type { Project } from '@/lib/types';

interface ProjectSetupEnhancedProps {
  project: Project;
  onProjectChange: (title: string, description: string) => void;
  onAIEnhancement: () => Promise<void>;
}

export function ProjectSetupEnhanced({ 
  project, 
  onProjectChange, 
  onAIEnhancement 
}: ProjectSetupEnhancedProps) {
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
      }
    }, 500); // Increased debounce to 500ms

    return () => clearTimeout(timeout);
  }, [currentTitle, currentDescription, onProjectChange]);

  const handleAIEnhance = async () => {
    if (!currentTitle.trim() || !currentDescription.trim()) {
      setError("Please provide both a project title and description before using AI enhancement.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure the latest values are saved before AI enhancement
      onProjectChange(currentTitle, currentDescription);
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await onAIEnhancement();
    } catch (err) {
      console.error('AI Enhancement error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during AI enhancement.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasContent = currentTitle.trim() && currentDescription.trim();
  const hasPhases = project.phases && project.phases.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Project Setup
          {hasPhases && (
            <Badge variant="secondary" className="ml-2">
              {project.phases.length} phases created
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Define your project and let AI create an intelligent breakdown with tech recommendations, 
          risk analysis, and optimized task dependencies.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            placeholder="Enter your project name..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            value={currentDescription}
            onChange={(e) => setCurrentDescription(e.target.value)}
            placeholder="Describe your project in detail. Include features, target audience, goals, technical requirements, and any constraints. The more detailed, the better AI can help..."
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Tip: Include target platforms, preferred technologies, team size, and timeline for better AI recommendations.
          </p>
        </div>

        {/* Project Metadata Display */}
        {hasPhases && project.metadata && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Analysis Results
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Project Type</p>
                  <Badge variant="outline" className="capitalize">
                    {project.metadata.projectType.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-gray-600 font-medium">Complexity</p>
                  <Badge variant={project.metadata.complexity === 'expert' ? 'destructive' : 'secondary'}>
                    {project.metadata.complexity}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-gray-600 font-medium">Estimated Time</p>
                  <p className="font-semibold">{project.totalEstimatedTime}h</p>
                </div>
                
                <div>
                  <p className="text-gray-600 font-medium">Team Size</p>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-semibold">{project.metadata.teamSize}</span>
                  </div>
                </div>
              </div>

              {/* Tech Stack Display */}
              {project.metadata.techStack && (
                <div className="mt-4">
                  <p className="text-gray-600 font-medium mb-2">Recommended Tech Stack</p>
                  <div className="space-y-2">
                    {Object.entries(project.metadata.techStack).map(([category, technologies]) => (
                      technologies.length > 0 && (
                        <div key={category} className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 capitalize min-w-20">
                            {category}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {technologies.slice(0, 4).map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs flex items-center gap-1">
                                <Code className="h-3 w-3" />
                                {tech}
                              </Badge>
                            ))}
                            {technologies.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{technologies.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Enhancement Features Preview */}
        {hasContent && !hasPhases && (
          <div className="space-y-3">
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI Enhancement Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <Code className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Tech Stack Analysis</p>
                    <p className="text-gray-600">Optimal technology recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-green-50 rounded">
                  <TrendingUp className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Smart Time Estimation</p>
                    <p className="text-gray-600">AI-enhanced time predictions</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                  <Target className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Risk Assessment</p>
                    <p className="text-gray-600">Identify potential bottlenecks</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                  <Lightbulb className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Dependency Mapping</p>
                    <p className="text-gray-600">Critical path optimization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleAIEnhance}
          disabled={!hasContent || isLoading}
          className="w-full flex items-center gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              {hasPhases ? 'Re-enhance with AI' : 'Enhance with AI Intelligence'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
