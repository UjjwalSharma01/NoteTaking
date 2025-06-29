/**
 * MobileLayout component
 * Mobile-optimized layout with touch-friendly navigation
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useIsMobile, useMobileNavigation, useSwipeGesture } from '../hooks/useMobile';
import SearchNotes from './SearchNotes';
import ImportExport from './ImportExport';

export default function MobileLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileNavigation();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  // Navigation items
  const navItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '📝', label: 'Notes', path: '/dashboard/notes' },
    { icon: '⭐', label: 'Favorites', path: '/dashboard/notes?favorites=true' },
    { icon: '🔍', label: 'Search', action: () => setShowSearch(true) },
    { icon: '📤', label: 'Import/Export', action: () => setShowImportExport(true) },
    { icon: '⚙️', label: 'Settings', path: '/dashboard/settings' }
  ];

  // Swipe gestures for navigation
  const swipeHandlers = useSwipeGesture(
    () => {
      // Swipe left to open menu
      if (!isMenuOpen) toggleMenu();
    },
    () => {
      // Swipe right to close menu
      if (isMenuOpen) closeMenu();
    }
  );

  const handleNavItemClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    }
    closeMenu();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isMobile) {
    // Return regular layout for desktop
    return <div>{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top App Bar */}
      <header className={`
        flex items-center justify-between px-4 py-3 border-b
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
        }
      `}>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold truncate mx-4">
          Secure Notes
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            🔍
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-hidden"
        {...swipeHandlers}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className={`
        flex items-center justify-around px-2 py-2 border-t
        ${theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] flex-1"
        >
          <span className="text-lg">🏠</span>
          <span className="text-xs">Home</span>
        </button>
        
        <button
          onClick={() => router.push('/dashboard/notes')}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] flex-1"
        >
          <span className="text-lg">📝</span>
          <span className="text-xs">Notes</span>
        </button>
        
        <button
          onClick={() => router.push('/dashboard/notes/new')}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 min-h-[44px] flex-1"
        >
          <span className="text-lg">+</span>
          <span className="text-xs">New</span>
        </button>
        
        <button
          onClick={() => setShowSearch(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] flex-1"
        >
          <span className="text-lg">🔍</span>
          <span className="text-xs">Search</span>
        </button>
        
        <button
          onClick={toggleMenu}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] flex-1"
        >
          <span className="text-lg">☰</span>
          <span className="text-xs">Menu</span>
        </button>
      </nav>

      {/* Side Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />
          
          {/* Menu */}
          <div className={`
            fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Menu Header */}
            <div className={`
              flex items-center justify-between p-4 border-b
              ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user?.displayName || 'User'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col p-2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavItemClick(item)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors min-h-[52px]
                    ${theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

              {/* Divider */}
              <div className={`
                my-2 border-t
                ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
              `} />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors min-h-[52px]
                  ${theme === 'dark'
                    ? 'text-red-400 hover:bg-red-900/20'
                    : 'text-red-600 hover:bg-red-50'
                  }
                `}
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Menu Footer */}
            <div className={`
              mt-auto p-4 border-t text-xs text-gray-500 dark:text-gray-400
              ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <div>Secure Notes App</div>
              <div>End-to-end encrypted</div>
            </div>
          </div>
        </>
      )}

      {/* Search Modal */}
      <SearchNotes 
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Import/Export Modal */}
      {showImportExport && (
        <ImportExport onClose={() => setShowImportExport(false)} />
      )}
    </div>
  );
}
