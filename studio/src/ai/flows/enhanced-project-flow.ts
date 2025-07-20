// src/ai/flows/enhanced-project-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ProjectMetadata, Phase, Microtask } from '@/lib/types';

// Enhanced input schema for intelligent project generation
const EnhancedProjectInputSchema = z.object({
  projectName: z.string().describe('The name of the project'),
  projectDescription: z.string().describe('Detailed description of the project'),
  projectType: z.enum(['web-app', 'mobile-app', 'saas', 'api', 'desktop', 'other']),
  teamSize: z.number().min(1).max(20).describe('Number of team members'),
  timeline: z.number().min(1).max(52).describe('Project timeline in weeks'),
  experience: z.enum(['simple', 'moderate', 'complex', 'expert']).describe('Team experience level'),
  budget: z.number().optional().describe('Project budget in USD'),
  targetPlatforms: z.array(z.string()).optional().describe('Target platforms (web, iOS, Android, etc.)'),
  requiredFeatures: z.array(z.string()).optional().describe('Must-have features'),
  preferredTech: z.array(z.string()).optional().describe('Preferred technologies'),
  constraints: z.array(z.string()).optional().describe('Project constraints or limitations')
});

export type EnhancedProjectInput = z.infer<typeof EnhancedProjectInputSchema>;

// Enhanced output schema with intelligent project structure
const EnhancedProjectOutputSchema = z.object({
  project: z.object({
    title: z.string(),
    description: z.string(),
    metadata: z.object({
      projectType: z.enum(['web-app', 'mobile-app', 'saas', 'api', 'desktop', 'other']),
      targetPlatform: z.array(z.string()),
      techStack: z.object({
        frontend: z.array(z.string()),
        backend: z.array(z.string()),
        database: z.array(z.string()),
        deployment: z.array(z.string()),
        tools: z.array(z.string())
      }),
      teamSize: z.number(),
      timeline: z.number(),
      complexity: z.enum(['simple', 'moderate', 'complex', 'expert'])
    }),
    phases: z.array(z.object({
      name: z.string(),
      description: z.string(),
      estimatedDuration: z.number().describe('Duration in days'),
      milestone: z.boolean().describe('Whether this is a major milestone'),
      riskLevel: z.enum(['low', 'medium', 'high']).describe('Risk level for this phase'),
      microtasks: z.array(z.object({
        name: z.string(),
        description: z.string(),
        estimatedTime: z.number().describe('Estimated time in hours'),
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        complexity: z.enum(['simple', 'moderate', 'complex', 'expert']),
        tags: z.array(z.string()),
        dependencies: z.array(z.string()).describe('Names of tasks this depends on'),
        deliverables: z.array(z.string()).describe('Expected deliverables from this task')
      }))
    })),
    recommendations: z.object({
      techStackReasoning: z.string().describe('Why this tech stack was chosen'),
      riskFactors: z.array(z.string()).describe('Identified project risks'),
      mitigationStrategies: z.array(z.string()).describe('Risk mitigation strategies'),
      criticalPath: z.array(z.string()).describe('Critical path tasks'),
      optimizations: z.array(z.string()).describe('Suggested optimizations')
    })
  })
});

export type EnhancedProjectOutput = z.infer<typeof EnhancedProjectOutputSchema>;

// Main flow function
export async function generateEnhancedProject(input: EnhancedProjectInput): Promise<EnhancedProjectOutput> {
  return enhancedProjectFlow(input);
}

