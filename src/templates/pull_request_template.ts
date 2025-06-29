export const PR_TEMPLATE = `<!-- In your PR title make sure to prefix with the JIRA ticket: [INCIDENT-###] PR Title Here -->

## Briefly describe what led to the creation of this PR

## Describe your changes

## Any guidance to help the reviewer review this PR?

## What manual and/or automated testing did you perform to validate this PR?

## Before/after pictures or videos

| Before | After  |
| ------ | ------ |
| value1 | value2 |

## Checklist before requesting a review

- [ ] I have prefixed my PR with the JIRA ticket.
- [ ] I have performed a self-review of my code.
- [ ] I have added thorough tests.
- [ ] I have checked that the PR does not introduce new warnings/errors

## Additional checklist for E2E Test Automation PRs

- [ ] Does the test cover the intended user journey, including both happy path and edge/negative cases?
- [ ] Are stable selectors (role, aria-label, data-testid) used over dynamic classes or visible text?
- [ ] Are assertions specific, relevant, and sufficient to validate the business outcome?
- [ ] Are smart waits, retries, and network intercepts used to avoid flaky tests?
- [ ] Is the test consistently passing in CI, including the Burn Test job?
- [ ] Is the test code clear, well-structured, and free from duplication (e.g., uses helpers or custom commands)?
- [ ] Are the test files and related resources named appropriately and placed in the correct directory?

## AI Tooling Contribution

Please provide an impact score (0-5 scale) for using AI Code Editor tools (e.g., Cursor, GitHub Copilot, Windsurf, etc.) in the relevant phases of this PR, where 0 = no usage and 5 = 100% generated/greatest help.

- **ai_speed_boost_impact**: \\__ [e.g., 3] (Impact during the coding phase - coding, debugging, test generation etc.)_

- **ai_ideation_help_impact**: \\__ [e.g., 2] (Impact during the ideation phase - PRD/ERD drafting, Solution brainstorming, documentation, etc.)_

- **What worked well?** \\__ [e.g., Cursor generated 90% of the unit tests for X component, saving 2 hours of manual work. OR Bugbot helped finding a critical bug & solving it quickly OR AI tool helped draft initial RCA outline very fast.]_`;
