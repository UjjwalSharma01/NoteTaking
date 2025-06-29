/**
 * QuickNoteEditor component
 * A quick note editor for the dashboard that uses SimpleTextEditor
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotes } from '../hooks/useNotes';
import SimpleTextEditor from './SimpleTextEditor';
import LoadingSpinner from './LoadingSpinner';
import { 
  PlusIcon, 
  XMarkIcon, 
  CheckIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

export default function QuickNoteEditor({ className = '' }) {
  const { createNote } = useNotes();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = useCallback(async () => {
    if (!content.trim() && !title.trim()) {
      setError('Please add some content or a title');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const noteData = {
        title: title.trim() || 'Quick Note',
        content: content.trim(),
        category: 'general'
      };
      
      const newNote = await createNote(noteData);
      
      // Reset form
      setContent('');
      setTitle('');
      setIsOpen(false);
      
      // Navigate to the new note
      router.push(`/dashboard/notes/${newNote.id}`);
    } catch (err) {
      console.error('Error creating quick note:', err);
      setError(err.message || 'Failed to create note');
    } finally {
      setIsSaving(false);
    }
  }, [content, title, createNote, router]);

  const handleCancel = useCallback(() => {
    setContent('');
    setTitle('');
    setError(null);
    setIsOpen(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  }, [handleCancel, handleSave]);

  if (!isOpen) {
    return (
      <div className={`quick-note-trigger ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 group-hover:text-blue-500">
            <PlusIcon className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Create a quick note</p>
            <p className="text-xs mt-1">Click here or press Ctrl+N</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`quick-note-editor ${className}`} onKeyDown={handleKeyDown}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900 dark:text-white">Quick Note</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving || (!content.trim() && !title.trim())}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            
            <button
              onClick={handleCancel}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="w-full px-3 py-2 mb-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Content editor */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <SimpleTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your note..."
              className="min-h-[200px]"
            />
          </div>
          
          {/* Help text */}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tip: Use Ctrl+Enter to save quickly, or Escape to cancel
          </p>
        </div>
      </div>
    </div>
  );
}
