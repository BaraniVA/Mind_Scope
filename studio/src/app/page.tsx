// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Project, Phase, Microtask, UserProject, OptimizationResults } from '@/lib/types';
import { AppHeader } from '@/components/mindscope/app-header';
import { ProjectSetup } from '@/components/mindscope/project-setup';
import { ProjectSetupEnhanced } from '@/components/mindscope/project-setup-enhanced';
import { EnhancedProjectSetup } from '@/components/mindscope/enhanced-project-setup';
import { ProjectIntelligenceDashboard } from '@/components/mindscope/project-intelligence-dashboard';
import { ProjectQuickStats } from '@/components/mindscope/project-quick-stats';
import { TaskList } from '@/components/mindscope/task-list';
import { OverallProgress } from '@/components/mindscope/overall-progress';
import { ProjectManager } from '@/components/mindscope/project-manager';
import { useToast } from "@/hooks/use-toast";
import { suggestTasks as suggestTasksAction } from '@/ai/flows/suggest-tasks';
import { generateEnhancedProject } from '@/ai/flows/enhanced-project-flow';
import { optimizeProject } from '@/ai/flows/enhanced-project-flow';
import { parseAISuggestions } from '@/lib/ai-parser';
import { 
  shouldRunOptimization, 
  createOptimizationResults, 
  isOptimizationFresh 
} from '@/lib/optimization-utils';
import { useAuth } from '@/contexts/auth-user-context';
import { 
  getProjectStats, 
  calculateProjectProgress 
} from '@/lib/services/progress-tracker';
import { 
  analyzeTechStack, 
  assessProjectRisks, 
  enhanceTimeEstimation 
} from '@/lib/services/project-intelligence';
import { database } from '@/lib/firebase/config';
import { ref, onValue, set, push, remove, serverTimestamp, off, update, get } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Sparkles, Brain, BarChart3, Zap } from 'lucide-react';


const MAX_PROJECTS = 10; // Increased from 5 to 10
const MAX_PROJECTS_NEW_USERS = 1; // New users can only create 1 project
const DEFAULT_PROJECT: Project = {
  title: '',
  description: '',
  phases: [],
  team: [],
  lastModified: null,
  metadata: {
    projectType: 'web-app',
    targetPlatform: [],
    techStack: {
      frontend: [],
      backend: [],
      database: [],
      deployment: [],
      tools: []
    },
    teamSize: 1,
    complexity: 'moderate'
  },
  totalEstimatedTime: 0,
  progressPercentage: 0,
  createdAt: Date.now()
};

