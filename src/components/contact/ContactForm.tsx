'use client';

import React, { useState } from 'react';
import { MobiGlasPanel, MobiGlasButton } from '@/components/ui/mobiglas';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Message transmitted successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <MobiGlasPanel
      title="MESSAGE TRANSMISSION"
      variant="dark"
      withScanline
      cornerAccents
      padding="lg"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >

        {successMessage && (
          <div className="mb-4 p-3 bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-[rgba(var(--mg-primary),0.9)]">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] rounded-sm text-[rgba(var(--mg-error),0.9)]">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
              NAME
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
              COMM RELAY ID
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
              SUBJECT
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
              MESSAGE CONTENTS
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
              disabled={isLoading}
            ></textarea>
          </div>
          <MobiGlasButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            withScanline
            disabled={isLoading}
            rightIcon={
              isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )
            }
          >
            {isLoading ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
          </MobiGlasButton>
        </form>

        <div className="absolute bottom-2 right-2 text-[rgba(var(--mg-text),0.4)] text-xs">
          TRANSMISSION PROTOCOL v3.82
        </div>
    </MobiGlasPanel>
  );
}