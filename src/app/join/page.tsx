'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const benefits = [
  {
    title: 'Career Development',
    description: 'Access to advanced training programs, professional certifications, and clear advancement pathways within our organization.',
  },
  {
    title: 'Corporate Culture',
    description: 'Join a dynamic team of professionals dedicated to excellence in interstellar logistics and transportation.',
  },
  {
    title: 'Advanced Resources',
    description: 'Work with cutting-edge technology and infrastructure supporting our interstellar operations.',
  },
  {
    title: 'Operational Experience',
    description: 'Gain hands-on experience in various aspects of interstellar logistics and transportation.',
  },
];

export default function Join() {
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
            src="/images/spacebg.png"
            alt="AydoCorp Operations"
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-8">Join Our Team</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Build your career with a leader in interstellar logistics and transportation
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              Why Choose AydoCorp?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-800/50 p-6 rounded-lg"
                >
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Corporate Vision Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                Our Vision
              </h2>
              <p className="text-gray-300 mb-6">
                At AydoCorp, we're committed to pushing the boundaries of what's possible in interstellar logistics. Our vision extends beyond traditional transportation to creating comprehensive logistics networks that connect the furthest reaches of known space.
              </p>
              <p className="text-gray-300">
                Whether you're an experienced logistics professional or new to the field, we provide the training, resources, and support needed to help you succeed in your career with us.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-64 md:h-96"
            >
              <Image
                src="/images/RSI_AYDO_Corp_image.png"
                alt="AydoCorp Operations"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mg-container p-8 border border-[rgba(var(--mg-primary),0.3)] relative overflow-hidden"
          >
            {/* Content with futuristic design */}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ready to Begin Your Journey?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Take the first step towards a rewarding career in interstellar logistics. Connect with our recruitment team today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://discord.gg/aydocorp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 border border-cyan-500 text-base font-medium rounded-md text-white bg-transparent hover:bg-cyan-900/30 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  <span className="relative z-10">Contact Recruitment</span>
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 border border-cyan-500 text-base font-medium rounded-md text-white bg-transparent hover:bg-cyan-900/30 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  <span className="relative z-10">View Corporate Profile</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
} 