# PR-Buddy: Product Requirements Document (PRD)

## 📋 Project Overview

**Product Name:** pr-buddy  
**Version:** 2.0.0  
**Author:** Shivaraj Bakale  
**Type:** Model Context Protocol (MCP) Server with GitHub CLI Integration  

### Mission Statement
Create a comprehensive MCP server that streamlines GitHub pull request workflows by integrating with the GitHub CLI (`gh`) utility, enabling AI assistants to perform complex PR operations, reviews, and repository management tasks.

---

## 🎯 Core Objectives

1. **Seamless GitHub Integration**: Leverage GitHub CLI for authentic GitHub operations
2. **AI-First Design**: Optimized for LLM interactions via MCP protocol
3. **Developer Productivity**: Reduce manual PR management overhead
4. **Professional Workflows**: Support enterprise-grade PR review processes
5. **Template-Driven**: Standardize PR creation with smart templates

---

## ✅ Implementation Status

### **PHASE 1: Core GitHub Operations** ✅ **IMPLEMENTED**
- ✅ `create_pr` - Create PR with template and formatting
- ✅ `get_pr_details` - Get comprehensive PR information
- ✅ `list_my_prs` - List current user's open PRs
- ✅ `checkout_pr_branch` - Switch to PR branch locally
- ✅ `add_pr_label` - Add labels to PR (including Need_preview_env)
- ✅ `remove_pr_label` - Remove labels from PR

### **PHASE 2: Review & Analysis Tools** ✅ **IMPLEMENTED**
- ✅ `generate_review_prompt` - Create staff engineer review prompt
- ✅ `generate_code_checklist` - Create code review checklist
- ✅ `analyze_pr_complexity` - Assess PR size and complexity
- ✅ `get_pr_diff_summary` - Get condensed diff information

### **PHASE 3: Advanced Features** 📋 **TODO**
- ⏳ `suggest_reviewers` - AI-based reviewer suggestions
- ⏳ `auto_assign_reviewers` - Auto-assign based on CODEOWNERS
- ⏳ `get_pr_analytics` - PR metrics and insights
- ⏳ `validate_pr_requirements` - Check PR against compliance rules
- ⏳ `merge_pr` - Merge PR with strategy selection
- ⏳ `close_pr` - Close PR with reason

### **PHASE 4: Repository Management** 📋 **TODO**
- ⏳ `get_ci_status` - Get CI/CD pipeline status
- ⏳ `sync_branch` - Sync branch with upstream
- ⏳ `list_branches` - List repository branches
- ⏳ `delete_branch` - Delete merged branches
- ⏳ `create_release` - Create GitHub releases
- ⏳ `tag_version` - Create version tags

### **PHASE 5: Batch Operations** 📋 **TODO**
- ⏳ `bulk_label_prs` - Apply labels to multiple PRs
- ⏳ `bulk_assign_reviewers` - Assign reviewers to multiple PRs
- ⏳ `batch_pr_status` - Get status of multiple PRs
- ⏳ `cleanup_stale_prs` - Identify and manage stale PRs

### **PHASE 6: AI Enhancement** 📋 **TODO**
- ⏳ `ai_pr_summary` - Generate AI-powered PR summaries
- ⏳ `ai_code_suggestions` - AI-based code improvement suggestions
- ⏳ `ai_test_recommendations` - Suggest missing tests
- ⏳ `ai_security_scan` - AI-powered security analysis

---

## 🛠️ Technical Architecture

### **Current Implementation:**
```typescript
// Core Components (IMPLEMENTED)
src/
├── types/index.ts          // ✅ GitHub & PR type definitions
├── tools/index.ts          // ✅ Tool name constants
├── schemas/index.ts        // ✅ Zod validation schemas
├── utils/
│   ├── github-cli.ts       // ✅ GitHub CLI integration
│   └── pr-analysis.ts      // ✅ PR analysis utilities
├── handlers/index.ts       // ✅ Request handlers
└── index.ts               // ✅ MCP server setup
```

### **GitHub CLI Integration:**
- ✅ PR creation with templates (feature, bugfix, hotfix, docs, refactor)
- ✅ PR information retrieval and parsing
- ✅ Label management (add/remove including Need_preview_env)
- ✅ Branch checkout and management
- ✅ Comprehensive error handling

### **AI-Powered Analysis:**
- ✅ PR complexity scoring (0-100 scale)
- ✅ Staff engineer review prompt generation
- ✅ Code review checklist creation
- ✅ Diff summary with file statistics

---

## 📋 Detailed Feature Specifications

### **✅ IMPLEMENTED: Core GitHub Operations**

#### 1. **create_pr** ✅
- **Purpose**: Create formatted PRs with templates
- **Implementation**: Complete with 5 template types
- **Parameters**: title, body, template, base, head, labels, reviewers, assignees, draft
- **Templates**: feature, bugfix, hotfix, docs, refactor
- **Status**: ✅ Ready for use

