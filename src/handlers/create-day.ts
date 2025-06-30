import { ToolResponse } from "../types/index.js";

export async function handleCreateDay(args: {
  day: string;
  repo?: string;
}): Promise<ToolResponse> {
  console.log("Creating day for:", args.day);

  // First get the PR's that are open state
  // Get the JIRA tickets that are in progress or not started
  // Get the Todos from the day
  return {
    content: [
      {
        type: "text",
        text: `Creating day for ${args.day}${
          args.repo ? ` in repository ${args.repo}` : ""
        }...`,
      },
    ],
  };
}
