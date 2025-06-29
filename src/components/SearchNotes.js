/**
 * SearchNotes component
 * Advanced search functionality for notes
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../hooks/useNotes';

export default function SearchNotes({ 
  onClose,
  isOpen = false,
  initialQuery = ''
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const { notes, allTags, categories } = useNotes();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim() && selectedCategory === 'all' && selectedTags.length === 0) {
      return [];
    }

    let filtered = notes;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        selectedTags.some(tag => note.tags?.includes(tag))
      );
    }

    // Search by query
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
      
      filtered = filtered.filter(note => {
        const titleText = (note.title || '').toLowerCase();
        const contentText = (note.content || '').toLowerCase();
        const tagsText = (note.tags || []).join(' ').toLowerCase();
        const categoryText = (note.category || '').toLowerCase();
        
        const allText = `${titleText} ${contentText} ${tagsText} ${categoryText}`;
        
        return searchTerms.every(term => allText.includes(term));
      }).map(note => {
        // Calculate relevance score
        const titleText = (note.title || '').toLowerCase();
        const contentText = (note.content || '').toLowerCase();
        
        let score = 0;
        searchTerms.forEach(term => {
          // Title matches are more important
          if (titleText.includes(term)) {
            score += titleText === term ? 10 : 5;
          }
          // Content matches
          if (contentText.includes(term)) {
            score += 1;
          }
          // Tag matches
          if (note.tags?.some(tag => tag.toLowerCase().includes(term))) {
            score += 3;
          }
        });
        
        return { ...note, _score: score };
      });
    }

    // Sort results
    switch (sortBy) {
      case 'relevance':
        filtered.sort((a, b) => (b._score || 0) - (a._score || 0));
        break;
      case 'date':
        filtered.sort((a, b) => {
          const aDate = new Date(a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : a.updatedAt);
          const bDate = new Date(b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : b.updatedAt);
          return bDate - aDate;
        });
        break;
      case 'title':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [notes, query, selectedCategory, selectedTags, sortBy]);

  // Handle tag toggle
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedTags([]);
  };

  // Highlight search terms
  const highlightText = (text, terms) => {
    if (!text || !terms || terms.length === 0) return text;
    
    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  };

  // Truncate content
  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Handle note click
  const handleNoteClick = (noteId) => {
    router.push(`/dashboard/notes/${noteId}`);
    if (onClose) onClose();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (onClose) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className={`
        w-full max-w-3xl mx-4 rounded-lg shadow-xl max-h-[80vh] flex flex-col
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search notes..."
                className={`
                  w-full pl-10 pr-4 py-3 rounded-lg border text-lg
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                🔍
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-4 py-3 rounded-lg border transition-colors
                ${showFilters
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Filters
            </button>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`
                    px-3 py-1 rounded border text-sm
                    ${theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`
                    px-3 py-1 rounded border text-sm
                    ${theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                </select>

                {/* Clear Filters */}
                {(query || selectedCategory !== 'all' || selectedTags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by tags:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`
                          px-2 py-1 rounded-full text-xs transition-colors
                          ${selectedTags.includes(tag)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="flex justify-between items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </span>
            {query && (
              <span>
                Searching for: <strong>"{query}"</strong>
              </span>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {query || selectedCategory !== 'all' || selectedTags.length > 0
                  ? 'No notes found'
                  : 'Start searching'
                }
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {query || selectedCategory !== 'all' || selectedTags.length > 0
                  ? 'Try adjusting your search terms or filters'
                  : 'Type in the search box to find your notes'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map(note => (
                <div
                  key={note.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                  onClick={() => handleNoteClick(note.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      <span 
                        dangerouslySetInnerHTML={{
                          __html: highlightText(
                            note.title || 'Untitled',
                            query.split(' ').filter(Boolean)
                          )
                        }}
                      />
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {note.isFavorite && <span className="text-yellow-500">⭐</span>}
                      <span>
                        {new Date(
                          note.updatedAt?.seconds 
                            ? note.updatedAt.seconds * 1000 
                            : note.updatedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span 
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          truncateContent(note.content),
                          query.split(' ').filter(Boolean)
                        )
                      }}
                    />
                  </p>

                  <div className="flex items-center gap-2">
                    {note.category && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {note.category}
                      </span>
                    )}
                    {note.tags?.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className={`
                          text-xs px-2 py-1 rounded-full
                          ${selectedTags.includes(tag)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }
                        `}
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags?.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
