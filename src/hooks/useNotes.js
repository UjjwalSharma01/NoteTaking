/**
 * useNotes hook
 * React hook for managing notes state and operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NoteModel } from '../lib/noteModel';

export function useNotes() {
  const { user, encryptionKey, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Memoize the note model to prevent recreations
  const noteModel = useMemo(() => {
    if (!user || !encryptionKey || authLoading) return null;
    return new NoteModel(user.uid, encryptionKey);
  }, [user, encryptionKey, authLoading]);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !authLoading && user && encryptionKey;
  }, [authLoading, user, encryptionKey]);

  // Load notes
  const loadNotes = useCallback(async () => {
    // Wait for auth to complete before attempting to load
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated || !noteModel) {
      setLoading(false);
      setNotes([]);
      if (!isAuthenticated) {
        setError('Please sign in to view your notes');
      }
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const options = {};
      if (selectedCategory !== 'all') {
        options.category = selectedCategory;
      }
      if (showFavoritesOnly) {
        options.favoritesOnly = true;
      }
      
      const fetchedNotes = await noteModel.getNotes(options);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [noteModel, selectedCategory, showFavoritesOnly, isAuthenticated]);

  // Load notes when dependencies change
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Create a new note
  const createNote = useCallback(async (noteData) => {
    if (authLoading) {
      throw new Error('Please wait for authentication to complete');
    }
    
    if (!isAuthenticated || !noteModel) {
      throw new Error('You must be signed in to create notes');
    }
    
    try {
      const newNote = await noteModel.createNote(noteData);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      throw new Error('Failed to create note: ' + err.message);
    }
  }, [noteModel, isAuthenticated, authLoading]);

  // Update a note
  const updateNote = useCallback(async (noteId, updates) => {
    if (!isAuthenticated || !noteModel) {
      throw new Error('Please wait for authentication to complete');
    }
    
    try {
      await noteModel.updateNote(noteId, updates);
      
      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      ));
    } catch (err) {
      console.error('Error updating note:', err);
      throw new Error('Failed to update note: ' + err.message);
    }
  }, [noteModel, isAuthenticated]);

  // Delete a note
  const deleteNote = useCallback(async (noteId) => {
    if (!isAuthenticated || !noteModel) {
      throw new Error('Please wait for authentication to complete');
    }
    
    try {
      await noteModel.deleteNote(noteId);
      
      // Remove from local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      throw new Error('Failed to delete note: ' + err.message);
    }
  }, [noteModel, isAuthenticated]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (noteId) => {
    if (!isAuthenticated || !noteModel) {
      throw new Error('Please wait for authentication to complete');
    }
    
    try {
      const newFavoriteStatus = await noteModel.toggleFavorite(noteId);
      
      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, isFavorite: newFavoriteStatus }
          : note
      ));
      
      return newFavoriteStatus;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw new Error('Failed to toggle favorite: ' + err.message);
    }
  }, [noteModel, isAuthenticated]);

  // Search notes
  const searchNotes = useCallback(async (term) => {
    if (!isAuthenticated || !noteModel) return;
    
    try {
      setLoading(true);
      const searchResults = await noteModel.searchNotes(term);
      setNotes(searchResults);
    } catch (err) {
      console.error('Error searching notes:', err);
      setError('Failed to search notes');
    } finally {
      setLoading(false);
    }
  }, [noteModel, isAuthenticated]);

  // Filtered notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return notes.filter(note => {
      const titleMatch = note.title?.toLowerCase().includes(lowercaseSearch);
      const contentMatch = note.content?.toLowerCase().includes(lowercaseSearch);
      const tagMatch = note.tags?.some(tag => 
        tag.toLowerCase().includes(lowercaseSearch)
      );
      
      return titleMatch || contentMatch || tagMatch;
    });
  }, [notes, searchTerm]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(['all']);
    notes.forEach(note => {
      if (note.category) {
        categorySet.add(note.category);
      }
    });
    return Array.from(categorySet);
  }, [notes]);

  // Get unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: notes.length,
      favorites: notes.filter(note => note.isFavorite).length,
      byCategory: notes.reduce((acc, note) => {
        const category = note.category || 'uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    };
  }, [notes]);

  return {
    // State
    notes: filteredNotes,
    loading,
    error,
    searchTerm,
    selectedCategory,
    showFavoritesOnly,
    categories,
    allTags,
    stats,
    
    // Actions
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    loadNotes,
    searchNotes,
    
    // Setters
    setSearchTerm,
    setSelectedCategory,
    setShowFavoritesOnly,
    setError
  };
}
