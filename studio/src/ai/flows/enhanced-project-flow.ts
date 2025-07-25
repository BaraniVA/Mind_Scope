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
  prompt: `You are an expert software architect and project manager with deep experience in {{{projectType}}} development. Create a comprehensive, intelligent project plan that goes beyond basic setup tasks.

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

CRITICAL REQUIREMENTS FOR OUTPUT FORMAT:
- ALWAYS include "title": "{{{projectName}}}" in the project object
- ALWAYS include all required fields: title, description, metadata, phases, recommendations
- Generate AT LEAST 50-80 microtasks for complex projects (like AI/ML apps)
- Create 6-10 detailed phases, each with 8-15 specific microtasks
- Break down large features into granular, implementable tasks
- Include ALL necessary development aspects: frontend, backend, APIs, testing, deployment, etc.

Generate a comprehensive project plan with:

1. **Project Information**:
   - title: MUST be exactly "{{{projectName}}}"
   - description: Enhanced version of the project description
   - Complete metadata and phase structure

2. **Optimized Tech Stack**: Choose modern, appropriate technologies:
   - Frontend: React Native/Flutter for mobile, React/Next.js for web
   - Backend: Node.js/Python/Go with proper framework selection
   - Database: SQL/NoSQL based on data requirements
   - APIs: RESTful/GraphQL design
   - Cloud services and third-party integrations
   - Development and deployment tools

3. **Detailed Phase Structure** (6-10 phases minimum):
   - **Phase 1: Project Foundation & Setup** (8-12 tasks)
   - **Phase 2: Core Architecture & Backend** (10-15 tasks)
   - **Phase 3: API Integrations & Data Layer** (8-12 tasks)
   - **Phase 4: Frontend Development & UI/UX** (12-18 tasks)
   - **Phase 5: Advanced Features & Logic** (10-15 tasks)
   - **Phase 6: Testing & Quality Assurance** (8-12 tasks)
   - **Phase 7: Deployment & DevOps** (6-10 tasks)
   - **Phase 8: Optimization & Polish** (6-10 tasks)

4. **Granular Task Breakdown** - Each microtask should be:
   - Specific and actionable (e.g., "Implement user authentication with JWT tokens" not "Setup auth")
   - 2-8 hours of work maximum
   - Include technical implementation details
   - Have clear acceptance criteria
   - Be tagged appropriately (frontend, backend, api, testing, etc.)
   - Include realistic time estimates based on complexity

5. **Comprehensive Coverage** - Include tasks for:
   - Database schema design and implementation
   - API endpoint development and documentation
   - User interface components and screens
   - Authentication and authorization systems
   - Third-party service integrations
   - Data validation and error handling
   - Unit, integration, and E2E testing
   - Performance optimization
   - Security implementation
   - Monitoring and logging
   - Documentation and code comments
   - Deployment configuration
   - User onboarding and tutorials

6. **Real-World Development Tasks** - Focus on actual implementation:
   - "Design and implement user registration flow with email verification"
   - "Create movie recommendation algorithm using collaborative filtering"
   - "Build responsive movie details screen with cast and reviews"
   - "Implement caching strategy for API responses"
   - "Set up automated testing pipeline with Jest and Cypress"
   - "Configure production deployment with Docker and AWS"

7. **Complete Schema Compliance**:
   - Include ALL required schema fields
   - Provide comprehensive recommendations with techStackReasoning, riskFactors, mitigationStrategies, criticalPath, and optimizations
   - Ensure all arrays are properly populated
   - Include meaningful descriptions and deliverables for each task

EXAMPLE FOR AI MOVIE RECOMMENDATION APP:
Should include tasks like:
- Set up React Native development environment with Expo
- Design database schema for users, movies, ratings, and preferences
- Implement OpenAI API integration for natural language processing
- Create OMDB API service layer with error handling and rate limiting
- Build user onboarding flow with preference collection
- Develop movie search and filtering functionality
- Implement recommendation engine with multiple algorithms
- Create user profile and settings management
- Build movie watchlist and favorites features
- Implement push notifications for new recommendations
- Add social features like sharing and reviews
- Set up analytics and user behavior tracking
- Create admin dashboard for content management
- Implement offline functionality and data synchronization
- Add accessibility features and internationalization
- Set up continuous integration and deployment pipeline

REMEMBER: 
- ALWAYS start with "title": "{{{projectName}}}" in the project object
- Make tasks specific, technical, and implementable
- Avoid generic tasks like "setup project" or "create components"
- Each phase should build upon previous phases and represent significant development milestones
- Time estimates should be realistic: simple (2-4h), moderate (4-8h), complex (8-16h), expert (16-24h)
- Include comprehensive recommendations section with all required fields

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
    try {
      console.log('🔄 Processing enhanced project prompt...');
      const { output } = await enhancedProjectPrompt(input);
      if (!output) {
        throw new Error('No output received from AI model');
      }
      
      // Validate critical fields before returning
      if (!output.project.title) {
        console.warn('⚠️ AI output missing title, using project name as fallback');
        output.project.title = input.projectName;
      }
      
      if (!output.project.description) {
        console.warn('⚠️ AI output missing description, using input description as fallback');
        output.project.description = input.projectDescription;
      }
      
      // Ensure recommendations object has all required fields
      if (!output.project.recommendations.techStackReasoning) {
        output.project.recommendations.techStackReasoning = 'Tech stack chosen based on project requirements and team experience.';
      }
      if (!output.project.recommendations.riskFactors || output.project.recommendations.riskFactors.length === 0) {
        output.project.recommendations.riskFactors = ['Timeline constraints', 'Technical complexity', 'Integration challenges'];
      }
      if (!output.project.recommendations.mitigationStrategies || output.project.recommendations.mitigationStrategies.length === 0) {
        output.project.recommendations.mitigationStrategies = ['Regular progress reviews', 'Phased development approach', 'Proper testing strategy'];
      }
      if (!output.project.recommendations.criticalPath || output.project.recommendations.criticalPath.length === 0) {
        output.project.recommendations.criticalPath = ['Project setup', 'Core backend development', 'Frontend implementation', 'Testing and deployment'];
      }
      if (!output.project.recommendations.optimizations || output.project.recommendations.optimizations.length === 0) {
        output.project.recommendations.optimizations = ['Implement caching strategies', 'Optimize API responses', 'Use efficient data structures'];
      }
      
      console.log('✅ Enhanced project prompt completed with validation');
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
