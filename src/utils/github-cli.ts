/**
 * GitHub CLI utility functions for pr-buddy
 * Author: Shivaraj Bakale
 */

import { exec } from "child_process";
import { promisify } from "util";
import {
  GitHubPR,
  GitHubCliError,
  PRStats,
  PRComment,
} from "../types/index.js";

const execAsync = promisify(exec);

export interface RepositoryContext {
  workingDirectory?: string;
  repositoryUrl?: string;
  repositoryPath?: string;
}

export class GitHubCli {
  private repo: string;

  constructor(repo: string) {
    this.repo = repo;
  }

  /**
   * Execute GitHub CLI command
   */
  private async executeGhCommand(command: string): Promise<string> {
    try {
      // Add repository context to command if available
      let fullCommand = `gh ${command} --repo ${this.repo}`;

      const { stdout, stderr } = await execAsync(fullCommand);

      if (stderr && !stdout) {
        throw new GitHubCliError(`GitHub CLI error: ${stderr}`);
      }
      return stdout.trim();
    } catch (error: any) {
      const ghError = new GitHubCliError(
        `GitHub CLI command failed: ${error.message}`
      );
      ghError.exitCode = error.code || 1;
      ghError.stderr = error.stderr || "";
      throw ghError;
    }
  }
  /**
   * Check if GitHub CLI is installed and authenticated
   */
  async checkAuth(): Promise<boolean> {
    try {
      await this.executeGhCommand("auth status");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Enable preview environment for a PR by adding the appropriate label
   */
  async enablePreviewEnv(prNumber: number, label: string): Promise<string> {
    const command = `pr edit ${prNumber} --add-label "${label}"`;
    await this.executeGhCommand(command);
    return `Successfully enabled preview environment for PR #${prNumber}`;
  }

  /**
   * Create a new pull request
   */
  async createPR(params: {
    title: string;
    body: string;
    base: string;
    head: string;
    labels: string[];
    draft?: boolean;
  }): Promise<GitHubPR> {
    let command = "pr create";

    const finalTitle = params.title;
    const finalBody = params.body;

    // Build command
    command += ` --title "${finalTitle.replace(/"/g, '\\"')}"`;
    command += ` --body "${finalBody.replace(/"/g, '\\"')}"`;

    command += ` --base "${params.base}"`;
    command += ` --head "${params.head}"`;
    if (params.draft) command += " --draft";

    // Create the PR first
    const result = await this.executeGhCommand(command);
    const prUrl = result.trim();
    const prNumber = parseInt(prUrl.split("/").pop() || "0");

    await this.addLabels(prNumber, params.labels);
    // Get the full PR details
    return this.getPRDetails(prNumber);
  }

  /**
   * Get detailed information about a PR
   */
  async getPRDetails(prNumber: number): Promise<GitHubPR> {
    const command = `pr view ${prNumber} --json number,title,body,state,author,url,headRefName,baseRefName,createdAt,updatedAt,mergeable,labels,assignees,reviewRequests,isDraft,additions,deletions,changedFiles`;
    const result = await this.executeGhCommand(command);
    const prData = JSON.parse(result);

    return {
      number: prData.number,
      title: prData.title,
      body: prData.body || "",
      state: prData.state,
      author: prData.author?.login || "",
      url: prData.url,
      headRefName: prData.headRefName,
      baseRefName: prData.baseRefName,
      createdAt: prData.createdAt,
      updatedAt: prData.updatedAt,
      mergeable: prData.mergeable || "unknown",
      labels: prData.labels?.map((l: any) => l.name) || [],
      assignees: prData.assignees?.map((a: any) => a.login) || [],
      reviewers:
        prData.reviewRequests
          ?.map((r: any) => r.requestedReviewer?.login)
          .filter(Boolean) || [],
      isDraft: prData.isDraft || false,
      additions: prData.additions || 0,
      deletions: prData.deletions || 0,
      changedFiles: prData.changedFiles || 0,
    };
  }

  /**
   * List user's PRs with versatile filtering
   */
  async listMyPRs(
    author: string,
    state: string,
    limit: number,
    includeStats: boolean,
    isDraft?: boolean,
    dateFrom?: string,
    dateTo?: string
  ): Promise<GitHubPR[]> {
    // Build JSON fields to fetch
    let jsonFields = "number,title,body,state,author,url,headRefName,baseRefName,createdAt,updatedAt,labels,isDraft";
    if (includeStats) {
      jsonFields += ",additions,deletions,changedFiles";
    }

    const command = `pr list --author "${author}" --state ${state} --limit ${limit} --json ${jsonFields}`;
    const result = await this.executeGhCommand(command);
    let prsData = JSON.parse(result);

    // Client-side filtering for draft status
    if (isDraft !== undefined) {
      prsData = prsData.filter((pr: any) => pr.isDraft === isDraft);
    }

    // Client-side filtering for date range
    if (dateFrom || dateTo) {
      prsData = prsData.filter((pr: any) => {
        const prDate = new Date(pr.updatedAt);
        if (dateFrom && prDate < new Date(dateFrom)) return false;
        if (dateTo && prDate > new Date(dateTo + "T23:59:59")) return false;
        return true;
      });
    }

    return prsData.map((pr: any) => ({
      number: pr.number,
      title: pr.title,
      body: pr.body || "",
      state: pr.state,
      author: pr.author?.login || "",
      url: pr.url,
      headRefName: pr.headRefName,
      baseRefName: pr.baseRefName,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      mergeable: "unknown",
      labels: pr.labels?.map((l: any) => l.name) || [],
      assignees: [],
      reviewers: [],
      isDraft: pr.isDraft || false,
      additions: includeStats ? pr.additions || 0 : 0,
      deletions: includeStats ? pr.deletions || 0 : 0,
      changedFiles: includeStats ? pr.changedFiles || 0 : 0,
    }));
  }

  /**
   * Checkout PR branch
   */
  async checkoutPRBranch(
    prNumber: number,
    createLocal: boolean = true
  ): Promise<string> {
    try {
      const command = createLocal
        ? `pr checkout ${prNumber}`
        : `pr checkout ${prNumber} --detach`;
      await this.executeGhCommand(command);
      return `Successfully checked out PR #${prNumber}`;
    } catch (error) {
      throw new GitHubCliError(`Failed to checkout PR #${prNumber}: ${error}`);
    }
  }

  /**
   * Edit pull request details
   */
  async editPR(params: {
    number: number;
    title?: string;
    body?: string;
    base?: string;
    state?: "open" | "closed";
    addLabels?: string[];
    removeLabels?: string[];
  }): Promise<GitHubPR> {
    const { number, title, body, base, state, addLabels, removeLabels } =
      params;

    // Validate that at least one field is being updated
    if (
      !title &&
      !body &&
      !base &&
      !state &&
      (!addLabels || addLabels.length === 0) &&
      (!removeLabels || removeLabels.length === 0)
    ) {
      throw new GitHubCliError(
        "At least one field must be provided to edit the PR"
      );
    }

    let command = `pr edit ${number}`;

    // Add optional parameters
    if (title) {
      command += ` --title "${title.replace(/"/g, '\\"')}"`;
    }
    if (body) {
      command += ` --body "${body.replace(/"/g, '\\"')}"`;
    }
    if (base) {
      command += ` --base "${base}"`;
    }

    // Handle state change
    if (state === "closed") {
      await this.executeGhCommand(`pr close ${number}`);
    } else if (state === "open") {
      await this.executeGhCommand(`pr reopen ${number}`);
    }

    // Execute main edit command if there are fields to update
    if (title || body || base) {
      await this.executeGhCommand(command);
    }

    // Handle label operations
    if (addLabels && addLabels.length > 0) {
      await this.addLabels(number, addLabels);
    }
    if (removeLabels && removeLabels.length > 0) {
      await this.removeLabels(number, removeLabels);
    }

    // Return updated PR details
    return this.getPRDetails(number);
  }

  /**
   * Add labels to PR
   */
  async addLabels(prNumber: number, labels: string[]): Promise<string> {
    const labelString = labels.map((label) => `"${label}"`).join(",");
    await this.executeGhCommand(
      `pr edit ${prNumber} --add-label ${labelString}`
    );
    return `Successfully added labels [${labels.join(
      ", "
    )}] to PR #${prNumber}`;
  }

  /**
   * Remove labels from PR
   */
  async removeLabels(prNumber: number, labels: string[]): Promise<string> {
    const labelString = labels.map((label) => `"${label}"`).join(",");
    await this.executeGhCommand(
      `pr edit ${prNumber} --remove-label ${labelString}`
    );
    return `Successfully removed labels [${labels.join(
      ", "
    )}] from PR #${prNumber}`;
  }

  /**
   * Get PR diff summary
   */
  async getPRDiff(prNumber: number, maxFiles: number = 20): Promise<string> {
    const command = `pr diff ${prNumber} --name-only`;
    const filesResult = await this.executeGhCommand(command);
    const files = filesResult
      .split("\n")
      .filter((f) => f.trim())
      .slice(0, maxFiles);

    const statsCommand = `pr view ${prNumber} --json additions,deletions,changedFiles`;
    const statsResult = await this.executeGhCommand(statsCommand);
    const stats = JSON.parse(statsResult);

    let summary = `## Diff Summary for PR #${prNumber}\n\n`;
    summary += `**Files Changed:** ${stats.changedFiles || files.length}\n`;
    summary += `**Lines Added:** +${stats.additions || 0}\n`;
    summary += `**Lines Deleted:** -${stats.deletions || 0}\n\n`;
    summary += `**Modified Files:**\n`;
    files.forEach((file) => {
      summary += `- ${file}\n`;
    });

    if (files.length >= maxFiles && stats.changedFiles > maxFiles) {
      summary += `\n... and ${stats.changedFiles - maxFiles} more files\n`;
    }

    return summary;
  }

  /**
   * Get PR diff summary with file statistics
   */
  async getPRDiffSummary(
    prNumber: number,
    _includeFileStats: boolean = true,
    maxFiles: number = 20
  ): Promise<string> {
    // _includeFileStats parameter is kept for API compatibility but not used in current implementation
    return await this.getPRDiff(prNumber, maxFiles);
  }

  /**
   * Get PR statistics for a time period
   */
  async getPRStats(period: "day" | "week" | "month"): Promise<PRStats> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Get merged PRs for the period
    let command = `pr list --author "@me" --state merged --limit 100`;
    command += ` --json number,title,mergedAt,additions,deletions,changedFiles,headRepository`;

    const jsonOutput = await this.executeGhCommand(command);
    const allPrs = JSON.parse(jsonOutput);

    // Filter PRs within the time period
    const periodPrs = allPrs.filter((pr: any) => {
      const mergedAt = new Date(pr.mergedAt);
      return mergedAt >= startDate && mergedAt <= now;
    });

    // Calculate statistics
    const totalMerged = periodPrs.length;
    const totalLinesAdded = periodPrs.reduce(
      (sum: number, pr: any) => sum + (pr.additions || 0),
      0
    );
    const totalLinesDeleted = periodPrs.reduce(
      (sum: number, pr: any) => sum + (pr.deletions || 0),
      0
    );
    const totalFilesChanged = periodPrs.reduce(
      (sum: number, pr: any) => sum + (pr.changedFiles || 0),
      0
    );
    const averagePRSize =
      totalMerged > 0
        ? Math.round((totalLinesAdded + totalLinesDeleted) / totalMerged)
        : 0;

    // Repository breakdown - get current repository name
    let currentRepoName = "unknown";
    try {
      const repoInfoCommand = `repo view --json name`;
      const repoInfo = await this.executeGhCommand(repoInfoCommand);
      const repoData = JSON.parse(repoInfo);
      currentRepoName = repoData.name || "unknown";
    } catch (error) {
      // Fallback: try to get repo name from git remote
      try {
        const { stdout } = await execAsync("git remote get-url origin");
        const match = stdout.match(
          /github\.com[\/:]([^\/]+)\/([^\/\s]+?)(?:\.git)?$/
        );
        if (match && match[2]) {
          currentRepoName = match[2];
        }
      } catch {
        // Keep default "unknown"
      }
    }

    const repoStats: Record<string, number> = {};
    periodPrs.forEach((pr: any) => {
      const repoName = pr.headRepository?.name || currentRepoName;
      if (repoName) {
        repoStats[repoName] = (repoStats[repoName] || 0) + 1;
      }
    });

    const topRepositories = Object.entries(repoStats)
      .map(([repo, count]) => ({
        repo,
        count,
        percentage:
          totalMerged > 0 ? Math.round((count / totalMerged) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily breakdown
    const dailyStats: Record<string, number> = {};
    periodPrs.forEach((pr: any) => {
      const date = new Date(pr.mergedAt).toISOString().split("T")[0];
      if (date) {
        dailyStats[date] = (dailyStats[date] || 0) + 1;
      }
    });

    const prsByDay = Object.entries(dailyStats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      period,
      totalMerged,
      totalLinesAdded,
      totalLinesDeleted,
      totalFilesChanged,
      averagePRSize,
      topRepositories,
      prsByDay,
      periodStart: startDate.toISOString(),
      periodEnd: now.toISOString(),
    };
  }

  /**
   * Get all comments on a PR including general, review, and inline comments
   */
  async getPRComments(params: {
    prNumber: number;
    includeGeneralComments?: boolean;
    includeReviewComments?: boolean;
    includeInlineComments?: boolean;
    includeResolved?: boolean;
    filterByAuthor?: string;
    maxComments?: number;
  }): Promise<PRComment[]> {
    const [owner, repo] = this.parseRepoUrl();

    // Build GraphQL query
    const query = `
      query($owner: String!, $repo: String!, $prNumber: Int!, $maxComments: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $prNumber) {
            ${
              params.includeGeneralComments !== false
                ? `
            comments(first: $maxComments) {
              nodes {
                id
                author { login avatarUrl }
                body
                createdAt
                updatedAt
                url
              }
            }`
                : ""
            }
            ${
              params.includeReviewComments !== false
                ? `
            reviews(first: $maxComments) {
              nodes {
                id
                author { login avatarUrl }
                body
                state
                createdAt
                submittedAt
                url
                ${
                  params.includeInlineComments !== false
                    ? `
                comments(first: 100) {
                  nodes {
                    id
                    author { login avatarUrl }
                    body
                    path
                    line
                    startLine
                    position
                    diffHunk
                    createdAt
                    url
                  }
                }`
                    : ""
                }
              }
            }`
                : ""
            }
            ${
              params.includeInlineComments !== false
                ? `
            reviewThreads(first: 100) {
              nodes {
                id
                isResolved
                comments(first: 50) {
                  nodes {
                    id
                    author { login avatarUrl }
                    body
                    path
                    line
                    startLine
                    diffHunk
                    createdAt
                    url
                  }
                }
              }
            }`
                : ""
            }
          }
        }
      }
    `;

    const variables = {
      owner,
      repo,
      prNumber: params.prNumber,
      maxComments: params.maxComments || 100,
    };

    // Execute GraphQL query
    const result = await this.executeGraphQLQuery(query, variables);

    // Parse and normalize the response
    return this.normalizeCommentsResponse(result, params);
  }

  /**
   * Parse repository URL to extract owner and repo name
   */
  private parseRepoUrl(): [string, string] {
    // Handles formats: "owner/repo", "https://github.com/owner/repo", "git@github.com:owner/repo.git"
    const match = this.repo.match(
      /(?:github\.com[:/])?([^/]+)\/([^/.]+)(?:\.git)?$/
    );
    if (!match) throw new Error(`Invalid repository URL: ${this.repo}`);
    return [match[1]!, match[2]!];
  }

  /**
   * Execute a GraphQL query using gh api graphql
   */
  private async executeGraphQLQuery(
    query: string,
    variables: Record<string, any>
  ): Promise<any> {
    // Escape single quotes in the query
    const escapedQuery = query.replace(/'/g, "'\\''");

    // Build variable flags
    const variableFlags = Object.entries(variables)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `-F ${key}=${value}`;
        }
        return `-F ${key}=${value}`;
      })
      .join(" ");

    const command = `api graphql -f query='${escapedQuery}' ${variableFlags}`;
    const result = await this.executeGhCommand(command);
    return JSON.parse(result);
  }

  /**
   * Normalize GraphQL response into PRComment array
   */
  private normalizeCommentsResponse(
    data: any,
    params: {
      prNumber: number;
      includeGeneralComments?: boolean;
      includeReviewComments?: boolean;
      includeInlineComments?: boolean;
      includeResolved?: boolean;
      filterByAuthor?: string;
      maxComments?: number;
    }
  ): PRComment[] {
    const comments: PRComment[] = [];
    const pr = data?.data?.repository?.pullRequest;

    if (!pr) {
      throw new Error("Failed to fetch PR data from GraphQL");
    }

    // Add general comments
    if (pr.comments?.nodes) {
      pr.comments.nodes.forEach((comment: any) => {
        if (this.shouldIncludeComment(comment, params)) {
          comments.push({
            id: comment.id,
            type: "general",
            author: comment.author || { login: "unknown" },
            body: comment.body || "",
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            url: comment.url,
          });
        }
      });
    }

    // Add review comments
    if (pr.reviews?.nodes) {
      pr.reviews.nodes.forEach((review: any) => {
        if (this.shouldIncludeComment(review, params)) {
          // Add top-level review
          if (review.body) {
            comments.push({
              id: review.id,
              type: "review",
              author: review.author || { login: "unknown" },
              body: review.body,
              createdAt: review.submittedAt || review.createdAt,
              reviewState: review.state,
              url: review.url,
            });
          }

          // Add inline comments from review
          if (review.comments?.nodes) {
            review.comments.nodes.forEach((comment: any) => {
              if (this.shouldIncludeComment(comment, params)) {
                comments.push({
                  id: comment.id,
                  type: "inline",
                  author: comment.author || { login: "unknown" },
                  body: comment.body || "",
                  createdAt: comment.createdAt,
                  path: comment.path,
                  line: comment.line,
                  startLine: comment.startLine,
                  position: comment.position,
                  diffHunk: comment.diffHunk,
                  url: comment.url,
                });
              }
            });
          }
        }
      });
    }

    // Add review thread comments with resolution status
    if (pr.reviewThreads?.nodes) {
      pr.reviewThreads.nodes.forEach((thread: any) => {
        if (params.includeResolved || !thread.isResolved) {
          thread.comments.nodes.forEach((comment: any) => {
            if (this.shouldIncludeComment(comment, params)) {
              // Avoid duplicates by checking if comment already exists
              const exists = comments.some((c) => c.id === comment.id);
              if (!exists) {
                comments.push({
                  id: comment.id,
                  type: "inline",
                  author: comment.author || { login: "unknown" },
                  body: comment.body || "",
                  createdAt: comment.createdAt,
                  path: comment.path,
                  line: comment.line,
                  startLine: comment.startLine,
                  diffHunk: comment.diffHunk,
                  isResolved: thread.isResolved,
                  threadId: thread.id,
                  url: comment.url,
                });
              }
            }
          });
        }
      });
    }

    return comments;
  }

  /**
   * Check if a comment should be included based on filters
   */
  private shouldIncludeComment(
    comment: any,
    params: {
      filterByAuthor?: string;
    }
  ): boolean {
    // Filter by author if specified
    if (params.filterByAuthor && comment.author?.login !== params.filterByAuthor) {
      return false;
    }
    return true;
  }
}
