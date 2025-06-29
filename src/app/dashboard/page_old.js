'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { LoadingPage } from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null; // Redirecting...
  }

  return (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Your Notes
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total notes</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Categories
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Last Activity
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">Today</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recent activity</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-200">
                <div className="text-blue-600 dark:text-blue-400 font-medium">Create New Note</div>
                <div className="text-sm text-blue-500 dark:text-blue-300 mt-1">Start writing</div>
              </button>
              
              <button className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-200">
                <div className="text-green-600 dark:text-green-400 font-medium">Import Notes</div>
                <div className="text-sm text-green-500 dark:text-green-300 mt-1">From file</div>
              </button>
              
              <button className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors duration-200">
                <div className="text-purple-600 dark:text-purple-400 font-medium">Search Notes</div>
                <div className="text-sm text-purple-500 dark:text-purple-300 mt-1">Find anything</div>
              </button>
              
              <button className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200">
                <div className="text-gray-600 dark:text-gray-400 font-medium">Settings</div>
                <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">Preferences</div>
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Notes
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No notes yet. Create your first secure note to get started!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
