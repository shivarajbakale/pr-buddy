/**
 * File operation handlers for pr-buddy
 * Author: Shivaraj Bakale
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ToolResponse } from '../types/index.js';

export async function handleReadFile(args: { path: string }): Promise<ToolResponse> {
  try {
    const content = await fs.readFile(args.path, 'utf-8');
    return {
      content: [{
        type: 'text',
        text: content,
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error reading file: ${error.message}`,
      }],
    };
  }
}

export async function handleWriteFile(args: { path: string; content: string }): Promise<ToolResponse> {
  try {
    const dir = path.dirname(args.path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(args.path, args.content, 'utf-8');
    return {
      content: [{
        type: 'text',
        text: `Successfully wrote to ${args.path}`,
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error writing file: ${error.message}`,
      }],
    };
  }
}

export async function handleListDirectory(args: { path: string }): Promise<ToolResponse> {
  try {
    const entries = await fs.readdir(args.path, { withFileTypes: true });
    const formatted = entries.map(entry => {
      const type = entry.isDirectory() ? 'directory' : 'file';
      return `${type}: ${entry.name}`;
    }).join('\n');
    
    return {
      content: [{
        type: 'text',
        text: formatted,
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error listing directory: ${error.message}`,
      }],
    };
  }
} 