/**
 * Simple and actionable checklist templates for pr-buddy
 * Author: Shivaraj Bakale
 */

import { PromptTemplate, ChecklistConfig } from './types.js';

export const CHECKLIST_TEMPLATES: Record<string, PromptTemplate> = {
  GENERAL_CODE_REVIEW: {
    id: 'general-code-review',
    name: 'General Code Review Checklist',
    description: 'Essential code review checklist for all PRs',
    category: 'checklist',
    variables: ['prNumber', 'title', 'author'],
    template: `# ✅ Code Review Checklist: PR #{{prNumber}}

**{{title}}** by @{{author}}

## Code Quality
- [ ] Code is readable and well-structured
- [ ] Functions are focused and appropriately sized
- [ ] Variable and function names are clear
- [ ] No obvious bugs or logic errors
- [ ] Error handling is appropriate

## Testing
- [ ] Tests cover new functionality
- [ ] Tests cover edge cases
- [ ] Existing tests still pass
- [ ] Manual testing completed

## Documentation
- [ ] Code comments explain complex logic
- [ ] README updated if needed
- [ ] API documentation updated if needed

## Security & Performance
- [ ] No hardcoded secrets or credentials
- [ ] Input validation in place
- [ ] No obvious performance issues
- [ ] Database queries are efficient`
  },

  SECURITY_CHECKLIST: {
    id: 'security-checklist',
    name: 'Security Checklist',
    description: 'Security-focused review checklist',
    category: 'checklist',
    variables: ['prNumber', 'title', 'author'],
    template: `# 🔒 Security Checklist: PR #{{prNumber}}

**{{title}}** by @{{author}}

## Authentication & Authorization
- [ ] Proper authentication checks
- [ ] Authorization verified for all endpoints
- [ ] Session management secure
- [ ] User permissions validated

## Data Protection
- [ ] Sensitive data encrypted
- [ ] Input sanitization implemented
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] No hardcoded secrets

## Dependencies & Infrastructure
- [ ] Dependencies are up to date
- [ ] No known vulnerable packages
- [ ] HTTPS enforced where needed
- [ ] Security headers implemented
- [ ] Rate limiting considered`
  },

  PERFORMANCE_CHECKLIST: {
    id: 'performance-checklist',
    name: 'Performance Checklist',
    description: 'Performance and scalability checklist',
    category: 'checklist',
    variables: ['prNumber', 'title', 'author'],
    template: `# ⚡ Performance Checklist: PR #{{prNumber}}

**{{title}}** by @{{author}}

## Database & Queries
- [ ] Queries are optimized
- [ ] Proper indexes in place
- [ ] No N+1 query problems
- [ ] Connection pooling used

## Memory & CPU
- [ ] No obvious memory leaks
- [ ] Efficient algorithms used
- [ ] Large loops optimized
- [ ] Resource cleanup implemented

## Network & Caching
- [ ] API calls minimized
- [ ] Caching implemented where appropriate
- [ ] Async operations used properly
- [ ] File operations optimized

## Scalability
- [ ] Will handle increased load
- [ ] Pagination for large datasets
- [ ] Resource limits considered`
  },

  FRONTEND_CHECKLIST: {
    id: 'frontend-checklist',
    name: 'Frontend Checklist',
    description: 'Frontend-specific review checklist',
    category: 'checklist',
    variables: ['prNumber', 'title', 'author'],
    template: `# 🎨 Frontend Checklist: PR #{{prNumber}}

**{{title}}** by @{{author}}

## UI/UX
- [ ] Design matches specifications
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility standards met
- [ ] Loading states implemented
- [ ] Error states handled

## Performance
- [ ] Images optimized
- [ ] Bundle size impact minimal
- [ ] Lazy loading where appropriate
- [ ] No unnecessary re-renders

## Code Quality
- [ ] Components are reusable
- [ ] State management is clean
- [ ] No console errors/warnings
- [ ] TypeScript types are correct

## Testing
- [ ] Unit tests for components
- [ ] Integration tests for flows
- [ ] Visual regression tests if needed`
  },

  API_CHECKLIST: {
    id: 'api-checklist',
    name: 'API Checklist',
    description: 'Backend API review checklist',
    category: 'checklist',
    variables: ['prNumber', 'title', 'author'],
    template: `# 🔌 API Checklist: PR #{{prNumber}}

**{{title}}** by @{{author}}

## API Design
- [ ] Endpoints follow RESTful principles
- [ ] Request/response schemas defined
- [ ] Proper HTTP status codes used
- [ ] Consistent error format
- [ ] API versioning considered

## Validation & Security
- [ ] Input validation comprehensive
- [ ] Authentication required
- [ ] Authorization checks in place
- [ ] Rate limiting implemented
- [ ] CORS configured properly

## Documentation & Testing
- [ ] API documentation updated
- [ ] Integration tests written
- [ ] Error scenarios tested
- [ ] Performance tested

## Data & Database
- [ ] Database migrations included
- [ ] Data validation in place
- [ ] Transactions used appropriately
- [ ] Backup/rollback plan considered`
  }
};