// Function to normalize project data from Firebase
const normalizeProjectData = (data: any): Project => {
  const normalized = { ...DEFAULT_PROJECT, ...data };
  
  // Ensure phases is an array and each phase has microtasks array
  if (normalized.phases && Array.isArray(normalized.phases)) {
    normalized.phases = normalized.phases.map((phase: any) => ({
      ...phase,
      microtasks: phase.microtasks && Array.isArray(phase.microtasks) ? phase.microtasks.map((task: any) => {
        const cleanTask: any = {
          id: task.id,
          name: task.name,
          description: task.description || '',
          estimatedTime: task.estimatedTime || 0,
          isCompleted: task.isCompleted || false,
          priority: task.priority || 'medium',
          complexity: task.complexity || 'moderate',
          dependencies: task.dependencies || [],
          tags: task.tags || []
        };
        
        // Only add optional fields if they have valid values
        if (task.actualTime !== undefined && task.actualTime !== null) {
          cleanTask.actualTime = task.actualTime;
        }
        if (task.notes !== undefined && task.notes !== null && task.notes !== '') {
          cleanTask.notes = task.notes;
        }
        if (task.completedAt !== undefined && task.completedAt !== null) {
          cleanTask.completedAt = task.completedAt;
        }
        
        return cleanTask;
      }) : []
    }));
  } else {
    normalized.phases = [];
  }
  
  // Ensure metadata exists
  if (!normalized.metadata) {
    normalized.metadata = DEFAULT_PROJECT.metadata;
  }
  
  // Preserve optimization results if they exist
  if (data.optimizationResults) {
    normalized.optimizationResults = data.optimizationResults;
  }
  
  // Calculate progress percentage
  normalized.progressPercentage = calculateProjectProgress(normalized);
  
  return normalized;
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
  const [showEnhancedSetup, setShowEnhancedSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'intelligence'>('overview');
  const [isNewUser, setIsNewUser] = useState<boolean>(false); // Track if user is new
  const [userProjectLimit, setUserProjectLimit] = useState<number>(MAX_PROJECTS); // Dynamic project limit
  
  // Ref to track the most current project data for preventing stale closures
  const currentProjectDataRef = useRef<Project | null>(null);
  const writeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOptimisticUpdateRef = useRef(false);
  
  // Update ref whenever state changes
  useEffect(() => {
    currentProjectDataRef.current = currentProjectData;
  }, [currentProjectData]);


  // Effect for auth state and initial data load
  useEffect(() => {
    if (!authIsLoading) {
      if (!authUser) {
        router.push('/login');
      } else {
        setLocalCurrentUserIdentifier(authUser.displayName || authUser.email || authUser.uid);
        
        // Initialize user profile to determine project limits
        checkAndInitializeUserProfile(authUser.uid);
        
        const projectsRef = ref(database, `users/${authUser.uid}/projects`);
        onValue(projectsRef, (snapshot) => {
          const projectsData = snapshot.val();
          if (projectsData) {
            const loadedProjects: UserProject[] = Object.entries(projectsData).map(([id, data]: [string, any]) => ({
              id,
              name: data.title || 'Untitled Project',
              lastModified: data.lastModified || 0,
              metadata: {
                projectType: data.metadata?.projectType || 'web-app',
                complexity: data.metadata?.complexity || 'moderate'
              },
              progressPercentage: calculateProjectProgress(normalizeProjectData(data))
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
        // Skip updates if we're currently writing to the database or have an optimistic update
        if (isWritingToDb || isOptimisticUpdateRef.current) {
          console.log('Skipping database update due to write lock or optimistic update');
          setIsDataLoading(false);
          return;
        }
        
        const data = snapshot.val();
        if (data) {
          const normalizedData = normalizeProjectData(data);
          console.log('Database update: applying normalized data');
          setCurrentProjectData(normalizedData);
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

  // Helper function to clean undefined values from objects
  const cleanUndefinedValues = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefinedValues);
    }
    
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    });
    return cleaned;
  };

  // Debounced save effect for currentProjectData
  useEffect(() => {
    if (authUser && activeProjectId && currentProjectData && !isDataLoading) { 
      // Clear any existing timeout
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current);
      }
      
      writeTimeoutRef.current = setTimeout(() => {
        // Only proceed if we're not already in a write operation from a different source
        if (isWritingToDb) return;
        
        const projectRef = ref(database, `users/${authUser.uid}/projects/${activeProjectId}`);
        
        // Clean undefined values before saving to Firebase
        const cleanedProjectData = cleanUndefinedValues({
          ...currentProjectData,
          lastModified: serverTimestamp(),
        });
        
        // Set the write lock before saving
        setIsWritingToDb(true);
        console.log('Starting database save...');
        
        set(projectRef, cleanedProjectData)
          .then(() => {
            console.log('Database save successful');
          })
          .catch(error => {
            console.error("Failed to save project:", error);
            toast({ title: "Save Error", description: "Could not save project changes.", variant: "destructive" });
          })
          .finally(() => {
            // Release both the write lock and optimistic update flag
            setTimeout(() => {
              setIsWritingToDb(false);
              isOptimisticUpdateRef.current = false;
              console.log('Released write lock and optimistic update flag');
            }, 200);
          });
      }, 400); // Reduced debounce to 400ms for faster saves

      return () => {
        if (writeTimeoutRef.current) {
          clearTimeout(writeTimeoutRef.current);
        }
      };
    }
  }, [currentProjectData, authUser, activeProjectId, toast, isDataLoading, isWritingToDb]);


  const generateId = () => push(ref(database, `users/${authUser?.uid}/temp`)).key || crypto.randomUUID();

  // Function to check if user is new and set their project limit
  const checkAndInitializeUserProfile = async (uid: string) => {
    try {
      const userProfileRef = ref(database, `users/${uid}/profile`);
      const projectsRef = ref(database, `users/${uid}/projects`);
      
      // Get user profile and projects data
      const [profileSnapshot, projectsSnapshot] = await Promise.all([
        get(userProfileRef),
        get(projectsRef)
      ]);

      const profileData = profileSnapshot.val();
      const projectsData = projectsSnapshot.val();
      const existingProjectCount = projectsData ? Object.keys(projectsData).length : 0;

      // If user has no profile data, they might be new
      if (!profileData) {
        // Check if they have existing projects (migrated user)
        if (existingProjectCount > 0) {
          // Existing user with projects - give them the full limit
          await set(userProfileRef, {
            isNewUser: false,
            accountCreatedAt: Date.now(),
            projectLimit: MAX_PROJECTS,
            migratedUser: true // Flag to indicate they were migrated
          });
          setIsNewUser(false);
          setUserProjectLimit(MAX_PROJECTS);
        } else {
          // Truly new user - restrict to 1 project
          await set(userProfileRef, {
            isNewUser: true,
            accountCreatedAt: Date.now(),
            projectLimit: MAX_PROJECTS_NEW_USERS,
            migratedUser: false
          });
          setIsNewUser(true);
          setUserProjectLimit(MAX_PROJECTS_NEW_USERS);
        }
      } else {
        // User has profile data - use their existing settings
        setIsNewUser(profileData.isNewUser || false);
        setUserProjectLimit(profileData.projectLimit || MAX_PROJECTS);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // Default to existing user behavior if there's an error
      setIsNewUser(false);
      setUserProjectLimit(MAX_PROJECTS);
    }
  };


  const handleCreateNewProject = async (projectName: string) => {
    if (!authUser) return;
    if (userProjects.length >= userProjectLimit) {
      const limitMessage = isNewUser ? 
        `New users are limited to ${userProjectLimit} project. Create your first project to get started!` :
        `Cannot create more than ${userProjectLimit} projects.`;
      toast({ title: "Limit Reached", description: limitMessage, variant: "destructive" });
      throw new Error("Project limit reached");
    }
    
    setIsWritingToDb(true);
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
        createdAt: Date.now()
      };
      
      // Clean undefined values to prevent Firebase errors
      const cleanedProject = cleanUndefinedValues(newProject);
      
      await set(newProjectRef, cleanedProject);
      
      // Clear current project data first to ensure clean state
      setCurrentProjectData(null);
      
      // Release write lock before setting active project to allow proper loading
      setIsWritingToDb(false);
      
      // Set the new project as active and reset tab
      setActiveProjectId(newProjectId);
      setActiveTab('overview'); // Reset to overview tab for new projects
    } catch (error) {
      setIsWritingToDb(false);
      throw error;
    }
  };

  const handleEnhancedProjectCreated = async (project: Omit<Project, 'lastModified'>) => {
    if (!authUser) return;
    
    // Check project limit before creating
    if (userProjects.length >= userProjectLimit) {
      const limitMessage = isNewUser ? 
        `New users are limited to ${userProjectLimit} project. You can upgrade your account for more projects.` :
        `Cannot create more than ${userProjectLimit} projects.`;
      toast({ title: "Limit Reached", description: limitMessage, variant: "destructive" });
      return;
    }
    
    setIsWritingToDb(true);
    try {
      const newProjectRef = push(ref(database, `users/${authUser.uid}/projects`));
      const newProjectId = newProjectRef.key;
      if (!newProjectId) {
        toast({ title: "Error", description: "Failed to generate project ID.", variant: "destructive"});
        return;
      }

      const newProject: Project = {
        ...project,
        lastModified: serverTimestamp() as any
      };
      
      // Clean undefined values to prevent Firebase errors
      const cleanedProject = cleanUndefinedValues(newProject);
      
      await set(newProjectRef, cleanedProject);
      
      // Clear current project data first to ensure clean state
      setCurrentProjectData(null);
      
      // Release write lock before setting active project to allow proper loading
      setIsWritingToDb(false);
      
      setActiveProjectId(newProjectId);
      setShowEnhancedSetup(false);
      setActiveTab('overview');
      
      toast({ 
        title: "AI Project Created!", 
        description: `"${project.title}" has been created with intelligent insights.` 
      });
    } catch (error) {
      setIsWritingToDb(false);
      console.error('Error creating enhanced project:', error);
      toast({ 
        title: "Creation Failed", 
        description: "Could not create the AI project. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  // Function to upgrade user account (can be called later for premium features)
  const upgradeUserAccount = async () => {
    if (!authUser) return;
    
    try {
      const userProfileRef = ref(database, `users/${authUser.uid}/profile`);
      await update(userProfileRef, {
        isNewUser: false,
        projectLimit: MAX_PROJECTS,
        upgradedAt: Date.now()
      });
      
      setIsNewUser(false);
      setUserProjectLimit(MAX_PROJECTS);
      
      toast({
        title: "Account Upgraded!",
        description: `You can now create up to ${MAX_PROJECTS} projects.`
      });
    } catch (error) {
      console.error('Error upgrading account:', error);
      toast({
        title: "Upgrade Failed",
        description: "Could not upgrade your account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOptimizeProject = async (forceRefresh: boolean = false) => {
    if (!currentProjectData) return;
    
    try {
      // Check if we should run optimization
      const optimizationCheck = shouldRunOptimization(currentProjectData);
      
      // If we have recent optimization and not forcing refresh, use existing data
      if (!forceRefresh && !optimizationCheck.shouldRun) {
        toast({
          title: "Using Cached Optimization",
          description: `${optimizationCheck.reason}. Use "Force Refresh" for new analysis.`
        });
        setActiveTab('intelligence');
        return;
      }
      
      // Show different messages based on whether this is a refresh or new optimization
      const isRefresh = !optimizationCheck.shouldRun && forceRefresh;
      toast({
        title: isRefresh ? "AI Re-Optimization Started" : "AI Optimization Started",
        description: isRefresh ? 
          "Generating fresh optimization analysis..." : 
          `${optimizationCheck.reason}. Analyzing your project for optimization opportunities...`
      });

      const stats = getProjectStats(currentProjectData);
      const optimization = await optimizeProject({
        currentProject: JSON.stringify(currentProjectData),
        progressData: JSON.stringify(stats),
        feedback: forceRefresh ? 'User requested fresh optimization' : 'User requested optimization'
      });
      
      // Transform optimization results to match dashboard expectations
      const transformedOptimizationData = {
        optimizations: optimization.optimizations.map(opt => {
          const priorityText = opt.priority === 'critical' ? '🚨 Critical: ' : 
                              opt.priority === 'high' ? '⚡ High Priority: ' : 
                              opt.priority === 'medium' ? '📋 Medium Priority: ' : '💡 ';
          return `${priorityText}${opt.description} (${opt.impact} impact, ${opt.effort} effort)`;
        }),
        timelinePrediction: optimization.updatedTimeline,
        scopeAdjustments: optimization.scopeAdjustments.length > 0 ? 
          optimization.scopeAdjustments : 
          ['No scope adjustments recommended - current project scope appears well-defined'],
        riskAlerts: optimization.nextActions.length > 0 ? 
          optimization.nextActions.map(action => `⚠️ Action needed: ${action}`) :
          ['✅ No immediate risks identified - project is on track']
      };
      
      // Create persistent optimization results with metadata
      const persistentOptimizationResults = createOptimizationResults(
        transformedOptimizationData.optimizations,
        transformedOptimizationData.timelinePrediction,
        transformedOptimizationData.scopeAdjustments,
        transformedOptimizationData.riskAlerts,
        currentProjectData
      );
      
      // Update project with optimization results
      setCurrentProjectData(prev => prev ? {
        ...prev,
        optimizationResults: persistentOptimizationResults
      } : null);
      
      toast({
        title: isRefresh ? "AI Re-Optimization Complete" : "AI Optimization Complete",
        description: `Found ${optimization.optimizations.length} optimization opportunities. Results saved permanently. Check the AI Intelligence tab to view details.`
      });
      
      // Switch to intelligence tab to show results
      setActiveTab('intelligence');
      
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: "Could not analyze project for optimizations. Please try again.",
        variant: "destructive"
      });
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
        description: '',
        microtasks: pp.microtasks.map(pm => {
          const microtask: Microtask = {
            id: generateId(),
            name: pm.name,
            description: '',
            estimatedTime: 0,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: []
            // Don't include undefined optional fields
          };
          return microtask;
        }),
        estimatedDuration: 7, // Default 7 days
        milestone: false
      }));
      return { ...prev, phases: newPhases };
    });

    toast({
      title: "AI Suggestions Applied",
      description: `${parsedPhases.length} phase(s) with ${parsedPhases.reduce((acc, curr) => acc + curr.microtasks.length, 0)} microtask(s) have been added.`,
    });
  }, [currentProjectData, toast]);

  const handleAIEnhancement = useCallback(async () => {
    if (!currentProjectData || !currentProjectData.title || !currentProjectData.description) {
      toast({ 
        title: "Missing Information", 
        description: "Please provide project title and description first.", 
        variant: "destructive"
      });
      return;
    }

    try {
      toast({ 
        title: "AI Enhancement Started", 
        description: "Analyzing your project with advanced AI...",
      });

      // Prepare input for enhanced AI generation
      const enhancedInput = {
        projectName: currentProjectData.title,
        projectDescription: currentProjectData.description,
        projectType: currentProjectData.metadata.projectType,
        teamSize: currentProjectData.metadata.teamSize || 1,
        timeline: currentProjectData.metadata.timeline || 8,
        experience: currentProjectData.metadata.complexity === 'simple' ? 'beginner' : currentProjectData.metadata.complexity === 'moderate' ? 'intermediate' : 'expert',
        targetPlatforms: currentProjectData.metadata.targetPlatform,
        preferredTech: [
          ...currentProjectData.metadata.techStack.frontend,
          ...currentProjectData.metadata.techStack.backend,
          ...currentProjectData.metadata.techStack.database
        ].filter(Boolean)
      };

      // Generate enhanced project structure with AI intelligence
      const result = await generateEnhancedProject(enhancedInput);

      // Convert AI result to our project format
      const enhancedPhases: Phase[] = result.project.phases.map((aiPhase) => ({
        id: generateId(),
        name: aiPhase.name,
        description: aiPhase.description,
        estimatedDuration: 7, // Default to 7 days
        milestone: false,
        microtasks: aiPhase.microtasks.map((aiTask) => ({
          id: generateId(),
          name: aiTask.name,
          description: aiTask.description,
          estimatedTime: 4, // Default to 4 hours
          isCompleted: false,
          priority: aiTask.priority,
          complexity: 'moderate',
          dependencies: [],
          tags: [],
        })),
      }));

      // Calculate total estimated time
      const totalEstimatedTime = enhancedPhases.reduce((total, phase) =>
        total + phase.microtasks.reduce((phaseTotal, task) =>
          phaseTotal + task.estimatedTime, 0
        ), 0
      );


      // Update project with enhanced data
      setCurrentProjectData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          phases: enhancedPhases,
          metadata: {
            ...prev.metadata,
            techStack: result.project.techStack,
            timeline: prev.metadata.timeline,
            complexity: prev.metadata.complexity,
          },
          totalEstimatedTime,
          progressPercentage: 0
        };
      });

      toast({
        title: "AI Enhancement Complete!",
        description: `Enhanced with ${enhancedPhases.length} intelligent phases, ${totalEstimatedTime}h estimated, tech stack optimized, and risks assessed.`,
      });

    } catch (error) {
      console.error('AI Enhancement error:', error);
      
      // Provide more specific error messages
      let errorMessage = "Could not enhance project with AI intelligence. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "AI service authentication failed. Please check your API key configuration.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error connecting to AI service. Please check your internet connection.";
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = "AI service quota exceeded. Please try again later.";
        } else {
          errorMessage = `AI Enhancement failed: ${error.message}`;
        }
      }
      
      toast({
        title: "Enhancement Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [currentProjectData, toast]);


  const handleAddPhase = (phaseName: string) => {
    if (!currentProjectData) return;
    const newPhase: Phase = { 
      id: generateId(), 
      name: phaseName, 
      description: '',
      microtasks: [],
      estimatedDuration: 7, // Default 7 days
      milestone: false
    };
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
    const newMicrotask: Microtask = { 
      id: generateId(), 
      name: microtaskName, 
      description: '',
      estimatedTime: 0, 
      isCompleted: false,
      priority: 'medium',
      complexity: 'moderate',
      dependencies: [],
      tags: []
      // Don't include actualTime, notes, completedAt unless they have values
    };
    setCurrentProjectData(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId ? { 
          ...p, 
          microtasks: [...(p.microtasks || []), newMicrotask] 
        } : p
      ),
    } : null);
    toast({ title: "Microtask Added", description: `Microtask "${microtaskName}" created.`});
  };

  const handleUpdateMicrotask = useCallback((phaseId: string, updatedMicrotask: Microtask) => {
    console.log('Main page: handleUpdateMicrotask called', { phaseId, microtaskId: updatedMicrotask.id, isCompleted: updatedMicrotask.isCompleted });
    
    if (!authUser || !activeProjectId || !currentProjectDataRef.current) return;
    
    // For completion status changes, update immediately without debouncing
    const isCompletionUpdate = 'isCompleted' in updatedMicrotask;
    
    if (isCompletionUpdate) {
      // Set write lock to prevent listener interference
      setIsWritingToDb(true);
      
      // Create updated project data
      const updatedProject: Project = {
        ...currentProjectDataRef.current,
        phases: currentProjectDataRef.current.phases.map((p): Phase =>
          p.id === phaseId
            ? {
                ...p,
                microtasks: p.microtasks.map((mt: Microtask) =>
                  mt.id === updatedMicrotask.id ? updatedMicrotask : mt
                )
              }
            : p
        ),
        lastModified: serverTimestamp()
      };
      
      // Clean undefined values before saving
      const cleanedProjectData = cleanUndefinedValues(updatedProject);
      
      // Immediately save to database for completion updates
      const projectRef = ref(database, `users/${authUser.uid}/projects/${activeProjectId}`);
      
      set(projectRef, cleanedProjectData)
        .then(() => {
          console.log('Microtask completion updated in database');
          // Update local state after successful database update
          setCurrentProjectData(updatedProject);
        })
        .catch(error => {
          console.error('Failed to update microtask:', error);
          toast({ title: "Update Error", description: "Could not update task completion status.", variant: "destructive" });
        })
        .finally(() => {
          // Release write lock after a short delay
          setTimeout(() => {
            setIsWritingToDb(false);
          }, 300);
        });
    } else {
      // For other updates (not completion status), use the regular optimistic update with debouncing
      setCurrentProjectData(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          phases: prev.phases.map((p): Phase =>
            p.id === phaseId
              ? {
                  ...p,
                  microtasks: p.microtasks.map((mt: Microtask) =>
                    mt.id === updatedMicrotask.id ? updatedMicrotask : mt
                  )
                }
              : p
          ),
        };
      });
    }
  }, [authUser, activeProjectId, toast, cleanUndefinedValues]);

  const handleDeleteMicrotask = (phaseId: string, microtaskId: string) => {
    setCurrentProjectData(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId
          ? { ...p, microtasks: p.microtasks.filter((mt: Microtask) => mt.id !== microtaskId) }
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4" suppressHydrationWarning={true}>
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground mt-4">Loading MindScope...</p>
      </div>
    );
  }
  
  if (!authUser) return null; 

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 lg:p-8" suppressHydrationWarning={true}>
      <div className="w-full max-w-6xl space-y-6">
        <AppHeader />
        
        {/* Enhanced Project Manager with Better UI */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Project Manager
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Create and manage up to {userProjectLimit} projects with AI-powered insights
                  {isNewUser && " (New user limit - upgrade for more projects)"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEnhancedSetup(true)}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Setup
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProjectManager
              projects={userProjects}
              activeProjectId={activeProjectId}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                setActiveTab('overview');
              }}
              onDeleteProject={handleDeleteProject}
              onOpenAISetup={() => setShowEnhancedSetup(true)}
              maxProjects={userProjectLimit}
              isNewUser={isNewUser}
            />
            
            {/* Project Grid for Better Visualization */}
            {userProjects.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Your Projects</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProjects.map(project => (
                    <Card 
                      key={project.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        activeProjectId === project.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setActiveTab('overview');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium truncate">{project.name}</h5>
                            <Badge variant={project.metadata?.projectType === 'saas' ? 'default' : 'secondary'} className="text-xs">
                              {project.metadata?.projectType || 'web-app'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{project.progressPercentage || 0}%</span>
                            </div>
                            <Progress value={project.progressPercentage || 0} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {project.metadata?.complexity || 'moderate'}
                            </Badge>
                            <span>
                              {project.lastModified ? 
                                new Date(project.lastModified as number).toLocaleDateString() : 
                                'Recently created'
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Project Setup Modal */}
        {showEnhancedSetup && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              // Close modal when clicking on backdrop
              if (e.target === e.currentTarget) {
                setShowEnhancedSetup(false);
              }
            }}
          >
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
              <EnhancedProjectSetup
                onProjectCreated={handleEnhancedProjectCreated}
                onCancel={() => setShowEnhancedSetup(false)}
              />
            </div>
          </div>
        )}

        {/* Main Project Interface */}
        {activeProjectId && currentProjectData ? (
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Intelligence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats Dashboard */}
              <ProjectQuickStats project={currentProjectData} />
              
              {/* Enhanced AI Project Setup */}
              <ProjectSetupEnhanced 
                project={currentProjectData} 
                onProjectChange={handleProjectTitleDescriptionChange}
                onAIEnhancement={handleAIEnhancement}
              />
              
              {currentProjectData.phases.length > 0 && (
                <OverallProgress project={currentProjectData} />
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <TaskList
                project={currentProjectData}
                onAddPhase={handleAddPhase}
                onUpdatePhase={handleUpdatePhase}
                onDeletePhase={handleDeletePhase}
                onAddMicrotask={handleAddMicrotask}
                onUpdateMicrotask={handleUpdateMicrotask}
                onDeleteMicrotask={handleDeleteMicrotask}
              />
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <ProjectIntelligenceDashboard
                project={currentProjectData}
                onOptimizeProject={handleOptimizeProject}
                optimizationResults={currentProjectData.optimizationResults ? {
                  optimizations: currentProjectData.optimizationResults.optimizations,
                  timelinePrediction: currentProjectData.optimizationResults.timelinePrediction,
                  scopeAdjustments: currentProjectData.optimizationResults.scopeAdjustments,
                  riskAlerts: currentProjectData.optimizationResults.riskAlerts,
                  generatedAt: currentProjectData.optimizationResults.generatedAt
                } : null}
              />
            </TabsContent>
          </Tabs>
        ) : userProjects.length > 0 && !activeProjectId ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Select a Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Choose a project from above to start working with AI-powered insights.</p>
              <Button onClick={() => setShowEnhancedSetup(true)} className="flex items-center gap-2 mx-auto">
                <Sparkles className="h-4 w-4" />
                Create AI-Powered Project
              </Button>
            </CardContent>
          </Card>
        ) : userProjects.length === 0 && !activeProjectId && !isDataLoading ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Brain className="h-8 w-8 text-blue-600" />
                Welcome to MindScope AI!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-2xl mx-auto space-y-4">
                <p className="text-gray-600 text-lg">
                  The most intelligent project planning tool for indie developers
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">AI-Powered Setup</h3>
                    <p className="text-gray-600">Get intelligent project breakdown with smart task estimation</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Progress Intelligence</h3>
                    <p className="text-gray-600">Real-time insights and optimization recommendations</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Smart Templates</h3>
                    <p className="text-gray-600">Pre-built templates for common development scenarios</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowEnhancedSetup(true)} size="lg" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create AI-Powered Project
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Get started in seconds with intelligent project planning
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

