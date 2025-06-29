/**
 * MarkdownViewer component
 * Renders markdown content with syntax highlighting
 */

import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function MarkdownViewer({ content, className = '' }) {
  const { theme } = useTheme();

  // Simple markdown parser (for basic formatting)
  const parseMarkdown = useMemo(() => {
    if (!content) return '';

    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code inline
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^\s*\* (.+)$/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\s*- (.+)$/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\s*\+ (.+)$/gim, '<li class="ml-4">• $1</li>')
      
      // Numbered lists
      .replace(/^\s*\d+\. (.+)$/gim, '<li class="ml-4 list-decimal">$1</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">$1</blockquote>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');

    // Wrap in paragraph tags
    html = '<p class="mb-4">' + html + '</p>';

    return html;
  }, [content]);

  return (
    <div 
      className={`
        prose dark:prose-invert max-w-none
        ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: parseMarkdown }}
    />
  );
}
