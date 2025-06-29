/**
 * Note data model and operations
 * Handles note structure, validation, and CRUD operations
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase.js';
import { encryptData, decryptData } from '../utils/encryption.js';

/**
 * Note structure:
 * {
 *   id: string,
 *   title: string (encrypted),
 *   content: string (encrypted),
 *   encryptedData: string, // Contains encrypted title and content
 *   userId: string,
 *   category: string,
 *   tags: string[],
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   isDeleted: boolean,
 *   isFavorite: boolean
 * }
 */

export class NoteModel {
  constructor(userId, encryptionKey) {
    this.userId = userId;
    this.encryptionKey = encryptionKey;
    this.collection = collection(db, 'notes');
  }

  /**
   * Create a new note
   */
  async createNote(noteData) {
    try {
      const { title, content, category = 'default', tags = [] } = noteData;
      
      // Encrypt the sensitive data
      const dataToEncrypt = { title, content };
      const encryptedData = await encryptData(dataToEncrypt, this.encryptionKey);
      
      const note = {
        encryptedData,
        userId: this.userId,
        category,
        tags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDeleted: false,
        isFavorite: false
      };
      
      const docRef = await addDoc(this.collection, note);
      return { id: docRef.id, ...note };
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  }

  /**
   * Update an existing note
   */
  async updateNote(noteId, updates) {
    try {
      const noteRef = doc(this.collection, noteId);
      
      // If updating title or content, re-encrypt
      if (updates.title !== undefined || updates.content !== undefined) {
        // Get current note to preserve other encrypted data
        const currentNote = await this.getNote(noteId);
        if (!currentNote) {
          throw new Error('Note not found');
        }
        
        const dataToEncrypt = {
          title: updates.title !== undefined ? updates.title : currentNote.title,
          content: updates.content !== undefined ? updates.content : currentNote.content
        };
        
        const encryptedData = await encryptData(dataToEncrypt, this.encryptionKey);
        updates.encryptedData = encryptedData;
        
        // Remove plain text from updates
        delete updates.title;
        delete updates.content;
      }
      
      updates.updatedAt = serverTimestamp();
      
      await updateDoc(noteRef, updates);
      return { id: noteId, ...updates };
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  /**
   * Get a single note by ID
   */
  async getNote(noteId) {
    try {
      const noteRef = doc(this.collection, noteId);
      const noteDoc = await getDoc(noteRef);
      
      if (!noteDoc.exists()) {
        return null;
      }
      
      const noteData = { id: noteDoc.id, ...noteDoc.data() };
      
      // Decrypt the data
      if (noteData.encryptedData) {
        const decryptedData = await decryptData(noteData.encryptedData, this.encryptionKey);
        noteData.title = decryptedData.title;
        noteData.content = decryptedData.content;
      }
      
      return noteData;
    } catch (error) {
      console.error('Error getting note:', error);
      throw new Error('Failed to get note');
    }
  }

  /**
   * Get all notes for the user
   */
  async getNotes(options = {}) {
    try {
      const { 
        category = null, 
        tags = [], 
        limit: limitCount = 50,
        includeDeleted = false,
        favoritesOnly = false
      } = options;
      
      let q = query(
        this.collection,
        where('userId', '==', this.userId),
        where('isDeleted', '==', includeDeleted),
        orderBy('updatedAt', 'desc')
      );
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (favoritesOnly) {
        q = query(q, where('isFavorite', '==', true));
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const notes = [];
      
      for (const doc of querySnapshot.docs) {
        const noteData = { id: doc.id, ...doc.data() };
        
        // Decrypt the data
        if (noteData.encryptedData) {
          try {
            const decryptedData = await decryptData(noteData.encryptedData, this.encryptionKey);
            noteData.title = decryptedData.title;
            noteData.content = decryptedData.content;
          } catch (decryptError) {
            console.error('Error decrypting note:', doc.id, decryptError);
            noteData.title = '[Decryption Error]';
            noteData.content = '[Unable to decrypt note content]';
          }
        }
        
        // Filter by tags if specified
        if (tags.length > 0) {
          const noteTags = noteData.tags || [];
          const hasTag = tags.some(tag => noteTags.includes(tag));
          if (hasTag) {
            notes.push(noteData);
          }
        } else {
          notes.push(noteData);
        }
      }
      
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      throw new Error('Failed to get notes');
    }
  }

  /**
   * Soft delete a note
   */
  async deleteNote(noteId) {
    try {
      await this.updateNote(noteId, { isDeleted: true });
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  /**
   * Permanently delete a note
   */
  async permanentlyDeleteNote(noteId) {
    try {
      const noteRef = doc(this.collection, noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Error permanently deleting note:', error);
      throw new Error('Failed to permanently delete note');
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(noteId) {
    try {
      const note = await this.getNote(noteId);
      if (!note) {
        throw new Error('Note not found');
      }
      
      await this.updateNote(noteId, { isFavorite: !note.isFavorite });
      return !note.isFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('Failed to toggle favorite');
    }
  }

  /**
   * Search notes by title or content
   */
  async searchNotes(searchTerm) {
    try {
      const notes = await this.getNotes();
      
      if (!searchTerm) {
        return notes;
      }
      
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return notes.filter(note => {
        const titleMatch = note.title?.toLowerCase().includes(lowercaseSearch);
        const contentMatch = note.content?.toLowerCase().includes(lowercaseSearch);
        const tagMatch = note.tags?.some(tag => 
          tag.toLowerCase().includes(lowercaseSearch)
        );
        
        return titleMatch || contentMatch || tagMatch;
      });
    } catch (error) {
      console.error('Error searching notes:', error);
      throw new Error('Failed to search notes');
    }
  }

  /**
   * Get notes by category
   */
  async getNotesByCategory(category) {
    return this.getNotes({ category });
  }

  /**
   * Get favorite notes
   */
  async getFavoriteNotes() {
    return this.getNotes({ favoritesOnly: true });
  }

  /**
   * Get deleted notes
   */
  async getDeletedNotes() {
    return this.getNotes({ includeDeleted: true });
  }
}
