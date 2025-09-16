'use client';

import React, { useState } from 'react';
import ContactStatusBar from '@/components/contact/ContactStatusBar';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactChannels from '@/components/contact/ContactChannels';
import LocationSection from '@/components/contact/LocationSection';
import ContactFooter from '@/components/contact/ContactFooter';

export default function Contact() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <>
      {/* Status Bar */}
      <ContactStatusBar />

      {/* Hero Section and Contact Form Section */}
      <ContactHero isScanning={isScanning} setIsScanning={setIsScanning} />

      {/* Contact Form and Channels Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <ContactForm />

            {/* Contact Channels */}
            <ContactChannels />
          </div>
        </div>
      </section>

      {/* Location Section */}
      <LocationSection />

      {/* Footer */}
      <ContactFooter />
    </>
  );
}