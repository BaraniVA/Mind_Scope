// src/lib/services/project-intelligence.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { 
  ProjectMetadata, 
  TechStack, 
  RiskAssessment, 
  TaskComplexity,
  Phase,
  Microtask
} from '@/lib/types';

// Schema for tech stack analysis
const TechStackAnalysisSchema = z.object({
  recommendedStack: z.object({
    frontend: z.array(z.string()).describe('Recommended frontend technologies'),
    backend: z.array(z.string()).describe('Recommended backend technologies'),
    database: z.array(z.string()).describe('Recommended database solutions'),
    deployment: z.array(z.string()).describe('Recommended deployment platforms'),
    tools: z.array(z.string()).describe('Recommended development tools')
  }),
  reasoning: z.string().describe('Explanation for the tech stack choices'),
  alternatives: z.array(z.string()).describe('Alternative technology options')
});

// Schema for risk assessment
const RiskAssessmentSchema = z.object({
  overallRisk: z.enum(['low', 'medium', 'high']).describe('Overall project risk level'),
  riskFactors: z.array(z.string()).describe('Identified risk factors'),
  mitigationStrategies: z.array(z.string()).describe('Suggested mitigation strategies'),
  timelineRisks: z.array(z.string()).describe('Timeline-specific risks'),
  technicalRisks: z.array(z.string()).describe('Technical implementation risks')
});

// Schema for time estimation enhancement
const TimeEstimationSchema = z.object({
  totalEstimatedHours: z.number().describe('Total project hours'),
  phaseBreakdown: z.array(z.object({
    phaseName: z.string(),
    estimatedHours: z.number(),
    complexity: z.enum(['simple', 'moderate', 'complex', 'expert']),
    riskMultiplier: z.number().describe('Risk-based time multiplier')
  })),
  confidenceLevel: z.enum(['low', 'medium', 'high']).describe('Confidence in estimates'),
  bufferRecommendation: z.number().describe('Recommended buffer percentage')
});

// Schema for dependency analysis
const DependencyAnalysisSchema = z.object({
  dependencies: z.array(z.object({
    taskName: z.string(),
    dependsOn: z.array(z.string()),
    type: z.enum(['blocks', 'prerequisite', 'parallel']),
    criticalPath: z.boolean().describe('Whether this task is on the critical path')
  })),
  criticalPath: z.array(z.string()).describe('Tasks on the critical path'),
  parallelizableGroups: z.array(z.array(z.string())).describe('Groups of tasks that can be done in parallel')
});

/**
 * Analyzes project requirements and suggests optimal tech stack
 */
export async function analyzeTechStack(
  projectDescription: string,
  projectType: string,
  teamSize: number,
  timeline: number
): Promise<z.infer<typeof TechStackAnalysisSchema>> {
  const prompt = ai.definePrompt({
    name: 'techStackAnalysis',
    input: {
      schema: z.object({
        description: z.string(),
        type: z.string(),
        teamSize: z.number(),
        timeline: z.number()
      })
    },
    output: { schema: TechStackAnalysisSchema },
    prompt: `As an expert software architect, analyze this project and recommend the optimal tech stack:

Project: {{{description}}}
Type: {{{type}}}
Team Size: {{{teamSize}}}
Timeline: {{{timeline}}} weeks

Consider:
- Team skill requirements
- Development speed
- Scalability needs
- Maintenance complexity
- Community support
- Learning curve

Provide practical, production-ready recommendations.`
  });

  const { output } = await prompt({
    description: projectDescription,
    type: projectType,
    teamSize,
    timeline
  });

  return output!;
}

/**
 * Performs comprehensive risk assessment for the project
 */
