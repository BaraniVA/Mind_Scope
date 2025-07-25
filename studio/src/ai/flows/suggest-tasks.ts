// src/ai/flows/suggest-tasks.ts
'use server';

/**
 * @fileOverview AI-powered task suggestion flow for project planning.
 *
 * This file defines a Genkit flow that takes a project description as input and returns AI-generated suggestions for breaking down the project into phases and microtasks.
 *
 * @function suggestTasks - The main function to trigger the task suggestion flow.
 * @interface SuggestTasksInput - The input type for the suggestTasks function, containing the project description.
 * @interface SuggestTasksOutput - The output type for the suggestTasks function, providing an array of task suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the suggestTasks function
const SuggestTasksInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the software project.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

// Define the output schema for the suggestTasks function
const SuggestTasksOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of strings, where each string is a line in the suggested task breakdown. This includes phases and their corresponding microtasks formatted with appropriate indentation and numbering/bullets as per the prompt instructions.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

// Exported function to call the flow
export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  try {
    console.log('🚀 Starting task suggestion generation...');
    const result = await suggestTasksFlow(input);
    console.log('✅ Task suggestion generation completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Task suggestion generation failed:', error);
    throw new Error(`Task suggestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Define the prompt for task suggestion
const suggestTasksPrompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are an experienced software project manager and technical lead. Generate a detailed breakdown of project phases and specific microtasks for the following project.

Project Description: {{{projectDescription}}}

TASK GENERATION REQUIREMENTS:
- Generate AT LEAST 40-60 microtasks for complex projects
- Create 6-8 detailed phases, each with 8-12 specific microtasks
- Break down large features into granular, implementable tasks
- Cover ALL aspects: frontend, backend, APIs, testing, deployment, optimization

Create a comprehensive task breakdown that includes:

**Phase Structure (6-8 phases minimum):**
1. **Project Foundation & Architecture** - Setup, environment, core architecture decisions
2. **Backend Development & APIs** - Server setup, database, API endpoints, authentication
3. **Third-party Integrations** - External APIs, services, data connections
4. **Frontend/Mobile Development** - UI components, screens, user interactions
5. **Advanced Features & Logic** - Core business logic, algorithms, complex features
6. **Testing & Quality Assurance** - Unit tests, integration tests, E2E testing
7. **Deployment & DevOps** - CI/CD, hosting, monitoring, performance
8. **Polish & Optimization** - User experience, performance tuning, documentation

**Task Requirements:**
- Each task should be specific and actionable (2-8 hours of work)
- Include technical implementation details
- Cover all necessary development aspects
- Be realistic and implementable
- Focus on actual feature development, not just setup

**Example Tasks for AI Movie App:**
Instead of: "Setup authentication"
Use: "Implement JWT-based user authentication with login, registration, and password reset flows"

Instead of: "Create movie component"
Use: "Build movie card component with poster, rating, genre tags, and add-to-watchlist functionality"

Instead of: "Setup API"
Use: "Create RESTful API endpoints for user preferences, movie recommendations, and watchlist management"

Format your response as a clear, well-structured list:
- Each phase should be a main numbered item (e.g., "1. Backend Development & APIs")
- Under each phase, list specific microtasks with proper indentation (e.g., "  a. Design and implement user authentication system with JWT tokens")
- Include enough technical detail for developers to understand the scope
- Ensure tasks represent real software development milestones that deliver value

Focus on actionable development tasks that move the project forward meaningfully, not just configuration or setup work.`,
});

// Define the Genkit flow for task suggestion
const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    try {
      console.log('🔄 Processing task suggestion prompt...');
      const {output} = await suggestTasksPrompt(input);
      if (!output) {
        throw new Error('No output received from AI model');
      }
      console.log('✅ Task suggestion prompt completed');
      return output;
    } catch (error) {
      console.error('❌ Task suggestion prompt failed:', error);
      throw error;
    }
  }
);
