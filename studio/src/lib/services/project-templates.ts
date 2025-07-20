// src/lib/services/project-templates.ts
import type { ProjectTemplate, TechStack } from '@/lib/types';

/**
 * Pre-built project templates for common development scenarios
 */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'saas-web-app',
    name: 'SaaS Web Application',
    description: 'Full-stack SaaS application with user authentication, payments, and dashboard',
    category: 'Web Application',
    projectType: 'saas',
    defaultTechStack: {
      frontend: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      backend: ['Node.js', 'Express', 'TypeScript'],
      database: ['PostgreSQL', 'Redis'],
      deployment: ['Vercel', 'Railway', 'Docker'],
      tools: ['Stripe', 'NextAuth.js', 'Prisma', 'Zod']
    },
    estimatedWeeks: 12,
    difficulty: 'complex',
    tags: ['saas', 'payments', 'auth', 'dashboard'],
    phases: [
      {
        name: 'Project Setup & Planning',
        description: 'Initial setup, architecture planning, and development environment',
        estimatedDuration: 3,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Setup development environment',
            description: 'Configure Next.js, TypeScript, and development tools',
            estimatedTime: 4,
            isCompleted: false,
            priority: 'high',
            complexity: 'simple',
            dependencies: [],
            tags: ['setup', 'environment']
          },
          {
            id: '',
            name: 'Design system architecture',
            description: 'Plan database schema, API structure, and component architecture',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'high',
            complexity: 'complex',
            dependencies: [],
            tags: ['architecture', 'planning']
          },
          {
            id: '',
            name: 'Setup CI/CD pipeline',
            description: 'Configure deployment pipeline and testing automation',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: ['devops', 'automation']
          }
        ]
      },
      {
        name: 'Authentication System',
        description: 'User registration, login, and session management',
        estimatedDuration: 5,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Setup NextAuth.js',
            description: 'Configure authentication providers and session handling',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['auth', 'nextauth']
          },
          {
            id: '',
            name: 'Create user registration flow',
            description: 'Build signup forms with validation and email verification',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['auth', 'forms', 'validation']
          },
          {
            id: '',
            name: 'Implement role-based access',
            description: 'Setup user roles and permission system',
            estimatedTime: 10,
            isCompleted: false,
            priority: 'medium',
            complexity: 'complex',
            dependencies: [],
            tags: ['auth', 'permissions', 'roles']
          }
        ]
      },
      {
        name: 'Core Application Features',
        description: 'Main application functionality and user interface',
        estimatedDuration: 20,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Build user dashboard',
            description: 'Create main dashboard with navigation and overview',
            estimatedTime: 12,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['ui', 'dashboard']
          },
          {
            id: '',
            name: 'Implement core CRUD operations',
            description: 'Build create, read, update, delete functionality for main entities',
            estimatedTime: 16,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['crud', 'api', 'database']
          },
          {
            id: '',
            name: 'Add real-time features',
            description: 'Implement WebSocket connections for live updates',
            estimatedTime: 10,
            isCompleted: false,
            priority: 'medium',
            complexity: 'complex',
            dependencies: [],
            tags: ['realtime', 'websockets']
          }
        ]
      },
      {
        name: 'Payment Integration',
        description: 'Subscription management and payment processing',
        estimatedDuration: 8,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Setup Stripe integration',
            description: 'Configure Stripe for subscription billing',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'high',
            complexity: 'complex',
            dependencies: [],
            tags: ['payments', 'stripe', 'subscriptions']
          },
          {
            id: '',
            name: 'Build pricing page',
            description: 'Create pricing tiers and checkout flow',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: ['ui', 'pricing', 'checkout']
          }
        ]
      },
      {
        name: 'Testing & Quality Assurance',
        description: 'Comprehensive testing and quality assurance',
        estimatedDuration: 6,
        microtasks: [
          {
            id: '',
            name: 'Write unit tests',
            description: 'Create unit tests for core business logic',
            estimatedTime: 12,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: ['testing', 'unit-tests']
          },
          {
            id: '',
            name: 'End-to-end testing',
            description: 'Implement E2E tests for critical user flows',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: ['testing', 'e2e']
          }
        ]
      },
      {
        name: 'Deployment & Launch',
        description: 'Production deployment and launch preparation',
        estimatedDuration: 4,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Production deployment',
            description: 'Deploy application to production environment',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['deployment', 'production']
          },
          {
            id: '',
            name: 'Performance optimization',
            description: 'Optimize loading times and user experience',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: ['optimization', 'performance']
          }
        ]
      }
    ]
  },
  {
    id: 'mobile-app-react-native',
    name: 'React Native Mobile App',
    description: 'Cross-platform mobile application with native features',
    category: 'Mobile Application',
    projectType: 'mobile-app',
    defaultTechStack: {
      frontend: ['React Native', 'TypeScript', 'Expo'],
      backend: ['Node.js', 'Express', 'Firebase'],
      database: ['Firebase Firestore', 'AsyncStorage'],
      deployment: ['App Store', 'Google Play', 'Expo Application Services'],
      tools: ['React Navigation', 'React Query', 'React Hook Form']
    },
    estimatedWeeks: 10,
    difficulty: 'complex',
    tags: ['mobile', 'react-native', 'expo', 'cross-platform'],
    phases: [
      {
        name: 'Project Setup & Navigation',
        description: 'Setup React Native project and navigation structure',
        estimatedDuration: 4,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Initialize Expo project',
            description: 'Setup React Native project with Expo and TypeScript',
            estimatedTime: 3,
            isCompleted: false,
            priority: 'high',
            complexity: 'simple',
            dependencies: [],
            tags: ['setup', 'expo', 'typescript']
          },
          {
            id: '',
            name: 'Configure navigation',
            description: 'Setup React Navigation with tab and stack navigators',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['navigation', 'routing']
          }
        ]
      },
      {
        name: 'UI Components & Screens',
        description: 'Build reusable components and main screens',
        estimatedDuration: 12,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Create design system',
            description: 'Build reusable UI components and theme system',
            estimatedTime: 10,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['ui', 'components', 'design-system']
          },
          {
            id: '',
            name: 'Build main screens',
            description: 'Create home, profile, and other core screens',
            estimatedTime: 16,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['screens', 'ui']
          }
        ]
      },
      {
        name: 'Native Features',
        description: 'Implement platform-specific features',
        estimatedDuration: 8,
        microtasks: [
          {
            id: '',
            name: 'Camera integration',
            description: 'Add camera functionality for photo capture',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'medium',
            complexity: 'complex',
            dependencies: [],
            tags: ['camera', 'native', 'permissions']
          },
          {
            id: '',
            name: 'Push notifications',
            description: 'Setup push notification system',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'medium',
            complexity: 'complex',
            dependencies: [],
            tags: ['notifications', 'native']
          }
        ]
      },
      {
        name: 'Testing & Deployment',
        description: 'Testing and app store deployment',
        estimatedDuration: 6,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Device testing',
            description: 'Test on various devices and screen sizes',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['testing', 'devices']
          },
          {
            id: '',
            name: 'App store submission',
            description: 'Prepare and submit to App Store and Google Play',
            estimatedTime: 10,
            isCompleted: false,
            priority: 'high',
            complexity: 'complex',
            dependencies: [],
            tags: ['deployment', 'app-store']
          }
        ]
      }
    ]
  },
  {
    id: 'rest-api-backend',
    name: 'REST API Backend',
    description: 'Scalable REST API with authentication and database integration',
    category: 'Backend API',
    projectType: 'api',
    defaultTechStack: {
      frontend: [],
      backend: ['Node.js', 'Express', 'TypeScript'],
      database: ['PostgreSQL', 'Redis'],
      deployment: ['Docker', 'AWS', 'Railway'],
      tools: ['Prisma', 'JWT', 'Swagger', 'Jest']
    },
    estimatedWeeks: 8,
    difficulty: 'moderate',
    tags: ['api', 'backend', 'rest', 'authentication'],
    phases: [
      {
        name: 'API Foundation',
        description: 'Setup Express server and basic middleware',
        estimatedDuration: 3,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'Setup Express server',
            description: 'Initialize Express app with TypeScript and middleware',
            estimatedTime: 4,
            isCompleted: false,
            priority: 'high',
            complexity: 'simple',
            dependencies: [],
            tags: ['express', 'setup', 'middleware']
          },
          {
            id: '',
            name: 'Database setup',
            description: 'Configure PostgreSQL and Prisma ORM',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['database', 'prisma', 'postgresql']
          }
        ]
      },
      {
        name: 'Authentication & Authorization',
        description: 'JWT authentication and role-based access control',
        estimatedDuration: 5,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'JWT authentication',
            description: 'Implement JWT-based authentication system',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['auth', 'jwt', 'security']
          },
          {
            id: '',
            name: 'Role-based access control',
            description: 'Implement user roles and permissions',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: ['auth', 'roles', 'permissions']
          }
        ]
      },
      {
        name: 'Core API Endpoints',
        description: 'Build main CRUD operations and business logic',
        estimatedDuration: 10,
        milestone: true,
        microtasks: [
          {
            id: '',
            name: 'User management endpoints',
            description: 'Create user CRUD operations and profile management',
            estimatedTime: 8,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['crud', 'users', 'endpoints']
          },
          {
            id: '',
            name: 'Business logic endpoints',
            description: 'Implement core business functionality APIs',
            estimatedTime: 12,
            isCompleted: false,
            priority: 'high',
            complexity: 'moderate',
            dependencies: [],
            tags: ['business-logic', 'endpoints']
          }
        ]
      },
      {
        name: 'Documentation & Testing',
        description: 'API documentation and comprehensive testing',
        estimatedDuration: 4,
        microtasks: [
          {
            id: '',
            name: 'Swagger documentation',
            description: 'Create comprehensive API documentation',
            estimatedTime: 6,
            isCompleted: false,
            priority: 'medium',
            complexity: 'simple',
            dependencies: [],
            tags: ['documentation', 'swagger']
          },
          {
            id: '',
            name: 'API testing',
            description: 'Write unit and integration tests',
            estimatedTime: 10,
            isCompleted: false,
            priority: 'medium',
            complexity: 'moderate',
            dependencies: [],
            tags: ['testing', 'jest', 'integration']
          }
        ]
      }
    ]
  }
];

