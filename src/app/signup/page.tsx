'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    aydoHandle: '',
    email: '',
    discordName: '',
    rsiAccountName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!formData.aydoHandle || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      // Redirect to login page on success
      router.push('/login?signup=success');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mg-panel bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 border-l border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute top-0 right-0 w-5 h-5 border-r border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 left-0 w-5 h-5 border-l border-b border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 border-r border-b border-[rgba(var(--mg-primary),0.5)]"></div>
          
          <div className="text-center mb-6">
            <h2 className="mg-title text-xl mb-1">AYDO<span className="mg-subtitle font-light">CORP</span></h2>
            <div className="mg-subtitle text-xs tracking-wider">CREATE NEW ACCOUNT</div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                className="mb-4 p-2 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] text-xs rounded-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
            
            {/* AydoCorp Handle */}
            <div className="mg-input-group mb-4">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">AYDOCORP HANDLE*</label>
              <div className="relative">
                <input
                  type="text"
                  name="aydoHandle"
                  value={formData.aydoHandle}
                  onChange={handleChange}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="ENTER HANDLE"
                  required
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            {/* Email Address */}
            <div className="mg-input-group mb-4">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">EMAIL ADDRESS*</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="ENTER EMAIL"
                  required
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            {/* Discord Name */}
            <div className="mg-input-group mb-4">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">DISCORD NAME</label>
              <div className="relative">
                <input
                  type="text"
                  name="discordName"
                  value={formData.discordName}
                  onChange={handleChange}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="ENTER DISCORD NAME"
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            {/* RSI Account Name */}
            <div className="mg-input-group mb-4">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">RSI ACCOUNT NAME</label>
              <div className="relative">
                <input
                  type="text"
                  name="rsiAccountName"
                  value={formData.rsiAccountName}
                  onChange={handleChange}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="ENTER RSI ACCOUNT"
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            {/* Password */}
            <div className="mg-input-group mb-4">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">PASSWORD*</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="••••••••••••"
                  required
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            {/* Confirm Password */}
            <div className="mg-input-group mb-6">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">CONFIRM PASSWORD*</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="••••••••••••"
                  required
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            <motion.button
              type="submit"
              className={`mg-button w-full py-2 px-4 relative overflow-hidden ${isLoading ? 'opacity-80' : 'hover:bg-[rgba(var(--mg-primary),0.1)]'}`}
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10 font-quantify tracking-wider text-sm">
                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </div>
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="scanner-line"></div>
                </div>
              )}
            </motion.button>
          </form>
          
          <div className="mt-4 text-center text-[rgba(var(--mg-text),0.5)] text-xs">
            <span>Already have an account? <Link href="/login" className="text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)]">Login instead</Link></span>
          </div>
        </div>
        
        <div className="mg-text text-xs text-center mt-4 text-[rgba(var(--mg-text),0.6)]">
          <div className="inline-flex items-center">
            <div className="w-1 h-1 bg-[rgba(var(--mg-primary),0.4)] mr-1 rounded-full"></div>
            <span className="font-quantify tracking-wide">AYDO CORP SECURITY SYSTEM</span>
            <div className="w-1 h-1 bg-[rgba(var(--mg-primary),0.4)] ml-1 rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 