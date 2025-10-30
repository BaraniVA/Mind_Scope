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
  experience: z.enum(['beginner', 'intermediate', 'expert']).describe('Team experience level'),
  budget: z.number().optional().describe('Project budget in USD'),
  targetPlatforms: z.array(z.string()).optional().describe('Target platforms (web, iOS, Android, etc.)'),
  requiredFeatures: z.array(z.string()).optional().describe('Must-have features'),
  preferredTech: z.array(z.string()).optional().describe('Preferred technologies'),
  constraints: z.array(z.string()).optional().describe('Project constraints or limitations')
});

export type EnhancedProjectInput = z.infer<typeof EnhancedProjectInputSchema>;

// Simplified output schema
const EnhancedProjectOutputSchema = z.object({
  project: z.object({
    title: z.string(),
    description: z.string(),
    techStack: z.object({
      frontend: z.array(z.string()),
      backend: z.array(z.string()),
      database: z.array(z.string())
    }),
    phases: z.array(z.object({
      name: z.string(),
      description: z.string(),
      microtasks: z.array(z.object({
        name: z.string(),
        description: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical'])
      }))
    })),
    recommendations: z.object({
      techStackReasoning: z.string().describe('Why this tech stack was chosen'),
      optimizations: z.array(z.string()).describe('Suggested optimizations')
    })
  })
});

export type EnhancedProjectOutput = z.infer<typeof EnhancedProjectOutputSchema>;

// Main flow function
export async function generateEnhancedProject(input: EnhancedProjectInput): Promise<EnhancedProjectOutput> {
  console.log('🚀 Starting enhanced project generation with input:', JSON.stringify(input, null, 2));
  try {
    const result = await enhancedProjectFlow(input);
    console.log('✅ Enhanced project generation completed successfully:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Enhanced project generation failed:', error instanceof Error ? error.stack : String(error));
    throw new Error(`AI Enhancement failed: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
  }
}

// Simplified prompt
const enhancedProjectPrompt = ai.definePrompt({
  name: 'enhancedProjectPrompt',
  input: { schema: EnhancedProjectInputSchema },
  output: { schema: EnhancedProjectOutputSchema },
  prompt: `You are an expert software architect. Create a comprehensive project plan for a {{{projectType}}} project.

Project Details:
- Name: {{{projectName}}}
- Description: {{{projectDescription}}}
- Experience Level: {{{experience}}}
- Required Features: {{{requiredFeatures}}}

Generate a project plan with the following:

1.  **Project Information**:
    *   **title**: "{{{projectName}}}"
    *   **description**: A short, enhanced project description.

2.  **Tech Stack**: Recommend a modern tech stack (frontend, backend, database).

3.  **Phases**: Create 4-6 detailed phases, each with 5-10 specific microtasks. Break down large features into smaller, actionable tasks.

4.  **Recommendations**:
    *   **techStackReasoning**: Explain why the tech stack was chosen.
    *   **optimizations**: Suggest 2-3 optimizations for the project.

Make the project plan actionable and realistic for a team with {{{experience}}} experience.`,
});

// Define the Genkit flow
const enhancedProjectFlow = ai.defineFlow(
  {
    name: 'enhancedProjectFlow',
    inputSchema: EnhancedProjectInputSchema,
    outputSchema: EnhancedProjectOutputSchema,
  },
  async (input) => {
    try {
      console.log('🔄 Processing enhanced project prompt...');
      const { output } = await enhancedProjectPrompt(input);
      if (!output) {
        throw new Error('No output received from AI model');
      }
      
      console.log('✅ Enhanced project prompt completed');
      return output;
    } catch (error) {
      console.error('❌ Enhanced project prompt failed:', error);
      throw error;
    }
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
