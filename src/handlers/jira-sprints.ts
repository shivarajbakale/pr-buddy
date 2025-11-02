/**
 * JIRA Sprint handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { ToolResponse } from "../types/index.js";
import { JiraCli } from "../utils/jira-cli.js";
import { JiraSprint, JiraTicket, JiraBoard } from "../types/jira.js";

export async function handleGetJiraSprints(args: {
  site?: string;
  boardId?: number;
  state?: "future" | "active" | "closed" | "all";
  maxResults?: number;
  includeTickets?: boolean;
}): Promise<ToolResponse> {
  try {
    const jiraCli = new JiraCli({
      site: args.site
    });

    // Check authentication
    const isAuth = await jiraCli.checkAuth();
    if (!isAuth) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ACLI not found or not authenticated.\n\nPlease install and authenticate:\n1. Install: npm install -g @atlassian/acli\n2. Login: acli login\n3. Try again`,
          },
        ],
        isError: true,
      };
    }

    const sprints = await jiraCli.listSprints({
      ...(args.boardId !== undefined && { boardId: args.boardId }),
      state: args.state || "all",
      maxResults: args.maxResults || 50,
    });

    if (sprints.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No sprints found matching the criteria.",
          },
        ],
      };
    }

    // Format output
    let output = `# 📅 JIRA Sprints\n\n`;
    output += `**Total Sprints:** ${sprints.length}\n`;
    output += `**Filter:** ${args.state || "all"} sprints${args.boardId ? ` (Board ID: ${args.boardId})` : ""}\n\n`;

    // Group by state
    const active = sprints.filter((s) => s.state === "active");
    const future = sprints.filter((s) => s.state === "future");
    const closed = sprints.filter((s) => s.state === "closed");

    output += `- 🟢 **Active:** ${active.length}\n`;
    output += `- 🔵 **Future:** ${future.length}\n`;
    output += `- ⚪ **Closed:** ${closed.length}\n\n`;

    // Sprints table
    output += `## Sprint List\n\n`;
    output += formatSprintsTable(sprints);

    // If includeTickets, fetch details for active sprints
    if (args.includeTickets && active.length > 0) {
      output += `\n## 🔍 Active Sprint Details\n\n`;
      for (const sprint of active) {
        try {
          const details = await jiraCli.getSprintDetails(sprint.id);
          output += formatSprintDetails(details);
          output += `\n---\n\n`;
        } catch (error) {
          output += `⚠️ Could not fetch details for sprint ${sprint.name}\n\n`;
        }
      }
    }

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error fetching JIRA sprints: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetJiraSprintDetails(args: {
  site?: string;
  sprintId: number;
  groupBy?: "status" | "assignee" | "type" | "priority";
  includeSubtasks?: boolean;
}): Promise<ToolResponse> {
  try {
    const jiraCli = new JiraCli({
      site: args.site
    });

    // Check authentication
    const isAuth = await jiraCli.checkAuth();
    if (!isAuth) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ACLI not found or not authenticated.\n\nPlease install and authenticate:\n1. Install: npm install -g @atlassian/acli\n2. Login: acli login\n3. Try again`,
          },
        ],
        isError: true,
      };
    }

    const details = await jiraCli.getSprintDetails(args.sprintId);

    let output = formatSprintDetails(details, args.groupBy || "status");

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error fetching sprint details: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetJiraBoards(args: {
  site?: string;
  projectKey?: string;
  type?: "scrum" | "kanban";
  maxResults?: number;
}): Promise<ToolResponse> {
  try {
    const jiraCli = new JiraCli({
      site: args.site
    });

    // Check authentication
    const isAuth = await jiraCli.checkAuth();
    if (!isAuth) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ACLI not found or not authenticated.\n\nPlease install and authenticate:\n1. Install: npm install -g @atlassian/acli\n2. Login: acli login\n3. Try again`,
          },
        ],
        isError: true,
      };
    }

    const boards = await jiraCli.listBoards({
      ...(args.projectKey !== undefined && { projectKey: args.projectKey }),
      ...(args.type !== undefined && { type: args.type }),
      maxResults: args.maxResults || 50,
    });

    if (boards.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No boards found matching the criteria.",
          },
        ],
      };
    }

    let output = `# 📊 JIRA Boards\n\n`;
    output += `**Total Boards:** ${boards.length}\n`;
    if (args.projectKey) {
      output += `**Project:** ${args.projectKey}\n`;
    }
    if (args.type) {
      output += `**Type:** ${args.type}\n`;
    }
    output += `\n`;

    output += formatBoardsTable(boards);

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error fetching JIRA boards: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleCreateJiraTicket(args: {
  site?: string;
  project: string;
  type: string;
  summary: string;
  description?: string;
  assignee?: string;
  labels?: string[];
  priority?: string;
  parent?: string;
}): Promise<ToolResponse> {
  try {
    const jiraCli = new JiraCli({
      site: args.site
    });

    // Check authentication
    const isAuth = await jiraCli.checkAuth();
    if (!isAuth) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ACLI not found or not authenticated.\n\nPlease install and authenticate:\n1. Install: npm install -g @atlassian/acli\n2. Login: acli login\n3. Try again`,
          },
        ],
        isError: true,
      };
    }

    const ticket = await jiraCli.createTicket({
      project: args.project,
      type: args.type,
      summary: args.summary,
      ...(args.description !== undefined && { description: args.description }),
      ...(args.assignee !== undefined && { assignee: args.assignee }),
      ...(args.labels !== undefined && { labels: args.labels }),
      ...(args.priority !== undefined && { priority: args.priority }),
      ...(args.parent !== undefined && { parent: args.parent }),
    });

    let output = `# ✅ JIRA Ticket Created Successfully!\n\n`;
    output += `## 🎫 Ticket Details\n\n`;
    output += `| Field | Value |\n`;
    output += `|-------|-------|\n`;
    output += `| **Key** | **${ticket.key}** |\n`;
    output += `| **Summary** | ${ticket.summary} |\n`;
    output += `| **Type** | ${ticket.type} |\n`;
    output += `| **Status** | ${ticket.status} |\n`;
    output += `| **Assignee** | ${ticket.assignee} |\n`;
    output += `| **Priority** | ${ticket.priority} |\n`;

    if (ticket.labels.length > 0) {
      output += `| **Labels** | ${ticket.labels.join(", ")} |\n`;
    }

    if (args.parent) {
      output += `| **Parent** | ${args.parent} |\n`;
    }

    output += `| **Created** | ${new Date(ticket.created).toLocaleString()} |\n`;

    output += `\n💡 **Tip:** Use \`${ticket.key}\` to reference this ticket in PRs and commits.\n`;

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating JIRA ticket: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetMyJiraTickets(args: {
  site?: string;
  status?: string;
  sprint?: "open" | "closed" | "all";
  maxResults?: number;
  groupBy?: "status" | "priority" | "type";
}): Promise<ToolResponse> {
  try {
    const jiraCli = new JiraCli({
      site: args.site
    });

    // Check authentication
    const isAuth = await jiraCli.checkAuth();
    if (!isAuth) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ACLI not found or not authenticated.\n\nPlease install and authenticate:\n1. Install: npm install -g @atlassian/acli\n2. Login: acli login\n3. Try again`,
          },
        ],
        isError: true,
      };
    }

    const tickets = await jiraCli.getMyTickets({
      ...(args.status !== undefined && { status: args.status }),
      ...(args.sprint !== undefined && { sprint: args.sprint }),
      maxResults: args.maxResults || 50,
    });

    if (tickets.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No tickets found matching the criteria.",
          },
        ],
      };
    }

    let output = `# 🎫 My JIRA Tickets\n\n`;
    output += `**Total Tickets:** ${tickets.length}\n`;

    if (args.status) {
      output += `**Status Filter:** ${args.status}\n`;
    }
    if (args.sprint) {
      output += `**Sprint Filter:** ${args.sprint} sprints\n`;
    }
    output += `\n`;

    // Group by status
    const byStatus = {
      todo: tickets.filter((t) => ["To Do", "Open", "Backlog"].includes(t.status)),
      inProgress: tickets.filter((t) => ["In Progress", "In Review", "In QA"].includes(t.status)),
      done: tickets.filter((t) => ["Done", "Closed", "Resolved"].includes(t.status)),
    };

    output += `**Status Breakdown:**\n`;
    output += `- 📋 **To Do:** ${byStatus.todo.length}\n`;
    output += `- 🔄 **In Progress:** ${byStatus.inProgress.length}\n`;
    output += `- ✅ **Done:** ${byStatus.done.length}\n\n`;

    // Story points
    const totalPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = byStatus.done.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    if (totalPoints > 0) {
      output += `**Story Points:** ${completedPoints}/${totalPoints} completed\n\n`;
    }

    output += `## 📝 Ticket List\n\n`;
    output += formatTicketsTable(tickets, args.groupBy || "status");

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error fetching my JIRA tickets: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

// Helper functions

function formatSprintsTable(sprints: JiraSprint[]): string {
  let table = "| State | Name | Board ID | Start Date | End Date | Goal |\n";
  table += "|-------|------|----------|------------|----------|------|\n";

  sprints.forEach((sprint) => {
    const stateIcon = {
      active: "🟢",
      future: "🔵",
      closed: "⚪",
      unknown: "❓",
    }[sprint.state];

    const startDate = sprint.startDate
      ? new Date(sprint.startDate).toLocaleDateString()
      : "Not set";
    const endDate = sprint.endDate
      ? new Date(sprint.endDate).toLocaleDateString()
      : "Not set";
    const goal = sprint.goal || "-";

    // Escape pipes
    const escapePipes = (text: string) => text.replace(/\|/g, "\\|");

    table += `| ${stateIcon} ${sprint.state} | ${escapePipes(sprint.name)} | ${sprint.boardId} | ${startDate} | ${endDate} | ${escapePipes(goal)} |\n`;
  });

  return table;
}

function formatSprintDetails(
  details: {
    sprint: JiraSprint;
    tickets: JiraTicket[];
    stats: {
      total: number;
      completed: number;
      inProgress: number;
      todo: number;
      storyPoints?: number;
      completedPoints?: number;
    };
  },
  groupBy: string = "status"
): string {
  const { sprint, tickets, stats } = details;

  let output = `### 🏃 ${sprint.name}\n\n`;

  // Sprint info
  if (sprint.goal) {
    output += `**🎯 Goal:** ${sprint.goal}\n\n`;
  }

  const startDate = sprint.startDate
    ? new Date(sprint.startDate).toLocaleDateString()
    : "Not set";
  const endDate = sprint.endDate
    ? new Date(sprint.endDate).toLocaleDateString()
    : "Not set";

  output += `**📅 Duration:** ${startDate} → ${endDate}\n`;
  output += `**📊 State:** ${sprint.state}\n\n`;

  // Progress stats
  output += `#### 📈 Progress\n\n`;
  output += `- **Total Tickets:** ${stats.total}\n`;
  output += `- ✅ **Completed:** ${stats.completed} (${Math.round((stats.completed / stats.total) * 100)}%)\n`;
  output += `- 🔄 **In Progress:** ${stats.inProgress}\n`;
  output += `- 📋 **To Do:** ${stats.todo}\n`;

  if (stats.storyPoints && stats.storyPoints > 0) {
    const pointsCompletion = stats.completedPoints && stats.storyPoints > 0
      ? Math.round((stats.completedPoints / stats.storyPoints) * 100)
      : 0;
    output += `\n**Story Points:**\n`;
    output += `- Total: ${stats.storyPoints}\n`;
    output += `- Completed: ${stats.completedPoints || 0} (${pointsCompletion}%)\n`;
  }

  output += `\n#### 🎫 Tickets\n\n`;
  output += formatTicketsTable(tickets, groupBy);

  return output;
}

function formatTicketsTable(
  tickets: JiraTicket[],
  groupBy: string = "status"
): string {
  if (tickets.length === 0) {
    return "_No tickets in this sprint._\n";
  }

  let table = "| Key | Summary | Status | Assignee | Type | Points | Priority |\n";
  table += "|-----|---------|--------|----------|------|--------|----------|\n";

  // Sort by groupBy field
  const sortedTickets = [...tickets].sort((a, b) => {
    switch (groupBy) {
      case "assignee":
        return a.assignee.localeCompare(b.assignee);
      case "type":
        return a.type.localeCompare(b.type);
      case "priority":
        return a.priority.localeCompare(b.priority);
      case "status":
      default:
        return a.status.localeCompare(b.status);
    }
  });

  sortedTickets.forEach((ticket) => {
    // Status icon
    const statusIcon = ["Done", "Closed", "Resolved"].includes(ticket.status)
      ? "✅"
      : ["In Progress", "In Review", "In QA"].includes(ticket.status)
        ? "🔄"
        : "📋";

    // Truncate summary
    const summary =
      ticket.summary.length > 50
        ? ticket.summary.substring(0, 50) + "..."
        : ticket.summary;

    // Escape pipes
    const escapePipes = (text: string) => text.replace(/\|/g, "\\|");

    const points = ticket.storyPoints || "-";

    table += `| ${ticket.key} | ${escapePipes(summary)} | ${statusIcon} ${ticket.status} | ${escapePipes(ticket.assignee)} | ${ticket.type} | ${points} | ${ticket.priority} |\n`;
  });

  return table;
}

function formatBoardsTable(boards: JiraBoard[]): string {
  let table = "| ID | Name | Type | Project |\n";
  table += "|----|------|------|----------|\n";

  boards.forEach((board) => {
    const typeIcon = board.type === "scrum" ? "🏃" : "📋";
    const escapePipes = (text: string) => text.replace(/\|/g, "\\|");

    table += `| ${board.id} | ${escapePipes(board.name)} | ${typeIcon} ${board.type} | ${board.projectKey} |\n`;
  });

  return table;
}

/**
 * Update JIRA ticket status (transition)
 */
export async function handleUpdateJiraTicketStatus(args: {
  site?: string;
  ticketKey: string;
  status: string;
}): Promise<ToolResponse> {
  try {
    const jiraCli = new JiraCli({
      site: args.site,
    });

    // Check authentication
    const isAuth = await jiraCli.checkAuth();
    if (!isAuth) {
      return {
        content: [
          {
            type: "text",
            text: `❌ ACLI not found or not authenticated.\n\nPlease install and authenticate:\n1. Install: npm install -g @atlassian/acli\n2. Login: acli login\n3. Try again`,
          },
        ],
        isError: true,
      };
    }

    // Transition the ticket
    const result = await jiraCli.transitionTicket({
      ticketKey: args.ticketKey,
      status: args.status,
    });

    // Format output
    let output = `✅ Ticket status updated successfully!\n\n`;
    output += `| Field | Value |\n`;
    output += `|-------|-------|\n`;
    output += `| Ticket | ${result.ticketKey} |\n`;
    output += `| Previous Status | ${result.previousStatus} |\n`;
    output += `| New Status | ${result.newStatus} |\n`;

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error) {
    console.error("Error updating JIRA ticket status:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error updating ticket status: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
}
