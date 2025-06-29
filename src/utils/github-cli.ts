/**
 * GitHub CLI utility functions for pr-buddy
 * Author: Shivaraj Bakale
 */

import { exec } from "child_process";
import { promisify } from "util";
import { GitHubPR, GitHubCliError, PRStats } from "../types/index.js";

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
   * List user's PRs
   */
  async listMyPRs(
    state: string = "open",
    limit: number = 10
  ): Promise<GitHubPR[]> {
    const command = `pr list --author "@me" --state ${state} --limit ${limit} --json number,title,body,state,author,url,headRefName,baseRefName,createdAt,updatedAt,labels,isDraft`;
    const result = await this.executeGhCommand(command);
    const prsData = JSON.parse(result);

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
      additions: 0,
      deletions: 0,
      changedFiles: 0,
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
}
