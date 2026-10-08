import React from 'react';
import { GestureType, WeatherType } from '../types/game';
import { Sun, CloudRain, Wind, Waves, Hand, Sparkles } from 'lucide-react';

interface GestureControlsProps {
  activeGesture: GestureType | null;
  currentWeather: WeatherType;
  onTriggerGesture: (gesture: GestureType) => void;
  onClearWeather: () => void;
}

export const GestureControls: React.FC<GestureControlsProps> = ({
  activeGesture,
  currentWeather,
  onTriggerGesture,
  onClearWeather
}) => {
  const gestures = [
    {
      type: 'rub_palms' as GestureType,
      name: 'Rub Palms Together',
      effect: 'Sun / Warm Weather',
      icon: Sun,
      color: 'text-amber-400',
      activeBorder: 'border-amber-500 bg-amber-950/40',
      description: 'Generates radiant heat, dries soil, warms shivering villagers.',
      metaSdkMapping: 'RubPalmDetector (Distance between two synthetic palms < 0.08m + opposing velocity vectors)'
    },
    {
      type: 'flick_down' as GestureType,
      name: 'Flick Fingers Downward',
      effect: 'Rain / Fill Cisterns',
      icon: CloudRain,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-500 bg-cyan-950/40',
      description: 'Summons gentle showers, replenishes freshwater well and wheat crops.',
      metaSdkMapping: 'FingerCurlVelocityDetector (Rapid downward finger flexion > 1.2 m/s)'
    },
    {
      type: 'sweep_flat' as GestureType,
      name: 'Sweep Flat Hand',
      effect: 'Wind / Clear Fog',
      icon: Wind,
      color: 'text-blue-300',
      activeBorder: 'border-blue-500 bg-blue-950/40',
      description: 'Blows clouds across the sky, activates prayer banners, tests villager safety.',
      metaSdkMapping: 'FlatHandSweepDetector (Hand palm normal perpendicular to table + horizontal velocity > 0.8 m/s)'
    },
    {
      type: 'palm_down' as GestureType,
      name: 'Slow Palm Press Down',
      effect: 'Calm / Clear Sky',
      icon: Waves,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500 bg-emerald-950/40',
      description: 'Stills the storm, brings glassy serene waters and peace.',
      metaSdkMapping: 'SlowPalmPressDetector (Palm down facing table + steady downward descent < 0.3 m/s)'
    },
    {
      type: 'pinch_lift' as GestureType,
      name: 'Pinch & Lift',
      effect: 'Inspect / Hold Villager',
      icon: Hand,
      color: 'text-purple-400',
      activeBorder: 'border-purple-500 bg-purple-950/40',
      description: 'Pinch index & thumb near a villager to lift them into the sky for inspection.',
      metaSdkMapping: 'HandPinchInteractor (Thumb & Index pinch pose < 0.015m with Raycast / Proximity to Villager)'
    }
  ];

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            5 Core Hands-Only Gestures (Meta XR Interaction SDK)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Current Sky: <b className="capitalize text-slate-200">{currentWeather}</b>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {gestures.map(g => {
          const Icon = g.icon;
          const isActive = activeGesture === g.type;
          return (
            <button
              key={g.type}
              onClick={() => onTriggerGesture(g.type)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? `${g.activeBorder} shadow-lg scale-[1.02]`
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-5 h-5 ${g.color}`} />
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-900 animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-100">{g.name}</div>
                <div className="text-[11px] text-amber-300/90 font-medium mt-0.5">{g.effect}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                  {g.description}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                {g.metaSdkMapping}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
