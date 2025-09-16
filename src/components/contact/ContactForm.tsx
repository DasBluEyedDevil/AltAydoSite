'use client';

import React from 'react';
import { MobiGlasPanel, MobiGlasButton } from '@/components/ui/mobiglas';

export default function ContactForm() {
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

        <form className="space-y-6" action="mailto:aydocorp@gmail.com" method="post">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
              NAME
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
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
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
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
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
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
              className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
              required
            ></textarea>
          </div>
          <MobiGlasButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            withScanline
            rightIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            }
          >
            TRANSMIT MESSAGE
          </MobiGlasButton>
        </form>

        <div className="absolute bottom-2 right-2 text-[rgba(var(--mg-text),0.4)] text-xs">
          TRANSMISSION PROTOCOL v3.82
        </div>
    </MobiGlasPanel>
  );
}