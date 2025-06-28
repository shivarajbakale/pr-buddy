# 📝 Prompts Module

Simple and impactful prompts for pr-buddy code reviews.

## Structure

```
src/prompts/
├── index.ts              # Main exports
├── types.ts              # Prompt-specific types
├── review-templates.ts   # Review prompt templates
├── checklist-templates.ts # Checklist templates
├── prompt-generator.ts   # Main generator class
└── README.md            # This file
```

## Usage

```typescript
import { PromptGenerator } from './prompts/prompt-generator.js';

const generator = new PromptGenerator();

// Generate a review prompt
const reviewPrompt = generator.generateReviewPromptFromPR(pr, {
  type: 'staff-engineer',
  focusAreas: ['architecture', 'performance'],
  includeComplexityAnalysis: true,
  includeTimeEstimate: true
});

// Generate a checklist
const checklist = generator.generateChecklistFromPR(pr, {
  includeGeneral: true,
  includeSecurity: true,
  includePerformance: false,
  includeTesting: true
});
```

## Available Templates

### Review Templates
- **Staff Engineer** - Architecture and technical leadership focus
- **Security** - Security-focused review
- **Performance** - Performance optimization focus
- **Architecture** - System design and patterns
- **Junior Dev** - Learning-oriented review

### Checklist Templates
- **General Code Review** - Essential code quality checks
- **Security Checklist** - Security-focused verification
- **Performance Checklist** - Performance optimization checks
- **Testing Checklist** - Test coverage and quality

## Design Principles

1. **Simple & Concise** - Easy to read and act upon
2. **Actionable** - Clear next steps and decisions
3. **Contextual** - Adapts to PR complexity and type
4. **Consistent** - Standardized format across all prompts
5. **Impactful** - Focuses on what matters most

## Customization

All templates use simple variable substitution:
- `{{prNumber}}` - PR number
- `{{title}}` - PR title  
- `{{author}}` - PR author
- `{{complexity.level}}` - Complexity level
- `{{complexity.estimatedTime}}` - Estimated review time

Add new templates by extending the template objects in the respective files. 