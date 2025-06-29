/**
 * Simple and impactful review prompt templates for pr-buddy
 * Author: Shivaraj Bakale
 */

import { PromptTemplate, PromptContext } from "./types.js";

export const REVIEW_TEMPLATES: Record<string, PromptTemplate> = {
  STAFF_ENGINEER: {
    id: "staff-engineer",
    name: "Staff Engineer Review",
    description:
      "Technical leadership review focusing on architecture and impact",
    category: "review",
    variables: ["prNumber", "title", "author", "complexity"],
    template: `# 🏗️ Staff Engineer Review: PR #{{prNumber}}

**{{title}}** by @{{author}}
**Complexity:** {{complexity.level}} ({{complexity.estimatedTime}})

## Key Questions
- Does this align with our architecture vision?
- Will this scale and be maintainable?
- Are there any hidden risks or technical debt?
- Should we ship this now or iterate further?

## Focus Areas
- **Architecture** - System design and patterns
- **Performance** - Scalability and efficiency  
- **Security** - Vulnerabilities and compliance
- **Maintainability** - Code quality and documentation`,
  },

  SECURITY: {
    id: "security-review",
    name: "Security Review",
    description: "Security-focused review for identifying vulnerabilities",
    category: "review",
    variables: ["prNumber", "title", "author"],
    template: `# 🔒 Security Review: PR #{{prNumber}}

**{{title}}** by @{{author}}

## Security Checklist
- **Input Validation** - All user inputs validated and sanitized?
- **Authentication** - Proper auth/authz checks in place?
- **Data Protection** - Sensitive data encrypted and secured?
- **Dependencies** - No known vulnerabilities in libraries?
- **Secrets** - No hardcoded credentials or API keys?

## Red Flags to Watch For
- Direct database queries without parameterization
- File uploads without validation
- Admin endpoints without proper authorization
- Logging of sensitive information`,
  },

  PERFORMANCE: {
    id: "performance-review",
    name: "Performance Review",
    description: "Performance and scalability focused review",
    category: "review",
    variables: ["prNumber", "title", "author"],
    template: `# ⚡ Performance Review: PR #{{prNumber}}

**{{title}}** by @{{author}}

## Performance Checklist
- **Database** - Queries optimized, indexes in place?
- **Memory** - No obvious leaks or excessive usage?
- **Network** - Minimal API calls, caching used?
- **Algorithms** - Time/space complexity reasonable?
- **Scalability** - Will this handle increased load?

## Watch Out For
- N+1 query problems
- Synchronous operations that should be async
- Large objects in memory
- Missing pagination on lists`,
  },

  JUNIOR_DEV: {
    id: "junior-dev-review",
    name: "Junior Developer Review",
    description: "Educational review for learning and growth",
    category: "review",
    variables: ["prNumber", "title", "author"],
    template: `# 📚 Learning-Focused Review: PR #{{prNumber}}

**{{title}}** by @{{author}}

## Code Quality Basics
- **Readability** - Is the code easy to understand?
- **Naming** - Are variables and functions well-named?
- **Structure** - Is the code well-organized?
- **Testing** - Are there tests for the new functionality?
- **Documentation** - Is complex logic explained?

## Learning Opportunities
- What patterns or techniques are used here?
- How could this be improved or simplified?
- What edge cases might we be missing?
- Are there any potential bugs or issues?`,
  },

  ARCHITECTURE: {
    id: "architecture-review",
    name: "Architecture Review",
    description: "System design and architecture focused review",
    category: "review",
    variables: ["prNumber", "title", "author"],
    template: `# 🏛️ Architecture Review: PR #{{prNumber}}

**{{title}}** by @{{author}}

## Architecture Questions
- **Design Patterns** - Are appropriate patterns used?
- **Separation of Concerns** - Is responsibility clearly divided?
- **Dependencies** - Are dependencies managed well?
- **Interfaces** - Are APIs clean and well-defined?
- **Future-Proofing** - Will this be flexible for future needs?

## Key Considerations
- Does this fit our existing architecture?
- Are we introducing unnecessary complexity?
- Is this the right abstraction level?
- Will other teams understand this design?`,
  },
};

/**
 * Generate a review prompt for the given type and context
 */
export function generateReviewPrompt(
  type: string,
  context: PromptContext
): string {
  const template = REVIEW_TEMPLATES[type.toUpperCase()];
  if (!template) {
    throw new Error(`Unknown review template type: ${type}`);
  }

  let prompt = template.template;

  // Replace template variables
  prompt = prompt.replace(/\{\{prNumber\}\}/g, context.prNumber.toString());
  prompt = prompt.replace(/\{\{title\}\}/g, context.title);
  prompt = prompt.replace(/\{\{author\}\}/g, context.author);
  prompt = prompt.replace(
    /\{\{complexity\.level\}\}/g,
    context.complexity.level
  );
  prompt = prompt.replace(
    /\{\{complexity\.estimatedTime\}\}/g,
    context.complexity.estimatedTime
  );

  return prompt;
}
