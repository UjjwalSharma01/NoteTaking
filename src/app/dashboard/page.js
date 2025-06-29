'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/hooks/useNotes';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import QuickNoteEditor from '@/components/QuickNoteEditor';
import { LoadingPage } from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { notes, stats, loading: notesLoading } = useNotes();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Get recent notes (last 5)
  const recentNotes = notes.slice(0, 5);

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

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null; // Redirecting...
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.displayName || 'User'}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Your secure notes dashboard
              </p>
            </div>

            {!user.emailVerified && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Please verify your email address to ensure account security.
                </p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Your Notes
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {notesLoading ? '...' : stats.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total notes</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Favorites
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {notesLoading ? '...' : stats.favorites}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Starred notes</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Categories
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {notesLoading ? '...' : Object.keys(stats.byCategory || {}).length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categories used</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => router.push('/dashboard/notes/new')}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-200"
                >
                  <div className="text-blue-600 dark:text-blue-400 font-medium">Create New Note</div>
                  <div className="text-sm text-blue-500 dark:text-blue-300 mt-1">Start writing</div>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/notes')}
                  className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-200"
                >
                  <div className="text-green-600 dark:text-green-400 font-medium">Browse Notes</div>
                  <div className="text-sm text-green-500 dark:text-green-300 mt-1">View all notes</div>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/notes?favorites=true')}
                  className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors duration-200"
                >
                  <div className="text-purple-600 dark:text-purple-400 font-medium">Favorites</div>
                  <div className="text-sm text-purple-500 dark:text-purple-300 mt-1">Starred notes</div>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                  className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200"
                >
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Settings</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">Preferences</div>
                </button>
              </div>
            </div>

            {/* Recent Notes */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Notes
                </h2>
                {notes.length > 0 && (
                  <button 
                    onClick={() => router.push('/dashboard/notes')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    View all →
                  </button>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                {notesLoading ? (
                  <div className="p-6 text-center">
                    <div className="text-gray-500 dark:text-gray-400">Loading notes...</div>
                  </div>
                ) : recentNotes.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No notes yet. Create your first secure note to get started!
                    </p>
                    <button 
                      onClick={() => router.push('/dashboard/notes/new')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create First Note
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentNotes.map((note) => (
                      <div 
                        key={note.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                        onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {note.title || 'Untitled'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                              {note.content ? 
                                note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') 
                                : 'No content'
                              }
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {formatDate(note.updatedAt)}
                              </span>
                              {note.category && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                  {note.category}
                                </span>
                              )}
                              {note.isFavorite && (
                                <span className="text-yellow-500">⭐</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
