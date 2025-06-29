/**
 * Notes Dashboard Page
 * Main dashboard for notes management
 */

'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useIsMobile } from '../../../hooks/useMobile';
import AuthGuard from '../../../components/AuthGuard';
import Layout from '../../../components/Layout';
import NotesList from '../../../components/NotesList';
import MobileNotesList from '../../../components/MobileNotesList';
import NoteEditor from '../../../components/NoteEditor';
import { useTheme } from '../../../contexts/ThemeContext';

export default function NotesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [showEditor, setShowEditor] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const handleCreateNote = () => {
    setEditingNoteId(null);
    setShowEditor(true);
  };

  const handleEditNote = (noteId) => {
    setEditingNoteId(noteId);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNoteId(null);
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className={isMobile ? 'h-full' : 'container mx-auto px-4 py-8'}>
            {showEditor ? (
              <NoteEditor
                noteId={editingNoteId}
                onSave={handleCloseEditor}
                onCancel={handleCloseEditor}
              />
            ) : isMobile ? (
              <MobileNotesList
                onCreateNote={handleCreateNote}
                onEditNote={handleEditNote}
              />
            ) : (
              <NotesList
                onCreateNote={handleCreateNote}
                onEditNote={handleEditNote}
              />
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
