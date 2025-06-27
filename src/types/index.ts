/**
 * Type definitions for pr-buddy
 * Author: Shivaraj Bakale
 */

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;  
  }>;
} 