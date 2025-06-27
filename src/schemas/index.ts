/**
 * Schema definitions for pr-buddy
 * Author: Shivaraj Bakale
 */

import { z } from 'zod';

export const SCHEMAS = {
  READ_FILE: {
    title: 'Read File',
    description: 'Read the contents of a file',
    inputSchema: {
      path: z.string().describe('Path to the file to read'),
    },
  },
  WRITE_FILE: {
    title: 'Write File', 
    description: 'Write content to a file',
    inputSchema: {
      path: z.string().describe('Path to the file to write'),
      content: z.string().describe('Content to write to the file'),
    },
  },
  LIST_DIRECTORY: {
    title: 'List Directory',
    description: 'List the contents of a directory',
    inputSchema: {
      path: z.string().describe('Path to the directory to list'),
    },
  },
} as const; 