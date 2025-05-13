'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <>
      {/* Status Bar */}
      <div className="bg-black/80 border-b border-cyan-900/30 py-1 px-4 text-xs text-cyan-400/80 flex justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
          SYSTEM ONLINE
          <span className="text-gray-500 mx-4">|</span>
          USER ACCESS: <span className="text-cyan-400 ml-1">CIVILIAN</span>
        </div>
        <div className="flex items-center gap-2">
          QUANTUM LINK: <span className="text-green-500 ml-1">ACTIVE</span>
          <span className="ml-4 font-mono text-cyan-400/80">03:12 PM</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/AydoOffice1.png"
            alt="Contact AydoCorp"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
          <div className="absolute inset-0 circuit-bg"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Contact Us</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get in touch with our team for any inquiries about our services or joining AydoCorp
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 p-8 rounded-lg"
            >
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6" action="mailto:aydocorp@gmail.com" method="post">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-transparent border border-cyan-500 text-white font-medium rounded-md hover:bg-cyan-900/30 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  <span className="relative z-10">Send Message</span>
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-800/50 p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Connect With Us</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Discord</h3>
                    <a
                      href="https://discord.gg/aydocorp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Join our Discord Server
                    </a>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Email</h3>
                    <a
                      href="mailto:aydocorp@gmail.com"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      aydocorp@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Quick Links</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Service Request</h3>
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLSekyn2ZhdU9czvQrcLSpo1b0wIzRX__DxLFk89L4Y0NZ8FiwQ/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Submit a Service Request
                    </a>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">RSI Organization</h3>
                    <a
                      href="https://robertsspaceindustries.com/orgs/AYDOCORP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      View our RSI Page
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
} 