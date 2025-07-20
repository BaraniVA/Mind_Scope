
// Core task and project types
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'expert';
export type DependencyType = 'blocks' | 'prerequisite' | 'parallel';

export interface TaskDependency {
  id: string;
  dependsOn: string; // microtask id
  type: DependencyType;
  description?: string;
}

export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  deployment: string[];
  tools: string[];
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  mitigation: string[];
}

export interface Microtask {
  id: string;
  name: string;
  description?: string;
  estimatedTime: number; // in hours
  actualTime?: number;
  isCompleted: boolean;
  priority: TaskPriority;
  complexity: TaskComplexity;
  dependencies: TaskDependency[];
  tags: string[];
  notes?: string;
  completedAt?: number;
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  microtasks: Microtask[];
  estimatedDuration: number; // in days
  actualDuration?: number;
  startDate?: number;
  endDate?: number;
  riskAssessment?: RiskAssessment;
  milestone?: boolean;
}

export interface ProjectMetadata {
  projectType: 'web-app' | 'mobile-app' | 'saas' | 'api' | 'desktop' | 'other';
  targetPlatform: string[];
  techStack: TechStack;
  teamSize: number;
  budget?: number;
  timeline?: number; // in weeks
  complexity: TaskComplexity;
}

export interface Project {
  title: string;
  description: string;
  phases: Phase[];
  team: string[];
  lastModified: number | object | null;
  metadata: ProjectMetadata;
  totalEstimatedTime: number;
  totalActualTime?: number;
  progressPercentage: number;
  createdAt: number;
  templateId?: string;
}

export interface UserProject {
  id: string;
  name: string;
  lastModified?: number | object | null;
  metadata?: Pick<ProjectMetadata, 'projectType' | 'complexity'>;
  progressPercentage?: number;
}

// Template system types
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  projectType: ProjectMetadata['projectType'];
  defaultTechStack: TechStack;
  phases: Omit<Phase, 'id' | 'actualDuration' | 'startDate' | 'endDate'>[];
  estimatedWeeks: number;
  difficulty: TaskComplexity;
  tags: string[];
}
