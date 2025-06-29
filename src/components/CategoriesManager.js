/**
 * CategoriesManager component
 * Manages note categories and folders
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../hooks/useNotes';

export default function CategoriesManager({ 
  selectedCategory, 
  onCategoryChange,
  showCreateNew = true 
}) {
  const { theme } = useTheme();
  const { categories, stats, notes } = useNotes();
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Built-in categories
  const builtInCategories = [
    { id: 'all', name: 'All Notes', icon: '📝', color: 'gray' },
    { id: 'favorites', name: 'Favorites', icon: '⭐', color: 'yellow' },
    { id: 'recent', name: 'Recent', icon: '🕒', color: 'blue' }
  ];

  // User categories from notes
  const userCategories = categories
    .filter(cat => cat !== 'all')
    .map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: getCategoryIcon(cat),
      color: getCategoryColor(cat),
      count: stats.byCategory[cat] || 0
    }));

  // Get icon for category
  function getCategoryIcon(category) {
    const icons = {
      work: '💼',
      personal: '👤',
      ideas: '💡',
      todo: '✅',
      notes: '📄',
      journal: '📔',
      research: '🔬',
      project: '🚀',
      default: '📝'
    };
    return icons[category] || icons.default;
  }

  // Get color for category
  function getCategoryColor(category) {
    const colors = {
      work: 'blue',
      personal: 'green',
      ideas: 'purple',
      todo: 'orange',
      notes: 'gray',
      journal: 'pink',
      research: 'indigo',
      project: 'red',
      default: 'gray'
    };
    return colors[category] || colors.default;
  }

  // Handle category creation
  const handleCreateCategory = () => {
    const categoryName = newCategoryName.trim().toLowerCase();
    if (categoryName && !categories.includes(categoryName)) {
      onCategoryChange(categoryName);
      setNewCategoryName('');
      setIsCreating(false);
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateCategory();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewCategoryName('');
    }
  };

  return (
    <div className={`
      w-64 h-full border-r border-gray-200 dark:border-gray-600
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Categories
        </h2>
      </div>

      {/* Built-in Categories */}
      <div className="p-2">
        {builtInCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left
              ${selectedCategory === category.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="flex-1 font-medium">{category.name}</span>
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${selectedCategory === category.id
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }
            `}>
              {category.id === 'all' 
                ? stats.total 
                : category.id === 'favorites' 
                  ? stats.favorites
                  : notes.filter(note => {
                      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                      const noteDate = new Date(note.updatedAt?.seconds ? note.updatedAt.seconds * 1000 : note.updatedAt);
                      return noteDate > dayAgo;
                    }).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-200 dark:border-gray-600"></div>

      {/* User Categories */}
      <div className="p-2">
        <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Your Categories
        </div>
        
        {userCategories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left
              ${selectedCategory === category.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="flex-1 font-medium">{category.name}</span>
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${selectedCategory === category.id
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }
            `}>
              {category.count}
            </span>
          </button>
        ))}

        {/* Create New Category */}
        {showCreateNew && (
          <div className="mt-2">
            {isCreating ? (
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={() => {
                    if (!newCategoryName.trim()) {
                      setIsCreating(false);
                    }
                  }}
                  placeholder="Category name..."
                  className={`
                    w-full px-2 py-1 text-sm rounded border
                    ${theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  autoFocus
                />
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewCategoryName('');
                    }}
                    className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left
                  hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400
                `}
              >
                <span className="text-lg">+</span>
                <span className="flex-1 text-sm">New Category</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Stats */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Total Notes:</span>
            <span>{stats.total}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Categories:</span>
            <span>{userCategories.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
