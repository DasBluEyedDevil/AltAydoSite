'use client';

import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import AlliesSection from '../../components/AlliesSection';
import AboutHero from '../../components/about/AboutHero';
import DataFeedSection from '../../components/about/DataFeedSection';
import HistorySection from '../../components/about/HistorySection';
import DirectivesSection from '../../components/about/DirectivesSection';
import JoinCTASection from '../../components/about/JoinCTASection';
import AboutTabs from '../../components/about/AboutTabs';

export default function About() {
  const [time, setTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDataFeedActive, setIsDataFeedActive] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionComplete, setConnectionComplete] = useState(false);
  const [connectionMessages, setConnectionMessages] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const startDataFeed = () => {
    setIsDataFeedActive(true);
    setConnectionProgress(0);
    setConnectionComplete(false);
    setConnectionMessages([]);
  };

  const handleProgressUpdate = (progress: number) => {
    setConnectionProgress(progress);
  };

  const handleConnectionComplete = () => {
    setConnectionComplete(true);
  };

  const handleAddMessage = (message: string) => {
    setConnectionMessages(current => [...current, message]);
  };

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md mx-auto p-6 border border-[rgba(var(--mg-primary),0.3)] rounded-lg bg-gray-900">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4 text-gray-400 text-sm">
            There was an error rendering the About page. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.5)] text-white rounded hover:bg-[rgba(var(--mg-primary),0.3)]"
          >
            Reload Page
          </button>
        </div>
      </div>
    }>
      <>
        <AboutHero
          time={time}
          scrollPosition={scrollPosition}
          onInitializeDataFeed={startDataFeed}
        />

        <DataFeedSection
          isDataFeedActive={isDataFeedActive}
          connectionProgress={connectionProgress}
          connectionComplete={connectionComplete}
          connectionMessages={connectionMessages}
          onProgressUpdate={handleProgressUpdate}
          onConnectionComplete={handleConnectionComplete}
          onAddMessage={handleAddMessage}
        />

        <HistorySection connectionComplete={connectionComplete} />

        <DirectivesSection connectionComplete={connectionComplete} />

        <JoinCTASection connectionComplete={connectionComplete} />

        <AboutTabs />


        {/* Strategic Alliances Section */}
        <AlliesSection />
      </>
    </ErrorBoundary>
  );
} 