/**
 * Generate a checklist based on configuration
 */
export function generateChecklist(config: ChecklistConfig, prNumber: number, title: string, author: string): string {
  let checklist = `# 📋 Code Review Checklist: PR #${prNumber}\n\n`;
  checklist += `**${title}** by @${author}\n\n`;

  if (config.includeGeneral) {
    checklist += `## General Code Quality\n`;
    checklist += `- [ ] Code is readable and well-structured\n`;
    checklist += `- [ ] Functions are focused and appropriately sized\n`;
    checklist += `- [ ] Variable and function names are clear\n`;
    checklist += `- [ ] No obvious bugs or logic errors\n`;
    checklist += `- [ ] Error handling is appropriate\n\n`;
  }

  if (config.includeTesting) {
    checklist += `## Testing\n`;
    checklist += `- [ ] Tests cover new functionality\n`;
    checklist += `- [ ] Tests cover edge cases\n`;
    checklist += `- [ ] Existing tests still pass\n`;
    checklist += `- [ ] Manual testing completed\n\n`;
  }

  if (config.includeSecurity) {
    checklist += `## Security\n`;
    checklist += `- [ ] No hardcoded secrets or credentials\n`;
    checklist += `- [ ] Input validation in place\n`;
    checklist += `- [ ] Authentication/authorization checked\n`;
    checklist += `- [ ] No obvious security vulnerabilities\n\n`;
  }

  if (config.includePerformance) {
    checklist += `## Performance\n`;
    checklist += `- [ ] No obvious performance issues\n`;
    checklist += `- [ ] Database queries are efficient\n`;
    checklist += `- [ ] Memory usage is reasonable\n`;
    checklist += `- [ ] Async operations used appropriately\n\n`;
  }

  if (config.includeDocumentation) {
    checklist += `## Documentation\n`;
    checklist += `- [ ] Code comments explain complex logic\n`;
    checklist += `- [ ] README updated if needed\n`;
    checklist += `- [ ] API documentation updated if needed\n\n`;
  }

  if (config.includeAccessibility) {
    checklist += `## Accessibility\n`;
    checklist += `- [ ] Keyboard navigation works\n`;
    checklist += `- [ ] Screen reader compatible\n`;
    checklist += `- [ ] Color contrast meets standards\n`;
    checklist += `- [ ] Alt text for images\n\n`;
  }

  if (config.customItems && config.customItems.length > 0) {
    checklist += `## Custom Items\n`;
    config.customItems.forEach(item => {
      checklist += `- [ ] ${item}\n`;
    });
    checklist += `\n`;
  }

  return checklist;
}

/**
 * Get a specific checklist template
 */
export function getChecklistTemplate(templateId: string): PromptTemplate | null {
  return CHECKLIST_TEMPLATES[templateId.toUpperCase()] || null;
} 