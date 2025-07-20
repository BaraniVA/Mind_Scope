// src/lib/services/progress-tracker.ts
import type { Project, Phase, Microtask } from '@/lib/types';

/**
 * Calculates overall project progress based on completed tasks
 */
export function calculateProjectProgress(project: Project): number {
  const allTasks = project.phases.flatMap(phase => phase.microtasks);
  if (allTasks.length === 0) return 0;
  
  const completedTasks = allTasks.filter(task => task.isCompleted);
  return Math.round((completedTasks.length / allTasks.length) * 100);
}

/**
 * Calculates progress for a specific phase
 */
export function calculatePhaseProgress(phase: Phase): number {
  if (phase.microtasks.length === 0) return 0;
  
  const completedTasks = phase.microtasks.filter(task => task.isCompleted);
  return Math.round((completedTasks.length / phase.microtasks.length) * 100);
}

/**
 * Calculates weighted progress based on task complexity and time estimates
 */
export function calculateWeightedProgress(project: Project): number {
  const allTasks = project.phases.flatMap(phase => phase.microtasks);
  if (allTasks.length === 0) return 0;
  
  const totalWeight = allTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const completedWeight = allTasks
    .filter(task => task.isCompleted)
    .reduce((sum, task) => sum + task.estimatedTime, 0);
  
  if (totalWeight === 0) return 0;
  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Gets project statistics and insights
 */
export function getProjectStats(project: Project): {
  totalTasks: number;
  completedTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  averageTaskCompletion: number;
  upcomingDeadlines: Array<{ phaseId: string; phaseName: string; daysRemaining: number }>;
  criticalTasks: Microtask[];
  blockedTasks: Microtask[];
  efficiency: number; // actual vs estimated time ratio
} {
  const allTasks = project.phases.flatMap(phase => phase.microtasks);
  const completedTasks = allTasks.filter(task => task.isCompleted);
  
  const totalEstimatedHours = allTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const totalActualHours = completedTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
  
  // Calculate efficiency (actual time vs estimated time for completed tasks)
  const completedEstimatedHours = completedTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const efficiency = completedEstimatedHours > 0 ? totalActualHours / completedEstimatedHours : 1;
  
  // Find upcoming deadlines (phases ending within 7 days)
  const now = Date.now();
  const upcomingDeadlines = project.phases
    .filter(phase => phase.endDate && phase.endDate > now)
    .map(phase => ({
      phaseId: phase.id,
      phaseName: phase.name,
      daysRemaining: Math.ceil((phase.endDate! - now) / (1000 * 60 * 60 * 24))
    }))
    .filter(deadline => deadline.daysRemaining <= 7)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
  
  // Find critical tasks (high priority, not completed)
  const criticalTasks = allTasks.filter(task => 
    !task.isCompleted && task.priority === 'critical'
  );
  
  // Find blocked tasks (tasks with incomplete dependencies)
  const blockedTasks = allTasks.filter(task => {
    if (task.isCompleted) return false;
    
    return task.dependencies.some(dep => {
      const dependentTask = allTasks.find(t => t.id === dep.dependsOn);
      return dependentTask && !dependentTask.isCompleted && dep.type === 'blocks';
    });
  });
  
  // Calculate average task completion time
  const tasksWithActualTime = completedTasks.filter(task => task.actualTime);
  const averageTaskCompletion = tasksWithActualTime.length > 0
    ? tasksWithActualTime.reduce((sum, task) => sum + task.actualTime!, 0) / tasksWithActualTime.length
    : 0;
  
  return {
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,
    totalEstimatedHours,
    totalActualHours,
    averageTaskCompletion,
    upcomingDeadlines,
    criticalTasks,
    blockedTasks,
    efficiency
  };
}

/**
 * Predicts project completion date based on current progress
 */
export function predictCompletionDate(project: Project): {
  estimatedCompletionDate: number;
  confidence: 'low' | 'medium' | 'high';
  remainingHours: number;
  recommendedDaily: number;
} {
  const stats = getProjectStats(project);
  const remainingTasks = stats.totalTasks - stats.completedTasks;
  const remainingHours = stats.totalEstimatedHours - stats.totalActualHours;
  
  // Adjust for efficiency
  const adjustedRemainingHours = remainingHours * stats.efficiency;
  
  // Assume 6 productive hours per day
  const productiveHoursPerDay = 6;
  const estimatedDaysRemaining = Math.ceil(adjustedRemainingHours / productiveHoursPerDay);
  
  const estimatedCompletionDate = Date.now() + (estimatedDaysRemaining * 24 * 60 * 60 * 1000);
  
  // Determine confidence based on project maturity and consistency
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  
  if (stats.completedTasks < 3) {
    confidence = 'low'; // Not enough data
  } else if (stats.efficiency > 0.8 && stats.efficiency < 1.2) {
    confidence = 'high'; // Consistent performance
  } else if (stats.efficiency > 0.6 && stats.efficiency < 1.5) {
    confidence = 'medium'; // Somewhat consistent
  } else {
    confidence = 'low'; // Highly variable performance
  }
  
  const recommendedDaily = adjustedRemainingHours / Math.max(estimatedDaysRemaining, 1);
  
  return {
    estimatedCompletionDate,
    confidence,
    remainingHours: adjustedRemainingHours,
    recommendedDaily
  };
}

/**
 * Identifies bottlenecks and suggests optimizations
 */
export function identifyBottlenecks(project: Project): {
  bottlenecks: Array<{
    type: 'dependency' | 'resource' | 'complexity' | 'scope';
    description: string;
    affectedTasks: string[];
    suggestions: string[];
  }>;
  quickWins: Array<{
    taskId: string;
    taskName: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }>;
} {
  const allTasks = project.phases.flatMap(phase => phase.microtasks);
  const incompleteTasks = allTasks.filter(task => !task.isCompleted);
  const bottlenecks: any[] = [];
  
  // Dependency bottlenecks
  const blockedTasks = incompleteTasks.filter(task => 
    task.dependencies.some(dep => {
      const dependentTask = allTasks.find(t => t.id === dep.dependsOn);
      return dependentTask && !dependentTask.isCompleted && dep.type === 'blocks';
    })
  );
  
  if (blockedTasks.length > 0) {
    bottlenecks.push({
      type: 'dependency',
      description: `${blockedTasks.length} tasks are blocked by incomplete dependencies`,
      affectedTasks: blockedTasks.map(t => t.id),
      suggestions: [
        'Prioritize completing blocking tasks first',
        'Consider parallel work on non-dependent tasks',
        'Review if dependencies can be simplified'
      ]
    });
  }
  
  // Complexity bottlenecks
  const complexTasks = incompleteTasks.filter(task => 
    task.complexity === 'expert' || task.complexity === 'complex'
  );
  
  if (complexTasks.length > incompleteTasks.length * 0.3) {
    bottlenecks.push({
      type: 'complexity',
      description: 'High concentration of complex tasks may slow progress',
      affectedTasks: complexTasks.map(t => t.id),
      suggestions: [
        'Break down complex tasks into smaller subtasks',
        'Consider additional team members or expertise',
        'Allocate more time for complex tasks'
      ]
    });
  }
  
  // Find quick wins (low effort, high impact tasks)
  const quickWins = incompleteTasks
    .filter(task => 
      task.estimatedTime <= 4 && // Low effort (4 hours or less)
      task.priority === 'high' && // High impact
      task.dependencies.length === 0 // No blockers
    )
    .map(task => ({
      taskId: task.id,
      taskName: task.name,
      impact: 'high' as const,
      effort: 'low' as const
    }));
  
  return { bottlenecks, quickWins };
}

/**
 * Generates progress insights and recommendations
 */
export function generateProgressInsights(project: Project): {
  insights: string[];
  recommendations: string[];
  alerts: string[];
  nextActions: string[];
} {
  const stats = getProjectStats(project);
  const prediction = predictCompletionDate(project);
  const bottlenecks = identifyBottlenecks(project);
  
  const insights: string[] = [];
  const recommendations: string[] = [];
  const alerts: string[] = [];
  const nextActions: string[] = [];
  
  // Progress insights
  if (stats.efficiency < 0.8) {
    insights.push(`Tasks are taking ${Math.round((1 / stats.efficiency - 1) * 100)}% longer than estimated`);
    recommendations.push('Review task estimates and consider breaking down complex tasks');
  } else if (stats.efficiency > 1.2) {
    insights.push(`Tasks are completing ${Math.round((1 - stats.efficiency) * 100)}% faster than estimated`);
    insights.push('Consider increasing scope or adding stretch goals');
  }
  
  // Progress velocity
  const progressPercent = calculateProjectProgress(project);
  if (progressPercent < 25 && stats.totalTasks > 10) {
    recommendations.push('Focus on completing foundational tasks to build momentum');
  }
  
  // Deadline alerts
  if (stats.upcomingDeadlines.length > 0) {
    stats.upcomingDeadlines.forEach(deadline => {
      if (deadline.daysRemaining <= 2) {
        alerts.push(`Phase "${deadline.phaseName}" deadline in ${deadline.daysRemaining} days`);
      }
    });
  }
  
  // Critical task alerts
  if (stats.criticalTasks.length > 0) {
    alerts.push(`${stats.criticalTasks.length} critical tasks pending completion`);
    nextActions.push('Review and prioritize critical tasks');
  }
  
  // Blocked task alerts
  if (stats.blockedTasks.length > 0) {
    alerts.push(`${stats.blockedTasks.length} tasks are blocked by dependencies`);
    nextActions.push('Resolve blocking dependencies to unblock task progress');
  }
  
  // Quick wins
  if (bottlenecks.quickWins.length > 0) {
    nextActions.push(`Complete ${bottlenecks.quickWins.length} quick win tasks for immediate progress`);
  }
  
  // Completion prediction
  if (prediction.confidence === 'low') {
    recommendations.push('Track actual time spent on tasks to improve future estimates');
  }
  
  return { insights, recommendations, alerts, nextActions };
}
