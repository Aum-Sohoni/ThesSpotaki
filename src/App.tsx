/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import AboutModal from './components/AboutModal';
import MapComponent from './components/MapComponent';

const DEFAULT_GOOGLE_MAPS_API_KEY = 'AIzaSyDZpn9e3Xww8FMMW7U49bMNEbg_TiuEmOw';

export default function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || DEFAULT_GOOGLE_MAPS_API_KEY;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    // Initialize theme from system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    // const handler = (e: MediaQueryListEvent) => {
    //   // Only follow system if the user hasn't manually toggled the theme
    //   setThemeOverridden(prev => {
    //     if (!prev) {
    //       setIsDarkMode(e.matches);
    //     }
    //     return prev;
    //   });
    // };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleSetDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!apiKey) return;
    
    // Places UI Kit components often look for a script tag with a key to initialize.
    // When using dynamic loaders, we can help them by ensuring a script tag exists or 
    // by setting the key in a way they can find.
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript && !existingScript.hasAttribute('key')) {
      existingScript.setAttribute('key', apiKey);
    }
  }, [apiKey]);

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-slate-950 transition-colors duration-500">
      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
      
      <div className="flex-1 relative">
        <MapComponent 
          apiKey={apiKey} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={handleSetDarkMode} 
        />
      </div>
    </div>
  );
}
