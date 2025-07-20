// src/components/mindscope/enhanced-project-setup.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  Clock, 
  Users, 
  Target, 
  Code, 
  AlertTriangle,
  Sparkles,
  Brain,
  TrendingUp
} from 'lucide-react';
import { generateEnhancedProject, type EnhancedProjectInput } from '@/ai/flows/enhanced-project-flow';
import { getProjectTemplates, createProjectFromTemplate } from '@/lib/services/project-templates';
import type { ProjectTemplate } from '@/lib/types';

interface EnhancedProjectSetupProps {
  onProjectCreated: (project: any) => void;
  onCancel: () => void;
}

export function EnhancedProjectSetup({ onProjectCreated, onCancel }: EnhancedProjectSetupProps) {
  const [activeTab, setActiveTab] = useState('smart-setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  
  // Smart setup form state
  const [formData, setFormData] = useState<EnhancedProjectInput>({
    projectName: '',
    projectDescription: '',
    projectType: 'web-app',
    teamSize: 1,
    timeline: 8,
    experience: 'moderate',
    budget: undefined,
    targetPlatforms: [],
    requiredFeatures: [],
    preferredTech: [],
    constraints: []
  });

  // Template-based setup state
  const [templateFormData, setTemplateFormData] = useState({
    projectName: '',
    projectDescription: '',
    selectedTemplateId: ''
  });

  const projectTemplates = getProjectTemplates();

  const handleSmartGeneration = async () => {
    if (!formData.projectName || !formData.projectDescription) {
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await generateEnhancedProject(formData);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Convert the AI result to our project format
      const project = {
        title: result.project.title,
        description: result.project.description,
        phases: result.project.phases.map((phase, phaseIndex) => ({
          id: `phase-${phaseIndex}`,
          name: phase.name,
          description: phase.description,
          microtasks: phase.microtasks.map((task, taskIndex) => ({
            id: `task-${phaseIndex}-${taskIndex}`,
            name: task.name,
            description: task.description,
            estimatedTime: task.estimatedTime,
            actualTime: undefined,
            isCompleted: false,
            priority: task.priority,
            complexity: task.complexity,
            dependencies: task.dependencies.map(dep => ({
              id: `dep-${taskIndex}`,
              dependsOn: dep,
              type: 'prerequisite' as const,
              description: `Depends on: ${dep}`
            })),
            tags: task.tags,
            notes: task.deliverables.join(', ')
          })),
          estimatedDuration: phase.estimatedDuration,
          milestone: phase.milestone,
          riskAssessment: {
            level: phase.riskLevel,
            factors: [`${phase.riskLevel} risk phase`],
            mitigation: ['Regular progress reviews', 'Clear communication']
          }
        })),
        team: [],
        metadata: {
          projectType: result.project.metadata.projectType,
          targetPlatform: result.project.metadata.targetPlatform,
          techStack: result.project.metadata.techStack,
          teamSize: result.project.metadata.teamSize,
          timeline: result.project.metadata.timeline,
          complexity: result.project.metadata.complexity
        },
        totalEstimatedTime: result.project.phases.reduce((total, phase) => 
          total + phase.microtasks.reduce((phaseTotal, task) => 
            phaseTotal + task.estimatedTime, 0
          ), 0
        ),
        progressPercentage: 0,
        createdAt: Date.now(),
        lastModified: null
      };

      onProjectCreated(project);
    } catch (error) {
      console.error('Error generating project:', error);
      // Handle error state
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleTemplateGeneration = () => {
    if (!templateFormData.projectName || !templateFormData.selectedTemplateId) {
      return;
    }

    const template = projectTemplates.find(t => t.id === templateFormData.selectedTemplateId);
    if (!template) return;

    const project = createProjectFromTemplate(
      template,
      templateFormData.projectName,
      templateFormData.projectDescription || template.description
    );

    onProjectCreated({
      ...project,
      createdAt: Date.now(),
      lastModified: null
    });
  };

  const addToArray = (field: keyof Pick<EnhancedProjectInput, 'targetPlatforms' | 'requiredFeatures' | 'preferredTech' | 'constraints'>, value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
  };

  const removeFromArray = (field: keyof Pick<EnhancedProjectInput, 'targetPlatforms' | 'requiredFeatures' | 'preferredTech' | 'constraints'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          AI-Powered Project Setup
        </h1>
        <p className="text-gray-600">
          Create intelligent project plans with AI-powered insights and optimization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smart-setup" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Smart AI Setup
          </TabsTrigger>
          <TabsTrigger value="template-setup" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Template Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smart-setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Intelligent Project Generation
              </CardTitle>
              <CardDescription>
                Provide your project details and let AI create an optimized plan with smart task breakdown, 
                tech stack recommendations, and risk analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select 
                    value={formData.projectType} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, projectType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-app">Web Application</SelectItem>
                      <SelectItem value="mobile-app">Mobile App</SelectItem>
                      <SelectItem value="saas">SaaS Platform</SelectItem>
                      <SelectItem value="api">REST API</SelectItem>
                      <SelectItem value="desktop">Desktop App</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                  placeholder="Describe your project in detail. Include features, target audience, goals, and any specific requirements..."
                  rows={4}
                />
              </div>

              {/* Project Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Size
                  </Label>
                  <Select 
                    value={formData.teamSize.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} {size === 1 ? 'person' : 'people'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline (weeks)
                  </Label>
                  <Select 
                    value={formData.timeline.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2,4,6,8,12,16,20,24,30,40,52].map(weeks => (
                        <SelectItem key={weeks} value={weeks.toString()}>
                          {weeks} weeks
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Experience Level
                  </Label>
                  <Select 
                    value={formData.experience} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Beginner</SelectItem>
                      <SelectItem value="moderate">Intermediate</SelectItem>
                      <SelectItem value="complex">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional Advanced Settings */}
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold">Optional: Advanced Settings</h3>
                
                <div className="space-y-2">
                  <Label>Budget (USD)</Label>
                  <Input
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      budget: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="e.g., 50000"
                  />
                </div>

                {/* Array inputs for platforms, features, etc. */}
                {[
                  { field: 'targetPlatforms' as const, label: 'Target Platforms', placeholder: 'e.g., Web, iOS, Android' },
                  { field: 'requiredFeatures' as const, label: 'Required Features', placeholder: 'e.g., User authentication, Real-time chat' },
                  { field: 'preferredTech' as const, label: 'Preferred Technologies', placeholder: 'e.g., React, Node.js, PostgreSQL' },
                  { field: 'constraints' as const, label: 'Constraints', placeholder: 'e.g., Must use existing API, No external dependencies' }
                ].map(({ field, label, placeholder }) => (
                  <div key={field} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={placeholder}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addToArray(field, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input?.value) {
                            addToArray(field, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData[field] || []).map((item, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" 
                               onClick={() => removeFromArray(field, index)}>
                          {item} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {isGenerating && (
                <Alert>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>AI is analyzing your requirements and creating an optimized project plan...</p>
                      <Progress value={generationProgress} className="w-full" />
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSmartGeneration} 
                  disabled={!formData.projectName || !formData.projectDescription || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Intelligent Project
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template-setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Template-Based Setup
              </CardTitle>
              <CardDescription>
                Choose from pre-built project templates for common development scenarios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateProjectName">Project Name</Label>
                  <Input
                    id="templateProjectName"
                    value={templateFormData.projectName}
                    onChange={(e) => setTemplateFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="My Project Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Choose Template</Label>
                  <Select 
                    value={templateFormData.selectedTemplateId} 
                    onValueChange={(value) => {
                      setTemplateFormData(prev => ({ ...prev, selectedTemplateId: value }));
                      const template = projectTemplates.find(t => t.id === value);
                      setSelectedTemplate(template || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            {template.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateDescription">Project Description (Optional)</Label>
                <Textarea
                  id="templateDescription"
                  value={templateFormData.projectDescription}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                  placeholder="Customize the template description or leave blank to use default..."
                  rows={3}
                />
              </div>

              {selectedTemplate && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-600">Timeline</p>
                        <p>{selectedTemplate.estimatedWeeks} weeks</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600">Difficulty</p>
                        <Badge variant={selectedTemplate.difficulty === 'expert' ? 'destructive' : 'secondary'}>
                          {selectedTemplate.difficulty}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600">Phases</p>
                        <p>{selectedTemplate.phases.length} phases</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600">Category</p>
                        <p>{selectedTemplate.category}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-semibold text-gray-600 mb-2">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {[...selectedTemplate.defaultTechStack.frontend, ...selectedTemplate.defaultTechStack.backend]
                          .slice(0, 6).map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {[...selectedTemplate.defaultTechStack.frontend, ...selectedTemplate.defaultTechStack.backend].length > 6 && (
                          <Badge variant="outline" className="text-xs">+more</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleTemplateGeneration} 
                  disabled={!templateFormData.projectName || !templateFormData.selectedTemplateId}
                  className="flex-1"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Create from Template
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
