/**
 * NoteViewer component
 * Dedicated component for viewing notes in read-only mode with markdown rendering
 */

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import MarkdownViewer from './MarkdownViewer';
import { 
  EyeIcon, 
  PencilIcon, 
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function NoteViewer({ 
  note, 
  onEdit, 
  onToggleFavorite, 
  onShare,
  className = '' 
}) {
  const { theme } = useTheme();
  const [shareClicked, setShareClicked] = useState(false);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Select a note to view</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (onShare) {
      setShareClicked(true);
      try {
        await onShare(note);
      } finally {
        setTimeout(() => setShareClicked(false), 2000);
      }
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(note.id);
    }
  };

  return (
    <div className={`note-viewer ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {note.title || 'Untitled Note'}
          </h1>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                note.isFavorite
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {note.isFavorite ? (
                <HeartSolidIcon className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={handleShare}
              className={`p-2 rounded-lg transition-colors ${
                shareClicked
                  ? 'text-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title="Share note"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Last modified: {formatDate(note.updatedAt)}</span>
          </div>
          
          {note.category && (
            <div className="flex items-center space-x-1">
              <TagIcon className="h-4 w-4" />
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                {note.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="note-content">
        {note.content ? (
          <MarkdownViewer 
            content={note.content}
            className="prose prose-lg max-w-none dark:prose-invert prose-gray"
          />
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">This note is empty</p>
            <button
              onClick={onEdit}
              className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Click to add content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
