'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

export default function About() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/logisticsoffice.jpg"
            alt="AydoCorp Office"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8">About AydoCorp</h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
              From humble beginnings to interstellar excellence, discover the story of Aydo Intergalactic Corporation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              Our History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="text-gray-300 mb-6">
                  Founded in the bustling Ellis system on Green, AydoCorp began as a modest city delivery service known as "Aydo City Delivery." Through dedication, innovation, and an unwavering commitment to excellence, we evolved into "Aydo Amalgamated Industries" before finally emerging as the interstellar powerhouse known today as Aydo Intergalactic Corporation.
                </p>
                <p className="text-gray-300">
                  Our journey from local courier to interstellar logistics leader reflects our core values of adaptability, reliability, and continuous improvement. Today, we stand as a testament to what can be achieved when vision meets determination in the vast expanse of space.
                </p>
              </div>
              <div className="relative h-64 md:h-auto">
                <Image
                  src="/images/Hull_E.jpg"
                  alt="AydoCorp Fleet"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Focus Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              Our Focus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Logistics Excellence</h3>
                <p className="text-gray-300">
                  We specialize in comprehensive logistics solutions across the Star Citizen universe, ensuring your cargo reaches its destination safely and efficiently.
                </p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Community First</h3>
                <p className="text-gray-300">
                  Our CEO's philosophy, "it's better to play together," guides everything we do. We're more than a corporation; we're a community of dedicated professionals.
                </p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Innovation</h3>
                <p className="text-gray-300">
                  From our racing team to our specialized divisions, we're constantly pushing boundaries and exploring new frontiers in space logistics.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 