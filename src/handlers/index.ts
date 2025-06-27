/**
 * Handler functions for pr-buddy
 * Author: Shivaraj Bakale
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, resolve, relative } from 'path';

const SAFE_BASE_DIR = process.cwd();

export async function handleReadFile({ path }: { path: string }) {
  try {
    const safePath = resolve(SAFE_BASE_DIR, path);
    if (!safePath.startsWith(SAFE_BASE_DIR)) {
      throw new Error('Access denied: Path is outside safe directory');
    }
    
    const content = await readFile(safePath, 'utf-8');
    return {
      content: [{ type: 'text' as const, text: content }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error}` }],
    };
  }
}

export async function handleWriteFile({ path, content }: { path: string; content: string }) {
  try {
    const safePath = resolve(SAFE_BASE_DIR, path);
    if (!safePath.startsWith(SAFE_BASE_DIR)) {
      throw new Error('Access denied: Path is outside safe directory');
    }
    
    await writeFile(safePath, content, 'utf-8');
    return {
      content: [{ type: 'text' as const, text: `Successfully wrote to ${path}` }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error}` }],
    };
  }
}

export async function handleListDirectory({ path }: { path: string }) {
  try {
    const safePath = resolve(SAFE_BASE_DIR, path);
    if (!safePath.startsWith(SAFE_BASE_DIR)) {
      throw new Error('Access denied: Path is outside safe directory');
    }
    
    const entries = await readdir(safePath);
    return {
      content: [{ type: 'text' as const, text: entries.join('\n') }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error}` }],
    };
  }
} 