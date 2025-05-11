'use client';

import React from 'react';

const ReferenceGallerySection = () => {
  return (
    <section className="mt-12">
      <h2 className="mg-title text-2xl mb-6">Futuristic User Interface</h2>
      <p className="mg-text mb-6">
        Our Star Citizen Mobiglass-inspired interface creates an immersive experience with holographic elements, 
        animated grid patterns, and futuristic space environments. The interface is designed to 
        provide both aesthetic appeal and intuitive functionality.
      </p>
      
      <div className="mg-container p-5 holo-element">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <h3 className="mg-subtitle text-lg mb-3">Advanced UI Elements</h3>
            <div className="text-sm opacity-80 space-y-3">
              <p>The interface features translucent panels, dynamic lighting effects, and responsive holographic elements.</p>
              <div className="flex items-start">
                <div className="data-point mt-1 mr-3 opacity-70"></div>
                <p className="opacity-80">Holographic displays with depth and translucency</p>
              </div>
              <div className="flex items-start">
                <div className="data-point mt-1 mr-3 opacity-70"></div>
                <p className="opacity-80">Grid patterns and hexagonal design elements</p>
              </div>
              <div className="flex items-start">
                <div className="data-point mt-1 mr-3 opacity-70"></div>
                <p className="opacity-80">Interactive elements that respond to user actions</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <h3 className="mg-subtitle text-lg mb-3">Immersive Experience</h3>
            <div className="text-sm opacity-80 space-y-3">
              <p>The space-themed backdrop creates an immersive environment with stars, nebulae, and subtle animations.</p>
              <div className="flex items-start">
                <div className="data-point mt-1 mr-3 opacity-70"></div>
                <p className="opacity-80">Dynamic space backdrop with parallax effects</p>
              </div>
              <div className="flex items-start">
                <div className="data-point mt-1 mr-3 opacity-70"></div>
                <p className="opacity-80">Animated scan lines and holographic glitches</p>
              </div>
              <div className="flex items-start">
                <div className="data-point mt-1 mr-3 opacity-70"></div>
                <p className="opacity-80">Subtle data streams and background animations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferenceGallerySection; 