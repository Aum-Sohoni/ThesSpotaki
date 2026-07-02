import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Info, 
  Moon, 
  Sun, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Navigation2, 
  Zap, 
  RotateCcw,
  Accessibility,
  Clock,
  Briefcase,
  Volume2,
  VolumeX,
  Percent,
  Phone,
  ChevronDown,
  X,
  Gauge
} from 'lucide-react';
import { Polyline } from './Polyline';
import ThessSpotakiLogo from './ThessSpotakiLogo';
import { 
  THESSALONIKI_CENTER, 
  ORIGIN_COORD, 
  PARKING_HUBS,
  CONGESTION_PATH, 
  MAP_DARK_STYLES,
  DESTINATION_OPTIONS,
  DestinationOption,
  ParkingHub
} from '../data/mobilityData';

// Custom calming light style for the map
const MAP_LIGHT_STYLES = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f8fafc" }], // Soft slate-50 background
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { weight: 2 }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }], // Soft slate-600 for names
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }], // Soft slate-100
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e2f5e9" }], // Soft pale mint green for parks
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0f766e" }], // Deep teal-green
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }], // Pristine white roads
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }], // Soft border for roads
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e0f2fe" }], // Soft sky blue for highways
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#bae6fd" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e0f2fe" }], // Serene pale blue for water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0369a1" }], // Ocean blue text
  }
];

// Rich Thessaloniki landmarks array for manual pick
const LANDMARKS = [
  { name: "Aristotelous Square", address: "Aristotelous Sq, Thessaloniki", coord: { lat: 40.6322, lng: 22.9406 } },
  { name: "White Tower", address: "Leoforos Nikis, Thessaloniki", coord: { lat: 40.6264, lng: 22.9484 } },
  { name: "Arch of Galerius (Kamara)", address: "Egnatia Avenue, Thessaloniki", coord: { lat: 40.6320, lng: 22.9517 } },
  { name: "Rotunda Historic Site", address: "Platia Agiou Georgiou, Thessaloniki", coord: { lat: 40.6348, lng: 22.9528 } },
  { name: "Ladadika District", address: "Katouni Street, Thessaloniki", coord: { lat: 40.6340, lng: 22.9375 } },
  { name: "Thessaloniki Port Authority", address: "Kountouriotou Str, Thessaloniki", coord: { lat: 40.6355, lng: 22.9335 } },
  { name: "Ano Poli Old Town", address: "Eptapyrgio Corridors, Thessaloniki", coord: { lat: 40.6430, lng: 22.9460 } },
  { name: "Helexpo Exhibition Deck", address: "Egnatia 154, Thessaloniki", coord: { lat: 40.6285, lng: 22.9535 } },
];

