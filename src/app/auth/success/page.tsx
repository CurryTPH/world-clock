"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccess() {
  const router = useRouter();
  
  useEffect(() => {
    // Get the token from the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Redirect to home page
      router.push('/');
    } else {
      // If no token, redirect to login
      router.push('/login?error=no_token');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center animate-fade-in">
        <div className="text-blue-400 mb-4">
          <svg className="animate-spin h-12 w-12 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Authentication Successful</h1>
        <p className="text-gray-400">Logging you in...</p>
      </div>
    </div>
  );
}