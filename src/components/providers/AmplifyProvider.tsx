'use client';

import { Amplify } from 'aws-amplify';
import { ReactNode, useEffect, useState } from 'react';

// This component configures Amplify for the application
export default function AmplifyProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Only configure Amplify on the client side
    const configureAmplify = async () => {
      try {
        // Try to load amplify_outputs.json
        const response = await fetch('/amplify_outputs.json');
        if (!response.ok) {
          console.warn('Could not load Amplify outputs, using fallback configuration');
          
          // Use a fallback configuration if the file isn't available
          Amplify.configure({
            // Default minimal config with API key auth
            API: {
              GraphQL: {
                endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
                apiKey: process.env.NEXT_PUBLIC_GRAPHQL_API_KEY || '',
                region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
                defaultAuthMode: 'apiKey',
              },
            },
          });
          setIsConfigured(true);
          return;
        }
        
        // If we have an amplify_outputs.json file, use it
        const amplifyOutputs = await response.json();
        
        if (amplifyOutputs && Object.keys(amplifyOutputs).length > 1) {
          console.log('Configuring Amplify with outputs file');
          Amplify.configure(amplifyOutputs);
        } else {
          console.warn('Amplify outputs file exists but is empty or invalid, using fallback configuration');
          // Same fallback as above
          Amplify.configure({
            API: {
              GraphQL: {
                endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
                apiKey: process.env.NEXT_PUBLIC_GRAPHQL_API_KEY || '',
                region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
                defaultAuthMode: 'apiKey',
              },
            },
          });
        }
        
        setIsConfigured(true);
      } catch (error) {
        console.error('Error configuring Amplify:', error);
        // Use local storage only in this case
        setIsConfigured(true);
      }
    };

    configureAmplify();
  }, []);

  // Show a loading state while configuring Amplify
  if (!isConfigured) {
    // You could replace this with a loading spinner
    return null;
  }

  return <>{children}</>;
} 