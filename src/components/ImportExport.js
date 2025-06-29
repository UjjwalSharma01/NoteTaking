/**
 * ImportExport component
 * Handles importing and exporting notes
 */

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotes } from '../hooks/useNotes';
import Alert from './Alert';

export default function ImportExport({ onClose }) {
  const { theme } = useTheme();
  const { notes, createNote } = useNotes();
  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState('json');
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Export notes
  const handleExport = async () => {
    try {
      setLoading(true);
      
      let exportContent;
      let filename;
      let mimeType;

      switch (exportFormat) {
        case 'json':
          exportContent = JSON.stringify(notes, null, 2);
          filename = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
          
        case 'markdown':
          exportContent = notes.map(note => {
            let md = `# ${note.title || 'Untitled'}\n\n`;
            md += `**Category:** ${note.category || 'default'}\n`;
            if (note.tags && note.tags.length > 0) {
              md += `**Tags:** ${note.tags.join(', ')}\n`;
            }
            md += `**Created:** ${new Date(note.createdAt?.seconds ? note.createdAt.seconds * 1000 : note.createdAt).toLocaleDateString()}\n`;
            md += `**Updated:** ${new Date(note.updatedAt?.seconds ? note.updatedAt.seconds * 1000 : note.updatedAt).toLocaleDateString()}\n\n`;
            md += `${note.content || 'No content'}\n\n---\n\n`;
            return md;
          }).join('');
          filename = `notes-export-${new Date().toISOString().split('T')[0]}.md`;
          mimeType = 'text/markdown';
          break;
          
        case 'txt':
          exportContent = notes.map(note => {
            let txt = `${note.title || 'Untitled'}\n`;
            txt += `${'='.repeat((note.title || 'Untitled').length)}\n\n`;
            txt += `Category: ${note.category || 'default'}\n`;
            if (note.tags && note.tags.length > 0) {
              txt += `Tags: ${note.tags.join(', ')}\n`;
            }
            txt += `Created: ${new Date(note.createdAt?.seconds ? note.createdAt.seconds * 1000 : note.createdAt).toLocaleDateString()}\n`;
            txt += `Updated: ${new Date(note.updatedAt?.seconds ? note.updatedAt.seconds * 1000 : note.updatedAt).toLocaleDateString()}\n\n`;
            txt += `${note.content || 'No content'}\n\n${'='.repeat(50)}\n\n`;
            return txt;
          }).join('');
          filename = `notes-export-${new Date().toISOString().split('T')[0]}.txt`;
          mimeType = 'text/plain';
          break;
          
        default:
          throw new Error('Unsupported export format');
      }

      // Create and download file
      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: `Successfully exported ${notes.length} notes as ${exportFormat.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to export notes: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Import notes
  const handleImport = async () => {
    try {
      setLoading(true);
      
      if (!importData.trim()) {
        throw new Error('Please paste the import data');
      }

      let notesToImport;
      
      // Try to parse as JSON first
      try {
        notesToImport = JSON.parse(importData);
      } catch {
        // If not JSON, treat as plain text and create a single note
        notesToImport = [{
          title: 'Imported Note',
          content: importData,
          category: 'imported',
          tags: ['imported']
        }];
      }

      // Ensure it's an array
      if (!Array.isArray(notesToImport)) {
        notesToImport = [notesToImport];
      }

      let importedCount = 0;
      let errorCount = 0;

      for (const noteData of notesToImport) {
        try {
          // Validate note data
          const validNote = {
            title: noteData.title || 'Imported Note',
            content: noteData.content || '',
            category: noteData.category || 'imported',
            tags: Array.isArray(noteData.tags) ? noteData.tags : ['imported']
          };

          await createNote(validNote);
          importedCount++;
        } catch (error) {
          console.error('Error importing note:', error);
          errorCount++;
        }
      }

      if (importedCount > 0) {
        setMessage({
          type: 'success',
          text: `Successfully imported ${importedCount} note${importedCount !== 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`
        });
        setImportData('');
      } else {
        throw new Error('No notes could be imported');
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to import notes: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`
        w-full max-w-2xl mx-4 rounded-lg shadow-xl max-h-[90vh] flex flex-col
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import & Export Notes
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setActiveTab('export')}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'export'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              Export Notes
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'import'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              Import Notes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {message && (
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
              className="mb-4"
            />
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Export your notes to back them up or transfer to another system.
                  You have {notes.length} note{notes.length !== 1 ? 's' : ''} to export.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Export Format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className={`
                        w-full px-3 py-2 rounded border
                        ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                        }
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                    >
                      <option value="json">JSON (Recommended)</option>
                      <option value="markdown">Markdown (.md)</option>
                      <option value="txt">Plain Text (.txt)</option>
                    </select>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {exportFormat === 'json' && (
                      <p>JSON format preserves all data and can be imported back perfectly.</p>
                    )}
                    {exportFormat === 'markdown' && (
                      <p>Markdown format is great for viewing in text editors and markdown viewers.</p>
                    )}
                    {exportFormat === 'txt' && (
                      <p>Plain text format for maximum compatibility.</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={loading || notes.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Exporting...' : `Export ${notes.length} Note${notes.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Import notes from a backup file or paste JSON data directly.
                </p>

                {/* File Upload */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload File
                    </label>
                    <input
                      type="file"
                      accept=".json,.txt,.md"
                      onChange={handleFileUpload}
                      className={`
                        w-full px-3 py-2 rounded border
                        ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                        }
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                    />
                  </div>

                  <div className="text-center text-gray-500 dark:text-gray-400">
                    or
                  </div>

                  {/* Paste Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paste Data
                    </label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste your notes data here (JSON format recommended)..."
                      rows={8}
                      className={`
                        w-full px-3 py-2 rounded border font-mono text-sm
                        ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleImport}
                disabled={loading || !importData.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Importing...' : 'Import Notes'}
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p><strong>Supported formats:</strong></p>
                <ul className="mt-1 space-y-1">
                  <li>• JSON exports from this app</li>
                  <li>• Plain text (will create a single note)</li>
                  <li>• Any valid JSON array of note objects</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`
                px-4 py-2 rounded transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
