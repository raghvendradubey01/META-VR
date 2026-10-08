/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { TabletopCanvas } from './components/TabletopCanvas';
import { ProjectSetupVerifier } from './components/ProjectSetupVerifier';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { VillagerInspector } from './components/VillagerInspector';
import { GestureControls } from './components/GestureControls';
import { SaveDataViewer } from './components/SaveDataViewer';
import { Villager, WeatherType, GestureType, IslandState } from './types/game';
import { getFallbackDialogue } from './utils/dialogueBank';
import { 
  ShieldCheck, 
  Gamepad2, 
  Users, 
  FolderTree, 
  Database, 
  Sun, 
  CloudRain, 
  Wind, 
  Waves,
  Clock,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';

const INITIAL_VILLAGERS: Villager[] = [
  {
    id: 'v1',
    name: 'Finn',
    personality: 'devout',
    needs: { food: 75, water: 80, warmth: 70, safety: 90, faith: 85 },
    currentAction: 'praying',
    x: -0.2,
    z: -0.9,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'I shall place our freshest harvest at the sacred stone altar.',
    memories: [
      { day: 1, type: 'blessing', description: 'Felt the gentle radiant warmth of the divine sun.', sentiment: 'positive' }
    ],
    color: '#38bdf8'
  },
  {
    id: 'v2',
    name: 'Isla',
    personality: 'hardworking',
    needs: { food: 60, water: 45, warmth: 65, safety: 85, faith: 70 },
    currentAction: 'farming',
    x: -0.9,
    z: 0.5,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'The wheat plots are drinking the soil moisture eagerly.',
    memories: [
      { day: 1, type: 'blessing', description: 'Watched the clouds part after the morning harvest.', sentiment: 'positive' }
    ],
    color: '#4ade80'
  },
  {
    id: 'v3',
    name: 'Theo',
    personality: 'skeptic',
    needs: { food: 85, water: 30, warmth: 50, safety: 75, faith: 35 },
    currentAction: 'drinking',
    x: 0.9,
    z: -0.2,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'We must rely only on our own two hands; the heavens remain silent.',
    memories: [
      { day: 1, type: 'drought', description: 'Had to queue by the freshwater stone well.', sentiment: 'neutral' }
    ],
    color: '#f97316'
  },
  {
    id: 'v4',
    name: 'Maya',
    personality: 'cheerful',
    needs: { food: 90, water: 85, warmth: 80, safety: 95, faith: 80 },
    currentAction: 'celebrating',
    x: 0.3,
    z: 0.3,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'What a wondrous day to dwell on this blessed island!',
    memories: [
      { day: 1, type: 'miracle', description: 'Saw the giant hands shape the clouds.', sentiment: 'positive' }
    ],
    color: '#e879f9'
  },
  {
    id: 'v5',
    name: 'Bram',
    personality: 'timid',
    needs: { food: 55, water: 70, warmth: 40, safety: 50, faith: 60 },
    currentAction: 'warming',
    x: 0.1,
    z: 0.05,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'My hands are stiff from the frost. Let us gather around the central bonfire.',
    memories: [
      { day: 1, type: 'storm', description: 'Startled by whistling sea gales.', sentiment: 'negative' }
    ],
    color: '#fbbf24'
  },
  {
    id: 'v6',
    name: 'Lyra',
    personality: 'devout',
    needs: { food: 70, water: 65, warmth: 75, safety: 80, faith: 92 },
    currentAction: 'praying',
    x: -0.4,
    z: -0.8,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'Praise the unseen hands! The island hums with divine favor.',
    memories: [
      { day: 1, type: 'prayer_answered', description: 'Heard the whisper of the tabletop winds.', sentiment: 'positive' }
    ],
    color: '#a78bfa'
  },
  {
    id: 'v7',
    name: 'Kael',
    personality: 'hardworking',
    needs: { food: 65, water: 50, warmth: 60, safety: 85, faith: 65 },
    currentAction: 'farming',
    x: -0.8,
    z: 0.7,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'The storage cellar needs another sack before sunset.',
    memories: [
      { day: 1, type: 'blessing', description: 'Planted wheat under sunny skies.', sentiment: 'positive' }
    ],
    color: '#34d399'
  },
  {
    id: 'v8',
    name: 'Nora',
    personality: 'cheerful',
    needs: { food: 80, water: 75, warmth: 70, safety: 90, faith: 78 },
    currentAction: 'idle',
    x: 0.4,
    z: -0.5,
    isInspected: false,
    heldHeight: 0,
    recentDialogue: 'The sweet water flows, the hearth is warm, and our bellies are full!',
    memories: [
      { day: 1, type: 'blessing', description: 'Watched the shoreline waves glisten.', sentiment: 'positive' }
    ],
    color: '#f43f5e'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'setup' | 'prototype' | 'villagers' | 'architecture' | 'save'
  >('setup');

  const [islandState, setIslandState] = useState<IslandState>({
    day: 1,
    timeOfDay: 0.35, // morning-afternoon
    weather: 'calm',
    temperature: 22,
    soilMoisture: 60,
    cropYield: 75,
    waterReservoir: 80,
    sacredShrineGlow: 85,
    activeGesture: null,
    gestureIntensity: 1
  });

  const [villagers, setVillagers] = useState<Villager[]>(INITIAL_VILLAGERS);
  const [selectedVillagerId, setSelectedVillagerId] = useState<string | null>('v1');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Background simulation tick (needs degradation, action transitions)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setIslandState(prev => {
        // Advance time of day slowly (representing 5-8 min session)
        const nextTime = (prev.timeOfDay + 0.002) % 1;
        const nextDay = prev.timeOfDay > 0.99 ? prev.day + 1 : prev.day;

        // Weather impacts on soil and temperature
        let nextTemp = prev.temperature;
        let nextMoisture = prev.soilMoisture;
        let nextWater = prev.waterReservoir;

        if (prev.weather === 'sunny') {
          nextTemp = Math.min(32, nextTemp + 0.2);
          nextMoisture = Math.max(10, nextMoisture - 0.3);
        } else if (prev.weather === 'rainy') {
          nextTemp = Math.max(16, nextTemp - 0.2);
          nextMoisture = Math.min(100, nextMoisture + 0.8);
          nextWater = Math.min(100, nextWater + 0.6);
        } else if (prev.weather === 'windy') {
          nextTemp = Math.max(14, nextTemp - 0.3);
        } else {
          // calm
          nextTemp = nextTemp > 22 ? nextTemp - 0.1 : nextTemp + 0.1;
        }

        return {
          ...prev,
          day: nextDay,
          timeOfDay: nextTime,
          temperature: parseFloat(nextTemp.toFixed(1)),
          soilMoisture: parseFloat(nextMoisture.toFixed(1)),
          waterReservoir: parseFloat(nextWater.toFixed(1))
        };
      });

      // Villagers need decay and utility decisions
      setVillagers(prevList =>
        prevList.map(v => {
          if (v.heldHeight > 0) return v; // suspended in air

          const newNeeds = { ...v.needs };
          newNeeds.food = Math.max(0, newNeeds.food - 0.15);
          newNeeds.water = Math.max(0, newNeeds.water - 0.2);

          if (islandState.weather === 'sunny') {
            newNeeds.warmth = Math.min(100, newNeeds.warmth + 0.4);
          } else if (islandState.weather === 'windy') {
            newNeeds.warmth = Math.max(0, newNeeds.warmth - 0.4);
            newNeeds.safety = Math.max(20, newNeeds.safety - 0.2);
          } else {
            newNeeds.warmth = Math.max(15, newNeeds.warmth - 0.1);
          }

          // Local Utility Action Selection
          let nextAction = v.currentAction;
          if (newNeeds.water < 35 && islandState.waterReservoir > 15) {
            nextAction = 'drinking';
            newNeeds.water = Math.min(100, newNeeds.water + 3);
          } else if (newNeeds.food < 40 && islandState.cropYield > 20) {
            nextAction = 'farming';
            newNeeds.food = Math.min(100, newNeeds.food + 2.5);
          } else if (newNeeds.warmth < 35) {
            nextAction = 'warming';
            newNeeds.warmth = Math.min(100, newNeeds.warmth + 3);
          } else if (newNeeds.faith > 70) {
            nextAction = 'praying';
          } else {
            nextAction = 'idle';
          }

          return {
            ...v,
            needs: newNeeds,
            currentAction: nextAction
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulating, islandState.weather, islandState.waterReservoir, islandState.cropYield]);

  // Handle God Gestures
  const handleTriggerGesture = (gesture: GestureType) => {
    setIslandState(prev => ({
      ...prev,
      activeGesture: gesture
    }));

    if (gesture === 'rub_palms') {
      setIslandState(prev => ({ ...prev, weather: 'sunny', activeGesture: gesture }));
      addMemoryToAll('blessing', 'Blessed by warm golden sunlight from the rubbing hands.', 'positive');
    } else if (gesture === 'flick_down') {
      setIslandState(prev => ({ ...prev, weather: 'rainy', activeGesture: gesture }));
      addMemoryToAll('blessing', 'Sweet rain showers showered the village from the flicking sky.', 'positive');
    } else if (gesture === 'sweep_flat') {
      setIslandState(prev => ({ ...prev, weather: 'windy', activeGesture: gesture }));
      addMemoryToAll('storm', 'A sweeping divine hand summoned whistling offshore gales.', 'neutral');
    } else if (gesture === 'palm_down') {
      setIslandState(prev => ({ ...prev, weather: 'calm', activeGesture: gesture }));
      addMemoryToAll('blessing', 'A steady downward palm quieted the elements into tranquil peace.', 'positive');
    } else if (gesture === 'pinch_lift') {
      if (selectedVillagerId) {
        handlePinchLift(selectedVillagerId);
      }
    }

    setTimeout(() => {
      setIslandState(prev => ({ ...prev, activeGesture: null }));
    }, 2200);
  };

  const addMemoryToAll = (
    type: 'blessing' | 'storm' | 'drought' | 'miracle' | 'lifted' | 'prayer_answered',
    description: string,
    sentiment: 'positive' | 'negative' | 'neutral'
  ) => {
    setVillagers(prev =>
      prev.map(v => ({
        ...v,
        recentDialogue: getFallbackDialogue(v, islandState.weather),
        memories: [
          { day: islandState.day, type, description, sentiment },
          ...v.memories.slice(0, 6)
        ]
      }))
    );
  };

  const handlePinchLift = (villagerId: string) => {
    setVillagers(prev =>
      prev.map(v => {
        if (v.id === villagerId) {
          const isNowHeld = v.heldHeight === 0;
          const updated: Villager = {
            ...v,
            isInspected: isNowHeld,
            heldHeight: isNowHeld ? 0.9 : 0,
            recentDialogue: isNowHeld
              ? 'Whoa! The giant hands have lifted me into the sky! Be gentle, O Great One!'
              : 'Safely placed back upon the green earth. Thank you, Sky Guardian!'
          };
          if (isNowHeld) {
            updated.memories = [
              {
                day: islandState.day,
                type: 'lifted',
                description: 'Lifted high into the heavens by the God Hand for inspection.',
                sentiment: 'positive'
              },
              ...v.memories.slice(0, 5)
            ];
          }
          return updated;
        }
        return v;
      })
    );
    setSelectedVillagerId(villagerId);
  };

  const handleBlessVillager = (villagerId: string) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });

    setVillagers(prev =>
      prev.map(v => {
        if (v.id === villagerId) {
          const updated: Villager = {
            ...v,
            needs: { ...v.needs, faith: Math.min(100, v.needs.faith + 15), safety: Math.min(100, v.needs.safety + 10) },
            recentDialogue: 'Praise the unseen hands! The island hums with divine favor!',
            memories: [
              {
                day: islandState.day,
                type: 'prayer_answered',
                description: 'Directly touched by divine grace and faith.',
                sentiment: 'positive'
              },
              ...v.memories.slice(0, 5)
            ]
          };
          return updated;
        }
        return v;
      })
    );
  };

  const handleAdvanceDay = () => {
    setIslandState(prev => ({
      ...prev,
      day: prev.day + 1,
      timeOfDay: 0.2
    }));
  };

  const handleResetSave = () => {
    setVillagers(INITIAL_VILLAGERS);
    setIslandState({
      day: 1,
      timeOfDay: 0.35,
      weather: 'calm',
      temperature: 22,
      soilMoisture: 60,
      cropYield: 75,
      waterReservoir: 80,
      sacredShrineGlow: 85,
      activeGesture: null,
      gestureIntensity: 1
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header & Session Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
            <span className="text-base">🏝️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">
                TABLETOP WEATHER GOD
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Meta Quest &bull; OpenXR &bull; Hands Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              XR Dev Studio &amp; Architecture Workbench (Meta VR Start 2026)
            </p>
          </div>
        </div>

        {/* In-Game Session Tracker */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Day {islandState.day}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="font-mono text-slate-400">
              {islandState.timeOfDay < 0.25
                ? 'Dawn'
                : islandState.timeOfDay < 0.7
                ? 'Midday'
                : islandState.timeOfDay < 0.85
                ? 'Dusk'
                : 'Night'}
            </span>
          </div>

          <div className="w-px h-3.5 bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Weather:</span>
            <span className="capitalize font-semibold text-amber-300 flex items-center gap-1">
              {islandState.weather === 'sunny' && <Sun className="w-3 h-3" />}
              {islandState.weather === 'rainy' && <CloudRain className="w-3 h-3" />}
              {islandState.weather === 'windy' && <Wind className="w-3 h-3" />}
              {islandState.weather === 'calm' && <Waves className="w-3 h-3" />}
              {islandState.weather}
            </span>
          </div>

          <div className="w-px h-3.5 bg-slate-800" />

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isSimulating ? 'Pause Sim' : 'Resume Sim'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'setup', label: '1. Setup & Verifier', icon: ShieldCheck },
            { id: 'prototype', label: '2. 3D Prototype', icon: Gamepad2 },
            { id: 'villagers', label: '3. Villager AI', icon: Users },
            { id: 'architecture', label: '4. C# Architecture', icon: FolderTree },
            { id: 'save', label: '5. JSON Save & Chronicle', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-hidden p-3 md:p-4">
        {activeTab === 'setup' && (
          <div className="h-full flex flex-col">
            <ProjectSetupVerifier />
          </div>
        )}

        {activeTab === 'prototype' && (
          <div className="h-full flex flex-col gap-3">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
              {/* 3D Three.js Tabletop Canvas */}
              <div className="lg:col-span-2 h-full min-h-[300px]">
                <TabletopCanvas
                  weather={islandState.weather}
                  villagers={villagers}
                  selectedVillagerId={selectedVillagerId}
                  onSelectVillager={id => {
                    setSelectedVillagerId(id);
                    if (id) handlePinchLift(id);
                  }}
                  activeGesture={islandState.activeGesture}
                  timeOfDay={islandState.timeOfDay}
                  temperature={islandState.temperature}
                />
              </div>

              {/* Side Villager Quick Peek */}
              <div className="h-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Live Villager Focus ({villagers.length} Citizens)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Local Utility AI</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <VillagerInspector
                    villagers={villagers}
                    selectedVillagerId={selectedVillagerId}
                    onSelectVillager={setSelectedVillagerId}
                    onPinchLift={handlePinchLift}
                    onBlessVillager={handleBlessVillager}
                  />
                </div>
              </div>
            </div>

            {/* Bottom 5 Core Hands-Only Gestures Panel */}
            <div className="flex-shrink-0">
              <GestureControls
                activeGesture={islandState.activeGesture}
                currentWeather={islandState.weather}
                onTriggerGesture={handleTriggerGesture}
                onClearWeather={() => handleTriggerGesture('palm_down')}
              />
            </div>
          </div>
        )}

        {activeTab === 'villagers' && (
          <div className="h-full">
            <VillagerInspector
              villagers={villagers}
              selectedVillagerId={selectedVillagerId}
              onSelectVillager={setSelectedVillagerId}
              onPinchLift={handlePinchLift}
              onBlessVillager={handleBlessVillager}
            />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="h-full">
            <ArchitectureViewer />
          </div>
        )}

        {activeTab === 'save' && (
          <div className="h-full">
            <SaveDataViewer
              islandState={islandState}
              villagers={villagers}
              onResetSave={handleResetSave}
              onAdvanceDay={handleAdvanceDay}
            />
          </div>
        )}
      </main>
    </div>
  );
}
