/**
 * MobileNotesList component
 * Mobile-optimized notes list with swipe gestures and pull-to-refresh
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../hooks/useNotes';
import { useSwipeGesture, usePullToRefresh, TouchButton } from '../hooks/useMobile';
import LoadingSpinner from './LoadingSpinner';

export default function MobileNotesList() {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    notes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    showFavoritesOnly,
    setShowFavoritesOnly,
    categories,
    stats,
    deleteNote,
    toggleFavorite,
    loadNotes
  } = useNotes();

  const [swipedNoteId, setSwipedNoteId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Pull to refresh
  const { isPulling, pullDistance, isTriggered, handlers } = usePullToRefresh(
    useCallback(async () => {
      await loadNotes();
    }, [loadNotes])
  );

  // Format date for mobile
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Truncate content for mobile
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Handle note deletion
  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      setDeleteConfirm(null);
      setSwipedNoteId(null);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (noteId) => {
    try {
      await toggleFavorite(noteId);
      setSwipedNoteId(null);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Create swipe handlers for each note
  const createSwipeHandlers = (noteId) => useSwipeGesture(
    () => {
      // Swipe left to show actions
      setSwipedNoteId(noteId);
    },
    () => {
      // Swipe right to hide actions
      setSwipedNoteId(null);
    },
    30 // Lower threshold for easier swipe
  );

  if (loading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div 
          className={`
            fixed top-0 left-0 right-0 z-10 flex items-center justify-center py-4
            transition-all duration-200 transform
            ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          `}
          style={{ 
            transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
            opacity: pullDistance / 100
          }}
        >
          <div className="flex items-center gap-2">
            <div className={`
              w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full
              ${isTriggered ? 'animate-spin' : ''}
            `} />
            <span className="text-sm">
              {isTriggered ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Header with stats */}
      <div className={`
        px-4 py-3 border-b
        ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Notes
          </h2>
          <TouchButton
            onClick={() => router.push('/dashboard/notes/new')}
            size="small"
            className="px-3 py-1"
          >
            + New
          </TouchButton>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{stats.total} notes</span>
          <span>•</span>
          <span>{stats.favorites} favorites</span>
        </div>
      </div>

      {/* Quick filters */}
      <div className={`
        px-4 py-2 border-b
        ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors
              ${selectedCategory === 'all'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}
          >
            All
          </button>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`
              px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors
              ${showFavoritesOnly
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}
          >
            ⭐ Favorites
          </button>

          {categories.filter(cat => cat !== 'all').map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors
                ${selectedCategory === category
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes list */}
      <div 
        className="flex-1 overflow-y-auto"
        {...handlers}
      >
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notes found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || showFavoritesOnly || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by creating your first note'
              }
            </p>
            <TouchButton
              onClick={() => router.push('/dashboard/notes/new')}
              size="large"
            >
              Create First Note
            </TouchButton>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notes.map(note => {
              const swipeHandlers = createSwipeHandlers(note.id);
              const isSwipedOpen = swipedNoteId === note.id;
              
              return (
                <div key={note.id} className="relative overflow-hidden">
                  {/* Action buttons (revealed on swipe) */}
                  <div className={`
                    absolute right-0 top-0 h-full flex items-center
                    transition-transform duration-200 z-10
                    ${isSwipedOpen ? 'translate-x-0' : 'translate-x-full'}
                  `}>
                    <button
                      onClick={() => handleToggleFavorite(note.id)}
                      className={`
                        h-full px-4 flex items-center justify-center min-w-[60px]
                        ${note.isFavorite 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-500 text-white'
                        }
                      `}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(note.id)}
                      className="h-full px-4 bg-red-500 text-white flex items-center justify-center min-w-[60px]"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Note content */}
                  <div
                    className={`
                      transition-transform duration-200 bg-white dark:bg-gray-800
                      ${isSwipedOpen ? '-translate-x-32' : 'translate-x-0'}
                    `}
                    {...swipeHandlers}
                    onClick={() => {
                      if (isSwipedOpen) {
                        setSwipedNoteId(null);
                      } else {
                        router.push(`/dashboard/notes/${note.id}`);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-base leading-tight line-clamp-2">
                          {note.title || 'Untitled'}
                        </h3>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          {note.isFavorite && (
                            <span className="text-yellow-500 text-sm">⭐</span>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(note.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {note.content && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {truncateContent(note.content)}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {note.category && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                              {note.category}
                            </span>
                          )}
                          {note.tags && note.tags.length > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-gray-300 dark:text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`
            w-full max-w-sm rounded-lg shadow-xl
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          `}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Note
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <TouchButton
                  onClick={() => setDeleteConfirm(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </TouchButton>
                <TouchButton
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </TouchButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
