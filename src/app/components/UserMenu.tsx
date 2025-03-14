"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import Link from 'next/link';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

// Close the menu when clicking outside 
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {user ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 rounded-full py-1 px-3 text-sm transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </span>
          <span className="hidden md:inline">{user.name || user.email}</span>
        </button>
      ) : (
        <Link
          href="/login"
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded transition-colors"
        >
          Log In
        </Link>
      )}

      {isOpen && user && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-700">
            <p className="font-medium text-white truncate">{user.name}</p>
            <p className="text-sm text-gray-400 truncate overflow-hidden">{user.email}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