export async function assessProjectRisks(
  projectDescription: string,
  phases: Phase[],
  techStack: TechStack,
  teamSize: number,
  timeline: number
): Promise<z.infer<typeof RiskAssessmentSchema>> {
  const prompt = ai.definePrompt({
    name: 'riskAssessment',
    input: {
      schema: z.object({
        description: z.string(),
        phases: z.string(),
        techStack: z.string(),
        teamSize: z.number(),
        timeline: z.number()
      })
    },
    output: { schema: RiskAssessmentSchema },
    prompt: `As a senior project manager, assess the risks for this software project:

Project: {{{description}}}
Phases: {{{phases}}}
Tech Stack: {{{techStack}}}
Team Size: {{{teamSize}}}
Timeline: {{{timeline}}} weeks

Analyze risks in:
- Technical complexity
- Timeline feasibility
- Resource constraints
- Technology choices
- Integration challenges
- Market/business risks

Provide actionable mitigation strategies.`
  });

  const { output } = await prompt({
    description: projectDescription,
    phases: JSON.stringify(phases, null, 2),
    techStack: JSON.stringify(techStack, null, 2),
    teamSize,
    timeline
  });

  return output!;
}

/**
 * Enhances time estimation with AI-powered analysis
 */
export async function enhanceTimeEstimation(
  phases: Phase[],
  techStack: TechStack,
  teamExperience: TaskComplexity,
  similarProjects?: string[]
): Promise<z.infer<typeof TimeEstimationSchema>> {
  const prompt = ai.definePrompt({
    name: 'timeEstimation',
    input: {
      schema: z.object({
        phases: z.string(),
        techStack: z.string(),
        experience: z.string(),
        similarProjects: z.string().optional()
      })
    },
    output: { schema: TimeEstimationSchema },
    prompt: `As an experienced project estimator, provide detailed time estimates:

Project Phases: {{{phases}}}
Tech Stack: {{{techStack}}}
Team Experience: {{{experience}}}
Similar Projects: {{{similarProjects}}}

Consider:
- Task complexity and dependencies
- Technology learning curves
- Integration challenges
- Testing requirements
- Buffer for unknowns
- Team experience level

Provide realistic estimates with confidence levels.`
  });

  const { output } = await prompt({
    phases: JSON.stringify(phases, null, 2),
    techStack: JSON.stringify(techStack, null, 2),
    experience: teamExperience,
    similarProjects: similarProjects?.join(', ') || 'None provided'
  });

  return output!;
}

/**
 * Analyzes task dependencies and critical path
 */
export async function analyzeDependencies(
  phases: Phase[]
): Promise<z.infer<typeof DependencyAnalysisSchema>> {
  const prompt = ai.definePrompt({
    name: 'dependencyAnalysis',
    input: {
      schema: z.object({
        phases: z.string()
      })
    },
    output: { schema: DependencyAnalysisSchema },
    prompt: `As a project scheduling expert, analyze task dependencies:

Project Phases and Tasks: {{{phases}}}

Identify:
- Which tasks must be completed before others can start
- Tasks that can be done in parallel
- The critical path (longest sequence of dependent tasks)
- Potential bottlenecks
- Optimal task ordering

Consider realistic development workflows and technical dependencies.`
  });

  const { output } = await prompt({
    phases: JSON.stringify(phases, null, 2)
  });

  return output!;
}

/**
 * Suggests project optimizations based on current progress
 */
export async function suggestOptimizations(
  project: {
    phases: Phase[];
    metadata: ProjectMetadata;
    progressPercentage: number;
    totalActualTime?: number;
    totalEstimatedTime: number;
  }
): Promise<{
  optimizations: string[];
  timelinePrediction: string;
  scopeAdjustments: string[];
  riskAlerts: string[];
}> {
  const OptimizationSchema = z.object({
    optimizations: z.array(z.string()).describe('Actionable optimization suggestions'),
    timelinePrediction: z.string().describe('Updated timeline prediction based on current progress'),
    scopeAdjustments: z.array(z.string()).describe('Recommended scope adjustments'),
    riskAlerts: z.array(z.string()).describe('Current risk alerts based on progress')
  });

  const prompt = ai.definePrompt({
    name: 'projectOptimization',
    input: {
      schema: z.object({
        projectData: z.string()
      })
    },
    output: { schema: OptimizationSchema },
    prompt: `As a senior project consultant, analyze this project's progress and suggest optimizations:

Project Data: {{{projectData}}}

Analyze:
- Current progress vs. timeline
- Actual vs. estimated time variance
- Potential bottlenecks
- Scope creep indicators
- Resource optimization opportunities

Provide actionable recommendations to improve project outcomes.`
  });

  const { output } = await prompt({
    projectData: JSON.stringify(project, null, 2)
  });

  return output!;
}
