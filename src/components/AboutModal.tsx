import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, X } from 'lucide-react';
import ThessSpotakiLogo from './ThessSpotakiLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 relative z-10 custom-scrollbar"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="flex flex-col items-center text-center mb-10">
                <ThessSpotakiLogo size="lg" className="mb-4" showText={false} />
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">ThessSpotaki</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Simple route and parking guidance for Thessaloniki.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em]">Map features</p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li className="text-xs font-bold text-slate-600 dark:text-slate-400">Interactive map</li>
                    <li className="text-xs font-bold text-slate-600 dark:text-slate-400">Parking suggestions</li>
                  </ul>
                </div>

                <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    The map works automatically. If you need your own Google Maps setup later, you can get one from Google.
                  </p>
                  <a
                    href="https://developers.google.com/maps/get-started?utm_source=ai-studio&utm_medium=website&utm_campaign=FY26_Q1_maps-demo-key&utm_content=maps-standard-key_api-key-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs transition-colors"
                  >
                    Google Maps docs
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] text-lg tracking-tight shadow-xl"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
