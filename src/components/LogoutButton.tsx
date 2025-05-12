'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <motion.button
      onClick={handleLogout}
      className={`mg-button flex items-center px-3 py-1 text-xs relative overflow-hidden ${
        isLoading ? 'opacity-80' : 'hover:bg-[rgba(var(--mg-primary),0.1)]'
      }`}
      disabled={isLoading}
      whileTap={{ scale: 0.98 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <div className="relative z-10 font-quantify tracking-wider text-xs">
        {isLoading ? 'EXITING...' : 'SIGN OUT'}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="scanner-line"></div>
        </div>
      )}
    </motion.button>
  );
} 