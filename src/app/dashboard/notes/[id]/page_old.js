/**
 * Individual Note Page
 * Page for viewing and editing individual notes with improved routing
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import AuthGuard from '../../../../../components/AuthGuard';
import Layout from '../../../../../components/Layout';
import NoteEditor from '../../../../../components/NoteEditor';
import NoteViewer from '../../../../../components/NoteViewer';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import { useNotes } from '../../../../../hooks/useNotes';

export default function NotePage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notes, loading, updateNote, toggleFavorite } = useNotes();
  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Extract note ID from params
  const noteId = params?.id;
  
  // Check if we should start in edit mode
  const shouldEdit = searchParams?.get('edit') === 'true';

  // Find the note and set edit mode
  useEffect(() => {
    if (noteId && notes.length > 0) {
      const foundNote = notes.find(n => n.id === noteId);
      setNote(foundNote);
      
      // Set edit mode based on URL parameter
      if (shouldEdit && foundNote) {
        setIsEditing(true);
      }
    }
  }, [noteId, notes, shouldEdit]);

  const handleEdit = () => {
    setIsEditing(true);
    // Update URL to reflect edit mode
    const newUrl = `/dashboard/notes/${noteId}?edit=true`;
    router.replace(newUrl);
  };

  const handleSave = async (updatedNote) => {
    try {
      await updateNote(noteId, updatedNote);
      setIsEditing(false);
      // Remove edit parameter from URL
      router.replace(`/dashboard/notes/${noteId}`);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      // Remove edit parameter from URL
      router.replace(`/dashboard/notes/${noteId}`);
    } else {
      router.push('/dashboard/notes');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      // Update local note state
      setNote(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = async (noteToShare) => {
    try {
      // Simple share implementation - copy link to clipboard
      const shareUrl = `${window.location.origin}/dashboard/notes/${noteToShare.id}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // You could also implement a more sophisticated sharing system here
      alert('Note link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share note:', error);
      alert('Failed to copy link to clipboard');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!note && !loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Note not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The note you're looking for doesn't exist or may have been deleted.
            </p>
            <button
              onClick={() => router.push('/dashboard/notes')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Notes
            </button>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {isEditing ? (
            <NoteEditor
              note={note}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <NoteViewer
              note={note}
              onEdit={handleEdit}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
            />
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
    return (
      <AuthGuard>
        <Layout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!note) {
    return (
      <AuthGuard>
        <Layout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The note you're looking for doesn't exist or has been deleted.
                </p>
                <button
                  onClick={() => router.push('/dashboard/notes')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Notes
                </button>
              </div>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            {isEditing ? (
              <NoteEditor
                noteId={noteId}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {note.title || 'Untitled'}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Category: {note.category || 'default'}</span>
                      {note.tags && note.tags.length > 0 && (
                        <span>Tags: {note.tags.join(', ')}</span>
                      )}
                      <span>
                        Updated: {new Date(
                          note.updatedAt?.seconds 
                            ? note.updatedAt.seconds * 1000 
                            : note.updatedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push('/dashboard/notes')}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 leading-relaxed">
                      {note.content || 'No content'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
