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
  return suggestTasksFlow(input);
}

// Define the prompt for task suggestion
const suggestTasksPrompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are an AI project manager. Generate a list of phases and microtasks to break down the software project described below. 

Project Description: {{{projectDescription}}}

Respond with a clear, well-structured list.
Each phase should be a main numbered item (e.g., "1. Phase Name").
Under each phase, list its microtasks. Microtasks should be indented (e.g., with 2 or more spaces) and can use sub-numbering (e.g., "  a. Microtask Name", "  1.1. Microtask Name") or bullet points (e.g., "  - Microtask Name").
Include enough detail for a software engineer to implement the microtasks.

Example Structure:
1.  Phase Alpha
    a.  First microtask for Alpha
    b.  Second microtask for Alpha
2.  Phase Beta
    -   First microtask for Beta
    -   Another microtask for Beta
`,
});

// Define the Genkit flow for task suggestion
const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await suggestTasksPrompt(input);
    return output!;
  }
);
