import type { Project, OptimizationResults } from './types';
import { getProjectStats } from './services/progress-tracker';

/**
 * Generate a hash of the project state for optimization caching
 * This helps determine if the project has changed significantly since last optimization
 */
export function generateProjectStateHash(project: Project): string {
  // Create a simplified representation of the project for hashing
  const stateData = {
    title: project.title,
    description: project.description,
    phasesCount: project.phases.length,
    totalTasks: project.phases.reduce((acc, phase) => acc + phase.microtasks.length, 0),
    completedTasks: project.phases.reduce((acc, phase) => 
      acc + phase.microtasks.filter(task => task.isCompleted).length, 0
    ),
    totalEstimatedTime: project.totalEstimatedTime,
    progressPercentage: project.progressPercentage,
    techStack: JSON.stringify(project.metadata.techStack),
    complexity: project.metadata.complexity,
    teamSize: project.metadata.teamSize
  };
  
  // Simple hash function (you might want to use a proper hashing library in production)
  return btoa(JSON.stringify(stateData)).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Check if optimization should be re-run based on project changes and time
 */
export function shouldRunOptimization(project: Project): {
  shouldRun: boolean;
  reason: string;
} {
  const existingOptimization = project.optimizationResults;
  
  // No existing optimization - should run
  if (!existingOptimization) {
    return { shouldRun: true, reason: 'No previous optimization found' };
  }
  
  // Check if project state has changed significantly
  const currentHash = generateProjectStateHash(project);
  if (currentHash !== existingOptimization.projectStateHash) {
    return { shouldRun: true, reason: 'Project structure has changed significantly' };
  }
  
  // Check if optimization is older than 7 days
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  const optimizationAge = Date.now() - existingOptimization.generatedAt;
  if (optimizationAge > weekInMs) {
    return { shouldRun: true, reason: 'Optimization data is older than 7 days' };
  }
  
  // Existing optimization is still valid
  return { shouldRun: false, reason: 'Recent optimization available' };
}

/**
 * Create optimization results object with metadata
 */
export function createOptimizationResults(
  optimizations: string[],
  timelinePrediction: string,
  scopeAdjustments: string[],
  riskAlerts: string[],
  project: Project
): OptimizationResults {
  return {
    optimizations,
    timelinePrediction,
    scopeAdjustments,
    riskAlerts,
    generatedAt: Date.now(),
    projectStateHash: generateProjectStateHash(project)
  };
}

/**
 * Check if optimization results are still fresh (less than 24 hours old)
 */
export function isOptimizationFresh(optimizationResults: OptimizationResults | undefined): boolean {
  if (!optimizationResults) return false;
  
  const dayInMs = 24 * 60 * 60 * 1000;
  const age = Date.now() - optimizationResults.generatedAt;
  return age < dayInMs;
}
