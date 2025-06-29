/**
 * NoteEditor component
 * Interface for creating and editing notes
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../hooks/useNotes';
import RichTextEditor from './RichTextEditor';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

export default function NoteEditor({ noteId = null, onSave, onCancel }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { createNote, updateNote, notes } = useNotes();
  
  const [note, setNote] = useState({
    title: '',
    content: '',
    category: 'default',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Load existing note if editing
  useEffect(() => {
    if (noteId && notes.length > 0) {
      const existingNote = notes.find(n => n.id === noteId);
      if (existingNote) {
        setNote({
          title: existingNote.title || '',
          content: existingNote.content || '',
          category: existingNote.category || 'default',
          tags: existingNote.tags || []
        });
      }
    }
  }, [noteId, notes]);

  // Auto-save functionality
  const handleAutoSave = useCallback(async (content) => {
    if (!noteId || !isDirty) return;
    
    try {
      await updateNote(noteId, { ...note, content });
      setSuccess('Auto-saved');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [noteId, note, updateNote, isDirty]);

  // Handle input changes
  const handleChange = useCallback((field, value) => {
    setNote(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setError(null);
  }, []);

  // Handle tag addition
  const handleAddTag = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !note.tags.includes(tag)) {
        handleChange('tags', [...note.tags, tag]);
      }
      setTagInput('');
    }
  }, [tagInput, note.tags, handleChange]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove) => {
    handleChange('tags', note.tags.filter(tag => tag !== tagToRemove));
  }, [note.tags, handleChange]);

  // Save note
  const handleSave = useCallback(async () => {
    if (!note.title.trim()) {
      setError('Please enter a title for your note');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (noteId) {
        // Update existing note
        await updateNote(noteId, note);
        setSuccess('Note updated successfully');
      } else {
        // Create new note
        const newNote = await createNote(note);
        setSuccess('Note created successfully');
        
        // Redirect to the new note or call onSave
        if (onSave) {
          onSave(newNote);
        } else {
          router.push(`/dashboard/notes/${newNote.id}`);
        }
      }

      setIsDirty(false);
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  }, [note, noteId, createNote, updateNote, onSave, router]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [isDirty, onCancel, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {noteId ? 'Edit Note' : 'Create New Note'}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !note.title.trim()}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                bg-blue-600 text-white hover:bg-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              `}
            >
              {saving && <LoadingSpinner size="sm" />}
              {saving ? 'Saving...' : (noteId ? 'Update' : 'Create')}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess(null)} />
        )}
      </div>

      {/* Note Form */}
      <div className={`
        border rounded-lg overflow-hidden
        ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}
      `}>
        {/* Title */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <input
            type="text"
            value={note.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Note title..."
            className={`
              w-full text-xl font-semibold bg-transparent border-0 focus:outline-none
              ${theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
            `}
          />
        </div>

        {/* Metadata */}
        <div className={`
          p-4 border-b border-gray-200 dark:border-gray-600 space-y-4
          ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}
        `}>
          <div className="flex gap-4">
            {/* Category */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={note.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`
                  w-full px-3 py-2 rounded border
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                <option value="default">Default</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="ideas">Ideas</option>
                <option value="todo">To-Do</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="space-y-2">
              {/* Tag input */}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter or comma to add)..."
                className={`
                  w-full px-3 py-2 rounded border
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
              
              {/* Tag list */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                        ${theme === 'dark'
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-blue-100 text-blue-800'
                        }
                      `}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-xs hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <RichTextEditor
          value={note.content}
          onChange={(content) => handleChange('content', content)}
          onAutoSave={handleAutoSave}
          placeholder="Start writing your note..."
        />
      </div>

      {/* Keyboard shortcuts help */}
      <div className={`
        mt-4 text-xs text-center opacity-75
        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
      `}>
        Tip: Use Ctrl+S to save, Ctrl+B for bold, Ctrl+I for italic
      </div>
    </div>
  );
}
