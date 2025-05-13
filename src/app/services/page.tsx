'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

const services = [
  {
    title: 'Cargo Transport & Management',
    description: 'End-to-end cargo transportation services across all major systems, featuring real-time tracking and advanced security protocols.',
    image: '/images/starcitizen-hulla.webp',
  },
  {
    title: 'Executive & Personnel Transit',
    description: 'Premium transportation services with the highest standards of comfort and security for corporate personnel.',
    image: '/images/spacebg.jpg',
  },
  {
    title: 'Supply Chain Solutions',
    description: 'Comprehensive resource acquisition and logistics management tailored to your operational requirements.',
    image: '/images/AydoOffice1.png',
  },
  {
    title: 'Recovery & Assistance',
    description: 'Professional vessel recovery and assistance services, available continuously across all operational sectors.',
    image: '/images/Hull_E.jpg',
  },
  {
    title: 'Strategic Operations',
    description: 'Collaborative ventures and partnerships for complex logistics operations requiring multi-party coordination.',
    image: '/images/logisticsoffice.jpg',
  },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/starcitizen-hulla.webp"
            alt="AydoCorp Logistics Operations"
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
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-8">Our Services</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced logistics solutions for the modern interstellar enterprise
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="relative h-64 overflow-hidden rounded-lg">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                    <p className="text-gray-300">{service.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mg-container p-8 border border-[rgba(var(--mg-primary),0.3)] relative overflow-hidden"
          >
            {/* Enhanced corner brackets with glowing effect */}
            <div className="absolute top-0 left-0 w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
              <div className="absolute top-0 left-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
            </div>
            
            <div className="absolute top-0 right-0 w-12 h-12">
              <div className="absolute top-0 right-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
              <div className="absolute top-0 right-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-12 h-12">
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
              <div className="absolute bottom-0 left-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
            </div>
            
            <div className="absolute bottom-0 right-0 w-12 h-12">
              <div className="absolute bottom-0 right-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
              <div className="absolute bottom-0 right-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)] shadow-[0_0_8px_rgba(var(--mg-primary),0.7)]"></div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Submit your service request and let our team handle your logistics requirements with unmatched efficiency and reliability.
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSekyn2ZhdU9czvQrcLSpo1b0wIzRX__DxLFk89L4Y0NZ8FiwQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Submit Service Request
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 