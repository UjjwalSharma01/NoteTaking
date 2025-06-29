/**
 * NotesList component
 * Dashboard for displaying and managing notes
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../hooks/useNotes';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

export default function NotesList() {
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
    toggleFavorite
  } = useNotes();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('updatedAt'); // 'updatedAt', 'createdAt', 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Sort and filter notes
  const sortedNotes = useMemo(() => {
    let sorted = [...notes];
    
    // Sort
    sorted.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'title') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortBy.includes('At')) {
        aValue = new Date(aValue?.seconds ? aValue.seconds * 1000 : aValue);
        bValue = new Date(bValue?.seconds ? bValue.seconds * 1000 : bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sorted;
  }, [notes, sortBy, sortOrder]);

  // Handle note deletion
  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (noteId) => {
    try {
      await toggleFavorite(noteId);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {stats.total} notes • {stats.favorites} favorites
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/notes/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            New Note
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
      </div>

      {/* Filters and Search */}
      <div className={`
        p-4 rounded-lg mb-6 space-y-4
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
      `}>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
            className={`
              w-full pl-10 pr-4 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`
              px-3 py-2 rounded border
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Favorites Filter */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Favorites only</span>
          </label>

          {/* Sort Options */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className={`
              px-3 py-2 rounded border
              ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="createdAt-desc">Recently Created</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>

          {/* View Mode */}
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                px-3 py-2 text-sm
                ${viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`
                px-3 py-2 text-sm
                ${viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Notes Grid/List */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No notes found</h3>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchTerm || showFavoritesOnly || selectedCategory !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Start by creating your first note'
            }
          </p>
          <button
            onClick={() => router.push('/dashboard/notes/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Note
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {sortedNotes.map(note => (
            <div
              key={note.id}
              className={`
                border rounded-lg p-4 transition-all hover:shadow-lg cursor-pointer
                ${theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 hover:bg-gray-750'
                  : 'border-gray-200 bg-white hover:shadow-md'
                }
                ${viewMode === 'list' ? 'flex items-center gap-4' : ''}
              `}
              onClick={() => router.push(`/dashboard/notes/${note.id}`)}
            >
              {/* Note Content */}
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate pr-2">
                    {note.title || 'Untitled'}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(note.id);
                      }}
                      className={`
                        p-1 rounded transition-colors
                        ${note.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}
                      `}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(note.id);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {viewMode === 'grid' && (
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {truncateContent(note.content)}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 rounded-full
                      ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {note.category || 'default'}
                    </span>
                    {note.tags && note.tags.length > 0 && (
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`
            max-w-md w-full mx-4 p-6 rounded-lg
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          `}>
            <h3 className="text-lg font-semibold mb-4">Delete Note</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`
                  px-4 py-2 rounded transition-colors
                  ${theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
