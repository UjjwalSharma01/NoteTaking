/**
 * RichTextEditor component
 * A rich text editor with auto-save functionality
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function RichTextEditor({ 
  value = '', 
  onChange,
  onAutoSave,
  autoSaveDelay = 2000,
  placeholder = 'Start writing...',
  readOnly = false 
}) {
  const { theme } = useTheme();
  const [content, setContent] = useState(value);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedContentRef = useRef(value);

  // Update content when value prop changes
  useEffect(() => {
    if (value !== content) {
      setContent(value);
      lastSavedContentRef.current = value;
    }
  }, [value]);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (onAutoSave && content !== lastSavedContentRef.current) {
      onAutoSave(content);
      lastSavedContentRef.current = content;
      setLastSaved(new Date());
      setIsTyping(false);
    }
  }, [content, onAutoSave]);

  // Handle content change
  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsTyping(true);
    
    if (onChange) {
      onChange(newContent);
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    if (onAutoSave) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        triggerAutoSave();
      }, autoSaveDelay);
    }
  }, [onChange, onAutoSave, autoSaveDelay, triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ctrl/Cmd + S for manual save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      triggerAutoSave();
    }

    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertFormatting('**', '**', 'bold text');
    }

    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertFormatting('*', '*', 'italic text');
    }

    // Ctrl/Cmd + K for link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      insertFormatting('[', '](url)', 'link text');
    }
  }, [triggerAutoSave]);

  // Insert formatting around selection
  const insertFormatting = useCallback((before, after, placeholder) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  // Toolbar actions
  const toolbarActions = [
    {
      label: 'Bold',
      icon: 'B',
      shortcut: 'Ctrl+B',
      action: () => insertFormatting('**', '**', 'bold text'),
      className: 'font-bold'
    },
    {
      label: 'Italic',
      icon: 'I',
      shortcut: 'Ctrl+I',
      action: () => insertFormatting('*', '*', 'italic text'),
      className: 'italic'
    },
    {
      label: 'Heading',
      icon: 'H',
      action: () => insertFormatting('## ', '', 'Heading'),
    },
    {
      label: 'Link',
      icon: '🔗',
      shortcut: 'Ctrl+K',
      action: () => insertFormatting('[', '](url)', 'link text'),
    },
    {
      label: 'List',
      icon: '•',
      action: () => insertFormatting('- ', '', 'list item'),
    },
    {
      label: 'Quote',
      icon: '"',
      action: () => insertFormatting('> ', '', 'quote'),
    },
    {
      label: 'Code',
      icon: '</>',
      action: () => insertFormatting('`', '`', 'code'),
    }
  ];

  return (
    <div className="w-full">
      {/* Toolbar */}
      {!readOnly && (
        <div className={`
          flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
        `}>
          {toolbarActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              title={`${action.label} ${action.shortcut ? `(${action.shortcut})` : ''}`}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${theme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }
                ${action.className || ''}
              `}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`
            w-full min-h-[400px] p-4 border-0 resize-none focus:outline-none
            font-mono text-sm leading-relaxed
            ${theme === 'dark' 
              ? 'bg-gray-900 text-gray-100 placeholder-gray-500' 
              : 'bg-white text-gray-900 placeholder-gray-400'
            }
          `}
        />

        {/* Status */}
        {onAutoSave && (
          <div className={`
            absolute bottom-4 right-4 text-xs px-2 py-1 rounded
            ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}
          `}>
            {isTyping ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                Typing...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Not saved
              </span>
            )}
          </div>
        )}
      </div>

      {/* Word count */}
      <div className={`
        px-4 py-2 text-xs border-t border-gray-200 dark:border-gray-600
        ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}
      `}>
        <div className="flex justify-between items-center">
          <span>
            {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
          </span>
          {!readOnly && (
            <span className="text-xs opacity-75">
              Shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link), Ctrl+S (save)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
