/**
 * SimpleTextEditor component
 * A clean, simple text editor with markdown support and live preview
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import MarkdownViewer from './MarkdownViewer';

export default function SimpleTextEditor({ 
  value = '', 
  onChange,
  onAutoSave,
  autoSaveDelay = 2000,
  placeholder = 'Start writing...',
  readOnly = false 
}) {
  const { theme } = useTheme();
  const [content, setContent] = useState(value);
  const [isPreview, setIsPreview] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedContentRef = useRef(value);

  // Update content when value prop changes
  useEffect(() => {
    if (value !== content) {
      setContent(value);
      lastSavedContentRef.current = value;
      updateCounts(value);
    }
  }, [value]);

  // Update word/character counts
  const updateCounts = useCallback((text) => {
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, []);

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
    updateCounts(newContent);
    
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
  }, [onChange, onAutoSave, autoSaveDelay, triggerAutoSave, updateCounts]);

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

    // Ctrl/Cmd + P for preview toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      setIsPreview(!isPreview);
    }

    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      
      if (onChange) {
        onChange(newContent);
      }
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }, [triggerAutoSave, isPreview, content, onChange]);

  // Quick format buttons
  const quickFormats = [
    {
      label: 'Bold',
      icon: 'B',
      shortcut: 'Ctrl+B',
      format: (text) => `**${text}**`,
      className: 'font-bold'
    },
    {
      label: 'Italic',
      icon: 'I',
      shortcut: 'Ctrl+I', 
      format: (text) => `*${text}*`,
      className: 'italic'
    },
    {
      label: 'Heading',
      icon: 'H1',
      format: (text) => `# ${text}`
    },
    {
      label: 'List',
      icon: '•',
      format: (text) => `- ${text}`
    },
    {
      label: 'Quote',
      icon: '"',
      format: (text) => `> ${text}`
    },
    {
      label: 'Code',
      icon: '</>',
      format: (text) => `\`${text}\``
    }
  ];

  // Apply formatting
  const applyFormat = useCallback((formatFn) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const formattedText = formatFn(selectedText || 'text');
    
    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      {!readOnly && (
        <div className={`
          flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
        `}>
          <div className="flex items-center gap-1">
            {quickFormats.map((format, index) => (
              <button
                key={index}
                onClick={() => applyFormat(format.format)}
                title={`${format.label} ${format.shortcut ? `(${format.shortcut})` : ''}`}
                className={`
                  px-3 py-1.5 rounded text-sm font-medium transition-colors
                  ${theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }
                  ${format.className || ''}
                `}
              >
                {format.icon}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`
                px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${isPreview
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }
              `}
            >
              {isPreview ? '📝 Edit' : '👁️ Preview'}
            </button>
          </div>
        </div>
      )}

      {/* Editor/Preview */}
      <div className="flex-1 relative overflow-hidden">
        {isPreview ? (
          <div className={`
            h-full p-6 overflow-y-auto
            ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
          `}>
            <MarkdownViewer content={content} />
          </div>
        ) : (
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`
              w-full h-full p-6 border-0 resize-none focus:outline-none
              text-base leading-relaxed font-mono
              ${theme === 'dark' 
                ? 'bg-gray-900 text-gray-100 placeholder-gray-500' 
                : 'bg-white text-gray-900 placeholder-gray-400'
              }
            `}
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' }}
          />
        )}

        {/* Auto-save indicator */}
        {onAutoSave && !isPreview && (
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

      {/* Stats */}
      <div className={`
        px-6 py-3 text-xs border-t border-gray-200 dark:border-gray-600
        ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}
      `}>
        <div className="flex justify-between items-center">
          <span>
            {charCount} characters • {wordCount} words
          </span>
          {!readOnly && (
            <span className="opacity-75">
              Ctrl+S (save) • Ctrl+P (preview) • Tab (indent)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
