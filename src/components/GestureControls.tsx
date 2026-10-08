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
      iconColor: 'text-amber-500',
      activeBorder: 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/20',
      description: 'Generates radiant heat, dries soil, warms shivering villagers.',
      metaSdkMapping: 'RubPalmDetector (Distance between two synthetic palms < 0.12m + opposing velocity vectors)'
    },
    {
      type: 'flick_down' as GestureType,
      name: 'Flick Fingers Downward',
      effect: 'Rain / Fill Cisterns',
      icon: CloudRain,
      iconColor: 'text-sky-500',
      activeBorder: 'border-sky-400 bg-sky-50/80 ring-2 ring-sky-400/20',
      description: 'Summons gentle showers, replenishes freshwater well and wheat crops.',
      metaSdkMapping: 'FingerCurlVelocityDetector (Rapid downward finger flexion > 0.85 m/s)'
    },
    {
      type: 'sweep_flat' as GestureType,
      name: 'Sweep Flat Hand',
      effect: 'Wind / Clear Fog',
      icon: Wind,
      iconColor: 'text-teal-600',
      activeBorder: 'border-teal-400 bg-teal-50/80 ring-2 ring-teal-400/20',
      description: 'Blows clouds across the sky, activates prayer banners, tests villager safety.',
      metaSdkMapping: 'FlatHandSweepDetector (Hand palm normal perpendicular to table + horizontal velocity > 0.65 m/s)'
    },
    {
      type: 'palm_down' as GestureType,
      name: 'Slow Palm Press Down',
      effect: 'Calm / Clear Sky',
      icon: Waves,
      iconColor: 'text-emerald-600',
      activeBorder: 'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-400/20',
      description: 'Stills the storm, brings glassy serene waters and peace.',
      metaSdkMapping: 'SlowPalmPressDetector (Palm down facing table + steady downward descent < 0.35 m/s)'
    },
    {
      type: 'pinch_lift' as GestureType,
      name: 'Pinch & Lift',
      effect: 'Inspect / Hold Villager',
      icon: Hand,
      iconColor: 'text-neutral-800',
      activeBorder: 'border-neutral-700 bg-neutral-100 ring-2 ring-neutral-400/20',
      description: 'Pinch index & thumb near a villager to lift them into the sky for inspection.',
      metaSdkMapping: 'HandPinchInteractor (Thumb & Index pinch pose < 0.015m with Proximity to Villager)'
    }
  ];

  return (
    <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-semibold text-neutral-800">
            5 Core Hands-Only Gestures (Meta XR Interaction SDK)
          </h3>
        </div>
        <span className="text-[11px] font-medium text-neutral-500">
          Current Sky: <b className="capitalize text-neutral-900 font-semibold">{currentWeather}</b>
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
                  ? `${g.activeBorder} shadow-xs`
                  : 'bg-neutral-50/60 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-5 h-5 ${g.iconColor}`} />
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-neutral-900">{g.name}</div>
                <div className="text-[11px] text-amber-700 font-medium mt-0.5">{g.effect}</div>
                <div className="text-[11px] text-neutral-600 mt-1 leading-snug line-clamp-2">
                  {g.description}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-neutral-200/80 text-[10px] text-neutral-500 font-mono">
                {g.metaSdkMapping}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