// Define the enhanced prompt
const enhancedProjectPrompt = ai.definePrompt({
  name: 'enhancedProjectPrompt',
  input: { schema: EnhancedProjectInputSchema },
  output: { schema: EnhancedProjectOutputSchema },
  prompt: `You are an expert software architect and project manager. Create a comprehensive, intelligent project plan.

Project Details:
- Name: {{{projectName}}}
- Description: {{{projectDescription}}}
- Type: {{{projectType}}}
- Team Size: {{{teamSize}}}
- Timeline: {{{timeline}}} weeks
- Experience Level: {{{experience}}}
- Budget: {{{budget}}}
- Target Platforms: {{{targetPlatforms}}}
- Required Features: {{{requiredFeatures}}}
- Preferred Technologies: {{{preferredTech}}}
- Constraints: {{{constraints}}}

Generate a smart project plan with:

1. **Optimized Tech Stack**: Choose technologies based on:
   - Team experience and size
   - Project timeline and complexity
   - Scalability requirements
   - Community support and learning curve
   - Budget constraints

2. **Intelligent Phase Structure**: Create phases that:
   - Build upon each other logically
   - Have clear milestones and deliverables
   - Consider risk factors and dependencies
   - Allow for parallel work where possible
   - Include proper testing and deployment phases

3. **Smart Task Breakdown**: For each microtask:
   - Provide realistic time estimates based on complexity
   - Set appropriate priorities considering dependencies
   - Include specific deliverables and acceptance criteria
   - Tag tasks for easy filtering and organization
   - Identify dependencies between tasks

4. **Risk Assessment**: Identify potential risks and provide mitigation strategies

5. **Critical Path Analysis**: Identify the sequence of critical tasks

6. **Optimization Suggestions**: Recommend ways to improve efficiency

Consider industry best practices for {{{projectType}}} projects and scale appropriately for a {{{teamSize}}}-person team with {{{experience}}} experience level.

Make the project plan actionable, realistic, and optimized for success within the {{{timeline}}}-week timeline.`,
});

// Define the Genkit flow
const enhancedProjectFlow = ai.defineFlow(
  {
    name: 'enhancedProjectFlow',
    inputSchema: EnhancedProjectInputSchema,
    outputSchema: EnhancedProjectOutputSchema,
  },
  async (input) => {
    const { output } = await enhancedProjectPrompt(input);
    return output!;
  }
);

// Additional utility flow for project optimization
const ProjectOptimizationInputSchema = z.object({
  currentProject: z.string().describe('JSON string of current project structure'),
  progressData: z.string().describe('JSON string of progress statistics'),
  feedback: z.string().optional().describe('User feedback or specific concerns')
});

const ProjectOptimizationOutputSchema = z.object({
  optimizations: z.array(z.object({
    type: z.enum(['timeline', 'scope', 'resources', 'technology', 'process']),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    effort: z.enum(['low', 'medium', 'high']),
    priority: z.enum(['low', 'medium', 'high', 'critical'])
  })),
  updatedTimeline: z.string().describe('Revised timeline prediction'),
  scopeAdjustments: z.array(z.string()).describe('Recommended scope changes'),
  nextActions: z.array(z.string()).describe('Immediate next steps')
});

export async function optimizeProject(input: z.infer<typeof ProjectOptimizationInputSchema>): Promise<z.infer<typeof ProjectOptimizationOutputSchema>> {
  const optimizationPrompt = ai.definePrompt({
    name: 'projectOptimization',
    input: { schema: ProjectOptimizationInputSchema },
    output: { schema: ProjectOptimizationOutputSchema },
    prompt: `As a senior project consultant, analyze this project's current state and suggest optimizations:

Current Project: {{{currentProject}}}
Progress Data: {{{progressData}}}
Feedback: {{{feedback}}}

Analyze:
1. **Performance vs. Estimates**: Are tasks taking longer/shorter than expected?
2. **Bottlenecks**: What's blocking progress?
3. **Resource Utilization**: Is the team working efficiently?
4. **Scope Creep**: Has the project grown beyond original scope?
5. **Timeline Feasibility**: Is the current timeline realistic?

Provide:
- Specific optimization recommendations with impact/effort analysis
- Updated timeline predictions based on current velocity
- Scope adjustment suggestions if needed
- Immediate actionable next steps

Focus on practical, implementable solutions that will improve project outcomes.`
  });

  const optimizationFlow = ai.defineFlow(
    {
      name: 'projectOptimizationFlow',
      inputSchema: ProjectOptimizationInputSchema,
      outputSchema: ProjectOptimizationOutputSchema,
    },
    async (input) => {
      const { output } = await optimizationPrompt(input);
      return output!;
    }
  );

  return optimizationFlow(input);
}