#### 2. **get_pr_details** ✅  
- **Purpose**: Retrieve comprehensive PR information
- **Implementation**: Complete with full GitHub API integration
- **Parameters**: number OR url
- **Returns**: Full PR object with metrics, labels, reviewers
- **Status**: ✅ Ready for use

#### 3. **list_my_prs** ✅
- **Purpose**: List user's open PRs
- **Implementation**: Complete with filtering
- **Parameters**: state (open/closed/merged/all), limit
- **Returns**: Array of PR summaries
- **Status**: ✅ Ready for use

#### 4. **checkout_pr_branch** ✅
- **Purpose**: Switch to PR branch locally
- **Implementation**: Complete with local branch creation
- **Parameters**: prNumber, createLocal
- **Returns**: Success/error status
- **Status**: ✅ Ready for use

#### 5. **add_pr_label** ✅
- **Purpose**: Add labels including Need_preview_env
- **Implementation**: Complete with multiple label support
- **Parameters**: prNumber, labels[]
- **Returns**: Updated label list
- **Status**: ✅ Ready for use

#### 6. **remove_pr_label** ✅
- **Purpose**: Remove specified labels
- **Implementation**: Complete with validation
- **Parameters**: prNumber, labels[]
- **Returns**: Updated label list
- **Status**: ✅ Ready for use

### **✅ IMPLEMENTED: Review & Analysis Tools**

#### 7. **generate_review_prompt** ✅
- **Purpose**: Create staff engineer review prompts
- **Implementation**: Complete with 3 review types
- **Parameters**: prNumber, reviewType (staff-engineer/security/performance)
- **Returns**: Contextual review prompt
- **Status**: ✅ Ready for use

#### 8. **generate_code_checklist** ✅
- **Purpose**: Create comprehensive code review checklists
- **Implementation**: Complete with security and performance checks
- **Parameters**: prNumber, includeSecurityChecks, includePerformanceChecks
- **Returns**: Detailed checklist
- **Status**: ✅ Ready for use

#### 9. **analyze_pr_complexity** ✅
- **Purpose**: Assess PR size and complexity
- **Implementation**: Complete with scoring algorithm
- **Parameters**: prNumber, includeRecommendations
- **Returns**: Complexity score (0-100) with analysis
- **Status**: ✅ Ready for use

#### 10. **get_pr_diff_summary** ✅
- **Purpose**: Get condensed diff information
- **Implementation**: Complete with file statistics
- **Parameters**: prNumber, includeFileStats, maxFiles
- **Returns**: Diff summary with metrics
- **Status**: ✅ Ready for use

### **✅ IMPLEMENTED: PR Statistics**

#### 11. **get_pr_stats** ✅
- **Purpose**: Get PR statistics by time period (day/week/month)
- **Implementation**: Complete with merged PR analytics
- **Parameters**: period ('day' | 'week' | 'month')
- **Returns**: PR count, repository breakdown, daily stats
- **Status**: ✅ Ready for use

---

## 🚀 **Ready to Implement Next**

### **Priority 1: Advanced Features**
1. `suggest_reviewers` - AI-based reviewer suggestions
2. `auto_assign_reviewers` - Auto-assign based on CODEOWNERS
3. `merge_pr` - Merge PR with strategy selection

### **Priority 2: Repository Management**
1. `get_ci_status` - Get CI/CD pipeline status
2. `sync_branch` - Sync branch with upstream
3. `list_branches` - List repository branches

---

## 🎯 **Current Status Summary**

**✅ COMPLETED (11/27 features):**
- All Core GitHub Operations (6/6)
- All Review & Analysis Tools (4/4)
- PR Statistics (1/1)

**📋 REMAINING (16/26 features):**
- Advanced Features (6 tools)
- Repository Management (6 tools)
- Batch Operations (4 tools)

**🚀 Next Steps:**
1. Test current implementation with real GitHub repositories
2. Implement Priority 1 advanced features
3. Add comprehensive error handling and validation
4. Create usage documentation and examples

---

## 💡 **Usage Examples**

### **Create a Feature PR:**
```typescript
create_pr({
  title: "Add user authentication",
  template: "feature", 
  labels: ["enhancement", "Need_preview_env"],
  reviewers: ["senior-dev"]
})
```

### **Get Staff Engineer Review:**
```typescript
generate_review_prompt({
  prNumber: 123,
  reviewType: "staff-engineer"
})
```

### **Analyze PR Complexity:**
```typescript
analyze_pr_complexity({
  prNumber: 123,
  includeRecommendations: true
})
```

---

**Status**: Phase 1 & 2 Complete ✅  
**Next Phase**: Advanced Features 📋  
**Last Updated**: Implementation Complete 