/**
 * Get all available project templates
 */
export function getProjectTemplates(): ProjectTemplate[] {
  return PROJECT_TEMPLATES;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(template => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter(template => template.category === category);
}

/**
 * Get templates by project type
 */
export function getTemplatesByType(projectType: string): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter(template => template.projectType === projectType);
}

/**
 * Search templates by tags or keywords
 */
export function searchTemplates(query: string): ProjectTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return PROJECT_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.category.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get recommended templates based on project requirements
 */
export function getRecommendedTemplates(
  projectType?: string,
  complexity?: string,
  timelineWeeks?: number
): ProjectTemplate[] {
  let templates = PROJECT_TEMPLATES;

  if (projectType) {
    templates = templates.filter(t => t.projectType === projectType);
  }

  if (complexity) {
    templates = templates.filter(t => t.difficulty === complexity);
  }

  if (timelineWeeks) {
    // Get templates within 20% of the desired timeline
    const tolerance = timelineWeeks * 0.2;
    templates = templates.filter(t => 
      Math.abs(t.estimatedWeeks - timelineWeeks) <= tolerance
    );
  }

  // Sort by estimated weeks (ascending)
  return templates.sort((a, b) => a.estimatedWeeks - b.estimatedWeeks);
}

/**
 * Create a project from template with unique IDs
 */
export function createProjectFromTemplate(
  template: ProjectTemplate,
  projectTitle: string,
  projectDescription: string
): Omit<import('@/lib/types').Project, 'lastModified' | 'createdAt'> {
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  const phases = template.phases.map(phase => ({
    ...phase,
    id: generateId(),
    microtasks: phase.microtasks.map(task => ({
      ...task,
      id: generateId()
    }))
  }));

  const totalEstimatedTime = phases.reduce((total, phase) => 
    total + phase.microtasks.reduce((phaseTotal, task) => 
      phaseTotal + task.estimatedTime, 0
    ), 0
  );

  return {
    title: projectTitle,
    description: projectDescription,
    phases,
    team: [],
    metadata: {
      projectType: template.projectType,
      targetPlatform: [],
      techStack: template.defaultTechStack,
      teamSize: 1,
      timeline: template.estimatedWeeks,
      complexity: template.difficulty
    },
    totalEstimatedTime,
    progressPercentage: 0,
    templateId: template.id
  };
}
