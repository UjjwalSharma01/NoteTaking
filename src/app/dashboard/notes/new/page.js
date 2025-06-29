/**
 * New Note Page
 * Page for creating new notes
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import AuthGuard from '../../../../components/AuthGuard';
import Layout from '../../../../components/Layout';
import NoteEditor from '../../../../components/NoteEditor';

export default function NewNotePage() {
  const router = useRouter();

  const handleSave = (note) => {
    // Redirect to the notes list after saving
    router.push('/dashboard/notes');
  };

  const handleCancel = () => {
    // Go back to notes list
    router.push('/dashboard/notes');
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <NoteEditor
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
