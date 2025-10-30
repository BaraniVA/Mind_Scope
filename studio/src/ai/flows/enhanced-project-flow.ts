// src/ai/flows/enhanced-project-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Final balanced input schema
const EnhancedProjectInputSchema = z.object({
  projectName: z.string().describe('The name of the project'),
  projectDescription: z.string().describe('Detailed description of the project'),
  projectType: z.enum(['web-app', 'mobile-app', 'saas', 'api', 'desktop', 'other']).optional(),
  teamSize: z.number().min(1).max(20).optional(),
  timeline: z.number().min(1).max(52).optional(),
  experience: z.enum(['simple', 'moderate', 'complex', 'expert']).optional(),
});

export type EnhancedProjectInput = z.infer<typeof EnhancedProjectInputSchema>;

// Final balanced output schema
const MicrotaskSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedTime: z.number().describe('Estimated time in hours'),
  priority: z.enum(['low', 'medium', 'high']),
});

const PhaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  microtasks: z.array(MicrotaskSchema),
});

const TechStackSchema = z.object({
  frontend: z.array(z.string()),
  backend: z.array(z.string()),
  database: z.array(z.string()),
});

const RecommendationsSchema = z.object({
  techStackReasoning: z.string(),
  riskFactors: z.array(z.string()),
  mitigationStrategies: z.array(z.string()),
});

const EnhancedProjectOutputSchema = z.object({
  project: z.object({
    title: z.string(),
    description: z.string(),
    phases: z.array(PhaseSchema),
    metadata: z.object({
      techStack: TechStackSchema,
    }),
    recommendations: RecommendationsSchema,
  }),
});

export type EnhancedProjectOutput = z.infer<typeof EnhancedProjectOutputSchema>;

// Main flow function
export async function generateEnhancedProject(input: EnhancedProjectInput): Promise<EnhancedProjectOutput> {
  try {
    console.log('🚀 Starting enhanced project generation with input:', input);
    const result = await enhancedProjectFlow(input);
    console.log('✅ Enhanced project generation completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Enhanced project generation failed:', error);
    throw new Error(`AI Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Define the enhanced prompt
const enhancedProjectPrompt = ai.definePrompt({
  name: 'enhancedProjectPrompt',
  input: { schema: EnhancedProjectInputSchema },
  output: { schema: EnhancedProjectOutputSchema },
  prompt: `You are an expert software architect. Create a detailed and actionable project plan for "{{{projectName}}}".
Description: {{{projectDescription}}}

Generate a project plan with the following structure:
- **Phases**: Create 4-6 distinct phases (e.g., "Project Setup," "Backend Development," "Frontend Development," "Testing & Deployment").
- **Microtasks**: For each phase, generate 5-10 specific and actionable microtasks. Each microtask should be a concrete step a developer can take.
- **Tech Stack**: Suggest a suitable tech stack (frontend, backend, database) and provide a brief, clear reasoning for your choices.
- **Risks and Mitigations**: Identify 3-4 potential risk factors for this project and suggest a corresponding mitigation strategy for each.

Ensure the output is well-structured and strictly follows the provided schema. The goal is a balance of detail and clarity, providing a solid foundation for the project without being overly prescriptive.
`,
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