interface MapComponentProps {
  apiKey: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function MapComponent({ apiKey, isDarkMode, setIsDarkMode }: MapComponentProps) {
  // State Machine: 1 = Onboarding, 2 = Predictive Analytics, 3 = Smart Intercept
  const [activeState, setActiveState] = useState<1 | 2 | 3>(1);
  const [selectedProfile, setSelectedProfile] = useState<'mobility' | 'elderly' | 'delivery'>('mobility');
  
  // Dynamic Street Selection State
  const [selectedDestId, setSelectedDestId] = useState<string>('tsimiski_104');
  const [isStreetDropdownOpen, setIsStreetDropdownOpen] = useState(false);

  // Custom Accessibility States
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'extra'>('normal');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [subtitles, setSubtitles] = useState('');
  
  // Municipality Assistance Modal State
  const [isAssistanceOpen, setIsAssistanceOpen] = useState(false);

  // Selected Parking Hub (Defaults to Port Garage)
  const [selectedHubId, setSelectedHubId] = useState<string>('port_garage');
  
  // Predictive offset timeline
  const [timeOffset, setTimeOffset] = useState<0 | 15 | 30 | 60>(0);

  // ACCURATE LOCATION SELECTION: Custom dynamic coordinates
  const [originCoord, setOriginCoord] = useState(ORIGIN_COORD);
  const [originText, setOriginText] = useState('Aristotelous Square');
  const [isLandmarkDropdownOpen, setIsLandmarkDropdownOpen] = useState(false);
  const [showPinNotification, setShowPinNotification] = useState<string | null>(null);

  // Navigation completion status
  const [navigationTriggered, setNavigationTriggered] = useState(false);

  // Map viewport bounds
  const [mapZoom, setMapZoom] = useState(15);
  const [mapCenter, setMapCenter] = useState(THESSALONIKI_CENTER);

  const landmarkRef = useRef<HTMLDivElement>(null);

  // Close landmark dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (landmarkRef.current && !landmarkRef.current.contains(event.target as Node)) {
        setIsLandmarkDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find currently active Destination Street Options
  const activeDest = DESTINATION_OPTIONS.find(d => d.id === selectedDestId) || DESTINATION_OPTIONS[0];

  // Find the currently selected Parking Hub
  const activeHub = PARKING_HUBS.find(h => h.id === selectedHubId) || PARKING_HUBS[0];

  // Recalculate dynamic parking spot metrics based on Time Offset & Selected Profile
  const calculatedProbability = Math.max(
    3, 
    Math.round(
      activeHub.probabilityScore - 
      (timeOffset * 0.75) - 
      (selectedProfile === 'delivery' ? 12 : selectedProfile === 'elderly' ? 4 : 0)
    )
  );

  const calculatedVacancies = Math.max(
    0,
    Math.round(
      activeHub.vacantSpaces * (calculatedProbability / activeHub.probabilityScore)
    )
  );

  // Predictive Availability at actual target Destination Block (dynamic live calculation)
  const predictiveDestinationConfidence = Math.max(
    2,
    Math.round(
      activeDest.baseConfidence - 
      (timeOffset * 0.4) - 
      (selectedProfile === 'delivery' ? 4 : 1)
    )
  );

  // Model sensor status indicator confidence calculation
  const modelCertaintyScore = Math.max(89, Math.min(98, 95 + (selectedProfile === 'mobility' ? 3 : -2)));

  // Text Scaling Responsive Helpers
  const getTextClass = (baseSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl') => {
    if (textSize === 'large') {
      if (baseSize === 'xs') return 'text-sm';
      if (baseSize === 'sm') return 'text-base';
      if (baseSize === 'base') return 'text-lg';
      if (baseSize === 'lg') return 'text-xl';
      if (baseSize === 'xl') return 'text-2xl';
      return 'text-3xl';
    }
    if (textSize === 'extra') {
      if (baseSize === 'xs') return 'text-base';
      if (baseSize === 'sm') return 'text-lg';
      if (baseSize === 'base') return 'text-xl';
      if (baseSize === 'lg') return 'text-2xl';
      if (baseSize === 'xl') return 'text-3xl';
      return 'text-4xl';
    }
    // Normal defaults
    if (baseSize === 'xs') return 'text-[11px]';
    if (baseSize === 'sm') return 'text-sm';
    if (baseSize === 'base') return 'text-base';
    if (baseSize === 'lg') return 'text-lg';
    if (baseSize === 'xl') return 'text-xl';
    return 'text-2xl';
  };

  // Stop current Speech Synthesis
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSubtitles('');
  };

  // Speak Aloud / Accessibility Narration Engine
  const handleSpeakAloud = () => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    let message = '';
    if (activeState === 1) {
      message = `Welcome to ThessSpotaki, Thessaloniki's intelligent predictive mobility platform. Currently configured for a route from ${originText} to ${activeDest.name}. Please select your accessibility profile and click Analyze Predictive Route.`;
    } else if (activeState === 2) {
      message = `Congestion alert on your route to ${activeDest.name}. Predicted travel time is ${activeDest.etaTrafficMin} minutes, which includes a ${activeDest.trafficDelayMin} minute traffic overhead via ${activeDest.congestionStreet}. Real-time predictive confidence of finding a free spot on-street at your destination block is critically low at only ${predictiveDestinationConfidence} percent. We advise searching for nearby accessibility-approved intercept hubs.`;
    } else if (activeState === 3) {
      message = `We have calculated the optimal detour solution. We recommend parking at ${activeHub.name}, located ${activeHub.distanceMeters} meters from your destination. The predictive vacant space likelihood is ${calculatedProbability} percent with ${calculatedVacancies} empty slots. The pedestrian walking corridor is verified step-free with zero stairs and ramped curbs. Click Accept Intercept to navigate.`;
    }

    setIsSpeaking(true);
    setSubtitles(message);

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 0.95; // Slightly slower for clear accessibility presentation

    utterance.onend = () => {
      setIsSpeaking(false);
      setSubtitles('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSubtitles('');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleReset = () => {
    stopSpeech();
    setActiveState(1);
    setNavigationTriggered(false);
    setOriginCoord(ORIGIN_COORD);
    setOriginText('Aristotelous Square');
    setMapCenter(THESSALONIKI_CENTER);
    setMapZoom(15);
  };

  const handleAnalyzeRoute = () => {
    stopSpeech();
    setActiveState(2);
    // Focus near origin & Destination block
    setMapCenter({
      lat: (originCoord.lat + activeDest.coordinate.lat) / 2,
      lng: (originCoord.lng + activeDest.coordinate.lng) / 2
    });
    setMapZoom(15);
  };

  const handleSearchIntercepts = () => {
    stopSpeech();
    setActiveState(3);
    // Center around the selected Hub
    setMapCenter(activeHub.coordinate);
    setMapZoom(15);
  };

  const handleAcceptIntercept = () => {
    stopSpeech();
    setNavigationTriggered(true);
    // Zoom directly into walking pathway between selected hub and destination block
    setMapCenter({
      lat: (activeHub.coordinate.lat + activeDest.coordinate.lat) / 2,
      lng: (activeHub.coordinate.lng + activeDest.coordinate.lng) / 2
    });
    setMapZoom(16);
  };

  // Change active Hub
  const handleSelectHub = (hubId: string) => {
    stopSpeech();
    setSelectedHubId(hubId);
    const target = PARKING_HUBS.find(h => h.id === hubId);
    if (target) {
      setMapCenter(target.coordinate);
    }
  };

  // Change destination street
  const handleSelectStreet = (option: DestinationOption) => {
    setSelectedDestId(option.id);
    setIsStreetDropdownOpen(false);
    // Reset back to setup phase since path changes
    setActiveState(1);
    setNavigationTriggered(false);
    setMapCenter(option.coordinate);
    setMapZoom(15);
  };

  // Map Click Listener to accurately select custom origin location
  const handleMapClick = (ev: any) => {
    let clickedLat: number | null = null;
    let clickedLng: number | null = null;

    if (ev.detail && ev.detail.latLng) {
      clickedLat = typeof ev.detail.latLng.lat === 'function' ? ev.detail.latLng.lat() : ev.detail.latLng.lat;
      clickedLng = typeof ev.detail.latLng.lng === 'function' ? ev.detail.latLng.lng() : ev.detail.latLng.lng;
    } else if (ev.latLng) {
      clickedLat = typeof ev.latLng.lat === 'function' ? ev.latLng.lat() : ev.latLng.lat;
      clickedLng = typeof ev.latLng.lng === 'function' ? ev.latLng.lng() : ev.latLng.lng;
    }

    if (clickedLat !== null && clickedLng !== null) {
      setOriginCoord({ lat: clickedLat, lng: clickedLng });
      const customName = `Custom Location Pin (${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`;
      setOriginText(customName);
      
      // Flash a beautiful calming toast
      setShowPinNotification(`Custom location pinned! Travel paths dynamically adjusted.`);
      setTimeout(() => setShowPinNotification(null), 4000);

      // Re-center around custom node
      setMapCenter({ lat: clickedLat, lng: clickedLng });
    }
  };

  return (
    <div className={`w-full h-full relative flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* SIDEBAR UTILITY DRAWER (Width: 380px) */}
      <div 
        id="thesspotaki-sidebar" 
        className={`w-full md:w-[380px] shrink-0 border-b md:border-b-0 md:border-r flex flex-col h-auto md:h-full z-10 relative transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900/95 border-slate-800 text-white shadow-2xl' 
            : 'bg-white/95 border-slate-100 text-slate-800 shadow-[5px_0_30px_rgba(15,23,42,0.03)] backdrop-blur-md'
        }`}
      >
        {/* Soft Ambient Diffused Light Glow inside sidebar header */}
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-blue-500/5 via-emerald-500/2 to-transparent pointer-events-none" />

        {/* Header Branding Row */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors duration-300 relative z-10 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/40'
        }`}>
          <ThessSpotakiLogo size="md" />

          <div className="flex items-center gap-1.5">
            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-xs'
              }`}
              title={isDarkMode ? "Switch to serene Light Map" : "Switch to Dark Map"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
            
            {/* Reset flow */}
            {(activeState > 1 || navigationTriggered || originText !== 'Aristotelous Square') && (
              <button
                onClick={handleReset}
                className={`p-2 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs'
                }`}
                title="Reset Route Flow"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ACCESSIBILITY UTILITY ROW: Text Scaling + Text-To-Speech Assist */}
        <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-mono transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50/30 border-slate-100 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500 mr-1 font-bold">Text:</span>
            <button 
              onClick={() => setTextSize('normal')} 
              className={`px-2 py-0.5 rounded-lg font-black text-[10px] border transition-all ${
                textSize === 'normal' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xs' 
                  : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
              }`}
            >
              A
            </button>
            <button 
              onClick={() => setTextSize('large')} 
              className={`px-2 py-0.5 rounded-lg font-black text-[10px] border transition-all ${
                textSize === 'large' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xs' 
                  : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
              }`}
            >
              A+
            </button>
            <button 
              onClick={() => setTextSize('extra')} 
              className={`px-2 py-0.5 rounded-lg font-black text-[10px] border transition-all ${
                textSize === 'extra' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xs' 
                  : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
              }`}
            >
              A++
            </button>
          </div>

          <button 
            onClick={handleSpeakAloud}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
              isSpeaking 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 animate-pulse' 
                : isDarkMode 
                  ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isSpeaking ? 'Mute' : 'Speak'}</span>
          </button>
        </div>

        {/* STATE MACHINE NAVIGATION INDICATOR BAR */}
        <div className={`px-4 py-3 border-b flex items-center justify-between text-[10px] font-mono transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-100 text-slate-500'
        }`}>
          <button 
            onClick={() => { stopSpeech(); setActiveState(1); setNavigationTriggered(false); }} 
            className={`flex items-center gap-1.5 font-bold transition-all ${
              activeState === 1 
                ? 'text-blue-600 dark:text-blue-400' 
                : isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeState === 1 ? 'bg-blue-600 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
            1. ONBOARD
          </button>
          <span className="text-slate-300 dark:text-slate-700 font-bold">➔</span>
          <button 
            onClick={() => { stopSpeech(); setActiveState(2); setNavigationTriggered(false); }} 
            className={`flex items-center gap-1.5 font-bold transition-all ${
              activeState === 2 
                ? 'text-rose-500' 
                : isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
            disabled={activeState < 2}
          >
            <span className={`w-2 h-2 rounded-full ${activeState === 2 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
            2. PREDICTIVE
          </button>
          <span className="text-slate-300 dark:text-slate-700 font-bold">➔</span>
          <button 
            onClick={() => { stopSpeech(); setActiveState(3); }} 
            className={`flex items-center gap-1.5 font-bold transition-all ${
              activeState === 3 
                ? 'text-emerald-500' 
                : isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
            disabled={activeState < 3}
          >
            <span className={`w-2 h-2 rounded-full ${activeState === 3 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
            3. INTERCEPT
          </button>
        </div>

        {/* LIVE AUDIO SUBTITLE BUBBLE FOR HEARING IMPAIRMENTS */}
        {isSpeaking && subtitles && (
          <div className={`px-4 py-3 border-b text-[11px] leading-relaxed font-mono flex gap-2 items-start ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-blue-50/50 border-blue-100/30 text-slate-700'
          }`}>
            <Volume2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase block leading-none mb-1">Accessibility Subtitles</span>
              "{subtitles}"
            </div>
          </div>
        )}

        {/* PIN PLACEMENT FLOATING BANNER NOTIFICATION (CALMING ACCENT TO CONFIRM INTERACTION) */}
        <AnimatePresence>
          {showPinNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-mono flex items-start gap-2 shadow-sm relative z-20"
            >
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-950">Location Selected Successfully!</strong>
                {showPinNotification}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CENTRAL SCROLLABLE SIDEBAR ACTION HUB */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-10">

          {/* STATE 1: Dynamic Destination Street Picker & Profile Setup */}
          <div className={`space-y-4 transition-all duration-300 ${activeState !== 1 ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 font-mono ${getTextClass('xs')}`}>
                State 1: Search & Destination
              </h2>
              {activeState === 1 && (
                <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold uppercase tracking-widest font-mono">Setup</span>
              )}
            </div>

            <div className="space-y-4">
              {/* ACCURATE LANDMARK & CUSTOM MAP SELECTION FIELD */}
              <div ref={landmarkRef} className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className={`font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  } ${getTextClass('xs')}`}>
                    Origin Location
                  </label>
                  <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 animate-pulse text-blue-600" /> Click Map to Pin
                  </span>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    value={originText} 
                    onChange={(e) => {
                      setOriginText(e.target.value);
                      setIsLandmarkDropdownOpen(true);
                    }}
                    onFocus={() => setIsLandmarkDropdownOpen(true)}
                    placeholder="Search landmarks or click map..."
                    className={`w-full p-3 text-xs rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 shadow-xs'
                    }`}
                  />
                  <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5">
                    {originText !== 'Aristotelous Square' && (
                      <button 
                        onClick={() => {
                          setOriginCoord(ORIGIN_COORD);
                          setOriginText('Aristotelous Square');
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-pulse" />
                  </div>
                </div>

                {/* Dynamic Dropdown for Landmarks search */}
                {isLandmarkDropdownOpen && (
                  <div className={`absolute top-full left-0 right-0 mt-1.5 border rounded-2xl shadow-xl z-50 overflow-hidden font-mono text-xs max-h-[220px] overflow-y-auto ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-700'
                  }`}>
                    <div className={`p-2 border-b text-[9px] font-black uppercase tracking-wider ${
                      isDarkMode ? 'bg-slate-950 text-slate-500 border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      Thessaloniki Neighborhoods & Sights
                    </div>
                    {LANDMARKS.filter(lm => lm.name.toLowerCase().includes(originText.toLowerCase()) || originText.trim() === '' || originText.startsWith('Custom')).map((lm) => (
                      <button
                        key={lm.name}
                        type="button"
                        onClick={() => {
                          setOriginCoord(lm.coord);
                          setOriginText(lm.name);
                          setIsLandmarkDropdownOpen(false);
                          setMapCenter(lm.coord);
                        }}
                        className={`w-full p-2.5 text-left transition-colors border-b last:border-0 flex flex-col ${
                          isDarkMode 
                            ? 'border-slate-800 hover:bg-slate-800/80 text-slate-300' 
                            : 'border-slate-50 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {lm.name}
                        </span>
                        <span className="text-[10px] text-slate-400 pl-5">{lm.address}</span>
                      </button>
                    ))}
                    <div className={`p-2.5 text-[9.5px] italic leading-tight text-center border-t ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}>
                      📍 Tip: You can also tap anywhere on the map to set a custom pin coordinates manually.
                    </div>
                  </div>
                )}
              </div>

              {/* DYNAMIC DESTINATION PICKER */}
              <div className="space-y-1.5 relative">
                <label className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                } ${getTextClass('xs')}`}>
                  Destination Street Corridor
                </label>
                
                <button
                  type="button"
                  onClick={() => setIsStreetDropdownOpen(!isStreetDropdownOpen)}
                  className={`w-full p-3 text-xs rounded-xl border transition-all flex items-center justify-between font-mono text-left ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-700 text-white hover:border-blue-500' 
                      : 'bg-white border-slate-200 text-slate-800 hover:border-blue-500 shadow-xs'
                  }`}
                >
                  <span className="truncate pr-2 font-bold">{activeDest.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {isStreetDropdownOpen && (
                  <div className={`absolute top-full left-0 right-0 mt-1.5 border rounded-2xl shadow-xl z-50 overflow-hidden font-mono text-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-700'
                  }`}>
                    <div className={`p-2 border-b text-[9px] font-black uppercase ${
                      isDarkMode ? 'bg-slate-950 text-slate-500 border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      Select Destination Corridor:
                    </div>
                    {DESTINATION_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectStreet(option)}
                        className={`w-full p-2.5 text-left transition-colors border-b last:border-0 block ${
                          selectedDestId === option.id 
                            ? 'bg-blue-600/10 text-blue-600 font-black' 
                            : isDarkMode 
                              ? 'border-slate-800 text-slate-300 hover:bg-slate-800' 
                              : 'border-slate-50 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{option.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{option.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Segmented Profile Selector */}
              <div className="space-y-1.5">
                <label className={`font-semibold transition-colors duration-300 block ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                } ${getTextClass('xs')}`}>
                  Access Mobility Profile Preset
                </label>
                
                <div className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl border transition-colors duration-300 ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  {[
                    { id: 'mobility', label: '♿ Reduced', icon: Accessibility },
                    { id: 'elderly', label: '👵 Elderly', icon: Clock },
                    { id: 'delivery', label: '📦 Delivery', icon: Briefcase }
                  ].map((profile) => {
                    const Icon = profile.icon;
                    const isActive = selectedProfile === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => setSelectedProfile(profile.id as any)}
                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 scale-102 font-bold'
                            : isDarkMode 
                              ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[9px] font-black uppercase leading-none tracking-wider">{profile.label.split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeState === 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyzeRoute}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4 ${getTextClass('sm')}`}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  Analyze Predictive Route
                </motion.button>
              )}
            </div>
          </div>

          {/* STATE 2: The Predictive Congestion Analytics Drawer */}
          <AnimatePresence>
            {activeState >= 2 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`space-y-4 border-t border-dashed pt-5 transition-all duration-300 ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                } ${activeState !== 2 ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className={`uppercase tracking-wider font-bold text-rose-500 font-mono flex items-center gap-1.5 ${getTextClass('xs')}`}>
                    State 2: Congestion Analytics
                  </h2>
                  {activeState === 2 && (
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold uppercase tracking-widest font-mono">Live Block</span>
                  )}
                </div>

                {/* Travel Telemetry display */}
                <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                } space-y-2.5`}>
                  <div className="flex items-baseline justify-between">
                    <span className={`font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ${getTextClass('xs')}`}>Current Travel Time</span>
                    <span className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} ${getTextClass('base')}`}>ETA: {activeDest.etaTrafficMin} min</span>
                  </div>
                  <div className={`text-rose-500 font-semibold flex items-center gap-1.5 ${getTextClass('xs')}`}>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>+{activeDest.trafficDelayMin} min traffic overhead via {activeDest.congestionStreet}</span>
                  </div>
                </div>

                {/* REAL-TIME PREDICTIVE DATA LAYER */}
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-rose-500" />
                      <span className={`font-bold font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} ${getTextClass('xs')}`}>DESTINATION OCCUPANCY RISK</span>
                    </div>
                    <span className={`font-black text-rose-500 ${getTextClass('xs')}`}>{predictiveDestinationConfidence}% Free Slots</span>
                  </div>

                  {/* Horizontal Bar Visualizer */}
                  <div className={`h-2.5 w-full rounded-full overflow-hidden relative ${
                    isDarkMode ? 'bg-slate-800' : 'bg-slate-150 bg-slate-200/50'
                  }`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${predictiveDestinationConfidence}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                    />
                  </div>

                  <div className={`text-xs p-3 rounded-xl border leading-relaxed font-mono ${
                    isDarkMode 
                      ? 'bg-amber-500/5 border-amber-500/10 text-amber-200' 
                      : 'bg-amber-500/5 border-amber-500/10 text-amber-700'
                  }`}>
                    Critical Spot-Loss Risk: This block is predicted to be 100% occupied before your arrival window.
                  </div>
                </div>

                {activeState === 2 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearchIntercepts}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black bg-gradient-to-r from-rose-600 to-rose-500 text-white transition-all shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2 ${getTextClass('sm')}`}
                  >
                    <Zap className="w-4 h-4 text-white animate-pulse" />
                    Search Intercept Hubs
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATE 3: Smart Intercept Reroute Panel */}
          <AnimatePresence>
            {activeState >= 3 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`space-y-4 border-t border-dashed pt-5 transition-colors duration-300 ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className={`uppercase tracking-wider font-bold text-emerald-500 font-mono ${getTextClass('xs')}`}>
                    State 3: Smart Intercept Reroute
                  </h2>
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase tracking-widest font-mono">Optimized</span>
                </div>

                {/* ARRIVAL TIMESPAN PICKER */}
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono font-bold ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    } ${getTextClass('xs')}`}>PREDICT ARRIVAL TIME WINDOW</span>
                    <span className="text-[9px] text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-bold font-mono">LIVE FEED</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { offset: 0, label: 'Now' },
                      { offset: 15, label: '+15m' },
                      { offset: 30, label: '+30m' },
                      { offset: 60, label: '+1h' }
                    ].map((item) => (
                      <button
                        key={item.offset}
                        onClick={() => setTimeOffset(item.offset as any)}
                        className={`py-2 text-center text-[10px] font-black rounded-xl font-mono border transition-all ${
                          timeOffset === item.offset 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/10' 
                            : isDarkMode 
                              ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900' 
                              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-xs'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* INTERACTIVE HUB LIST */}
                <div className="space-y-2">
                  <label className={`font-bold font-mono block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  } ${getTextClass('xs')}`}>
                    PREDICTED NEARBY INTERCEPT HUBS
                  </label>

                  <div className="space-y-2.5 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                    {PARKING_HUBS.map((hub) => {
                      const isSelected = hub.id === selectedHubId;
                      const prob = Math.max(
                        3, 
                        Math.round(
                          hub.probabilityScore - 
                          (timeOffset * 0.75) - 
                          (selectedProfile === 'delivery' ? 12 : selectedProfile === 'elderly' ? 4 : 0)
                        )
                      );
                      const vac = Math.max(0, Math.round(hub.vacantSpaces * (prob / hub.probabilityScore)));

                      return (
                        <div
                          key={hub.id}
                          onClick={() => handleSelectHub(hub.id)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected 
                              ? isDarkMode 
                                ? 'bg-slate-900 border-2 border-emerald-500 shadow-xl' 
                                : 'bg-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/5' 
                              : isDarkMode 
                                ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700' 
                                : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-black tracking-tight leading-tight ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            } ${getTextClass('xs')}`}>
                              {hub.name}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-black ${
                              prob > 75 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                : prob > 40 
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                              {prob}% Probable
                            </span>
                          </div>

                          <p className={`text-[10px] mb-2 font-mono ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {hub.distanceMeters}m Walk • {hub.walkingTimeMin} min path
                          </p>

                          <div className="flex flex-wrap gap-1.5 items-center">
                            {hub.features.slice(0, 2).map((feat, idx) => (
                              <span key={idx} className={`text-[8.5px] font-mono px-2 py-0.5 rounded-md border ${
                                isDarkMode 
                                  ? 'bg-slate-900 border-slate-800 text-slate-300' 
                                  : 'bg-slate-50 border-slate-150 text-slate-600'
                              }`}>
                                {feat}
                              </span>
                            ))}
                            <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded-md border ml-auto font-black ${
                              isDarkMode 
                                ? 'bg-blue-950/40 border-blue-900/30 text-blue-400' 
                                : 'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                              Rating: {hub.accessibilityRating}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* THE REAL-TIME PREDICTIVE MODEL CONFIDENCE METADATA */}
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                } space-y-2.5`}>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={`flex items-center gap-1.5 font-bold ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <Gauge className="w-4 h-4 text-[#10B981]" />
                      MODEL FORECAST CERTAINTY
                    </span>
                    <span className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{modelCertaintyScore}% (High)</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                  }`}>
                    <div className="h-full bg-emerald-500" style={{ width: `${modelCertaintyScore}%` }} />
                  </div>
                  <p className={`text-[9px] leading-tight font-mono ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Generated via real-time sensory data matching from HIT & CERTH predictive historical block occupancy tensors.
                  </p>
                </div>

                {/* Recommended Route Detail Description Container */}
                <div className={`p-4 rounded-2xl border-2 space-y-3 shadow-xl relative overflow-hidden transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-900/80 border-emerald-500/30' 
                    : 'bg-emerald-50/20 border-emerald-500/20'
                }`}>
                  <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider font-mono">
                      Recommended Action
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">{activeHub.walkingTimeMin}m Walk</span>
                  </div>

                  <p className={`text-xs leading-relaxed ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Divert to <strong className="text-emerald-600 dark:text-emerald-300">{activeHub.name}</strong> ({activeHub.distanceMeters}m from destination). Verified step-free accessible pedestrian corridor to target destination (0 stairs, ramped curbs).
                  </p>

                  <div className={`flex items-center gap-3.5 text-[10px] font-mono pt-1.5 border-t ${
                    isDarkMode ? 'border-slate-800 text-slate-400' : 'border-emerald-500/10 text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1">
                      <Accessibility className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Step-Free Ramps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tactile Pavings</span>
                    </div>
                  </div>
                </div>

                {/* Primary Navigate Action Button */}
                {!navigationTriggered ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAcceptIntercept}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 ${getTextClass('sm')}`}
                  >
                    <Navigation2 className="w-4 h-4 fill-current text-black animate-bounce" />
                    Accept Intercept & Navigate
                  </motion.button>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono shadow-xs">
                    ✓ DETOUR ACTIVE: PARKING RESERVED AT {activeHub.name.toUpperCase()}
                    <p className={`text-[9px] font-normal mt-1 uppercase ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>Pedestrian accessibility corridor mapped</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* MUNICIPALITY HELPLINE ACTION BUTTON */}
        <div className={`p-4 border-t flex flex-col gap-2 shrink-0 transition-colors duration-300 relative z-10 ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/50 border-slate-100'
        }`}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAssistanceOpen(true)}
            className={`w-full py-2.5 px-3 rounded-xl border hover:text-white transition-colors text-xs font-black tracking-wide flex items-center justify-center gap-2 uppercase font-mono ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white shadow-xs'
            }`}
          >
            <Phone className="w-4 h-4 text-blue-600" />
            Call Helpline for Assistance
          </motion.button>
          
          <div className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-mono font-bold tracking-wider uppercase">
            CERTH & HIT REAL-TIME MOBILITY FEED
          </div>
        </div>
      </div>

      {/* LIVE GOOGLE MAPS CORE VIEWPORT */}
      <div className="flex-1 h-full relative min-h-[400px]">
        {/* Soft, Diffused Lighting Visual Indicator Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] font-mono text-xs max-w-xs pointer-events-none select-none">
          <div className="font-bold text-slate-900 dark:text-white mb-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Interactive Map Selection
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Click anywhere on the map to manually set a dynamic custom starting point coordinates instantly.
          </p>
        </div>

        <APIProvider apiKey={apiKey} libraries={['marker', 'geometry', 'core']} version="weekly">
          <GoogleMap
            center={mapCenter}
            zoom={mapZoom}
            renderingType="VECTOR"
            mapId="DEMO_MAP_ID"
            colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
            styles={isDarkMode ? MAP_DARK_STYLES : MAP_LIGHT_STYLES}
            className="w-full h-full min-h-[400px]"
            disableDefaultUI={false}
            mapTypeControl={false}
            onClick={handleMapClick}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio', 'ais_demo_api_key_applet_ts9a8b7c6d']}
            clickableIcons={false}
          >
            {/* Origin Marker */}
            <AdvancedMarker position={originCoord}>
              <div className="relative group flex flex-col items-center">
                <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-800 text-[9px] font-bold font-mono px-2.5 py-1 rounded-xl shadow-xl border border-slate-700/20 whitespace-nowrap mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  Origin: {originText.split(' (')[0]}
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
            </AdvancedMarker>

            {/* Target Destination Block Marker (Dynamic based on selected street) */}
            <AdvancedMarker position={activeDest.coordinate}>
              <div className="relative group flex flex-col items-center">
                <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-800 text-[9px] font-bold font-mono px-2.5 py-1 rounded-xl shadow-xl border border-slate-700/20 whitespace-nowrap mb-1 flex items-center gap-1">
                  🏁 Target: {activeDest.name.split(' (')[0]}
                </div>
                <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shadow-xl">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </AdvancedMarker>

            {/* Red Bottleneck Path connected dynamically to originCoord */}
            {activeState >= 2 && (
              <Polyline 
                path={[originCoord, ...CONGESTION_PATH.slice(1)]}
                strokeColor="#EF4444"
                strokeWeight={activeState === 2 ? 6 : 2.5}
                strokeOpacity={activeState === 2 ? 1.0 : 0.35}
              />
            )}

            {/* State 3 Detour and Walking Corridor Reaction */}
            {activeState === 3 && (
              <>
                {/* Solid Hellenic Blue Polyline connected dynamically to originCoord */}
                <Polyline 
                  path={[originCoord, ...activeHub.routePath.slice(1)]}
                  strokeColor="#2563EB"
                  strokeWeight={6}
                  strokeOpacity={1.0}
                />

                {/* Mint Green Dotted walking path from selected Hub to Destination */}
                <Polyline 
                  path={activeHub.walkingPath}
                  strokeColor="#10B981"
                  strokeWeight={3.5}
                  strokeOpacity={0.9}
                  strokeStyle="dashed"
                />

                {/* Drop custom Mint Green marker bubble pin directly over the currently selected Hub */}
                <AdvancedMarker position={activeHub.coordinate}>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative flex flex-col items-center"
                  >
                    {/* Floating Bubble Pin */}
                    <div className="bg-[#10B981] text-black text-xs font-black px-3.5 py-2.5 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-1.5 whitespace-nowrap -translate-y-2 select-none">
                      <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px] text-white font-mono font-black">P</span>
                      {activeHub.name} | {calculatedVacancies} Vacancies Open
                    </div>
                    {/* Arrow Pointer */}
                    <div className="w-3.5 h-3.5 bg-[#10B981] rotate-45 border-r border-b border-white -translate-y-3.5 shadow-lg" />
                  </motion.div>
                </AdvancedMarker>
              </>
            )}

          </GoogleMap>
        </APIProvider>
      </div>

      {/* ACCESSIBILITY & CITIZEN MUNICIPAL ASSISTANCE HELPLINE MODAL */}
      <AnimatePresence>
        {isAssistanceOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssistanceOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`border rounded-3xl p-6 max-w-md w-full relative z-20 shadow-2xl font-mono ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              <button 
                onClick={() => setIsAssistanceOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#2563EB]">
                  <Phone className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Thessaloniki Municipality</h3>
                  <p className="text-[10px] text-slate-400">Direct Citizen & Mobility Assistance Desk</p>
                </div>
              </div>

              <div className="space-y-4 my-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                <p>
                  Need wheelchair navigation support, temporary access permits, or live guidance? Contact the municipal support desks below:
                </p>

                <div className="space-y-2">
                  <a 
                    href="tel:+302313317777" 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 hover:border-blue-500 text-white hover:text-blue-400' 
                        : 'bg-slate-50 border-slate-150 hover:bg-white hover:border-blue-500 text-slate-800 hover:text-blue-600 shadow-xs'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-black">Citizen Helpline Desk</span>
                      <strong>+30 2313 317777</strong>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
                  </a>

                  <a 
                    href="tel:+302313318204" 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 hover:border-blue-500 text-white hover:text-blue-400' 
                        : 'bg-slate-50 border-slate-150 hover:bg-white hover:border-blue-500 text-slate-800 hover:text-blue-600 shadow-xs'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-black">Accessibility Support Desk</span>
                      <strong>+30 2313 318204</strong>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] leading-relaxed">
                  ✓ Step-free accessibility assistants are available for active dispatches between 08:00 and 20:00.
                </div>
              </div>

              <button
                onClick={() => setIsAssistanceOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-600/10"
              >
                Close Helpline Panel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
