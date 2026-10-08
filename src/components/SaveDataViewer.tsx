import React, { useState } from 'react';
import { Villager, IslandState } from '../types/game';
import { generateDailyChronicleLocal } from '../utils/dialogueBank';
import { Database, BookOpen, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';

interface SaveDataViewerProps {
  islandState: IslandState;
  villagers: Villager[];
  onResetSave: () => void;
  onAdvanceDay: () => void;
}

export const SaveDataViewer: React.FC<SaveDataViewerProps> = ({
  islandState,
  villagers,
  onResetSave,
  onAdvanceDay
}) => {
  const [copied, setCopied] = useState(false);
  const [chronicleText, setChronicleText] = useState(() =>
    generateDailyChronicleLocal(islandState.day, [islandState.weather], villagers)
  );

  const saveDataJson = {
    saveFormatVersion: "1.0",
    savedTimestampUtc: new Date().toISOString(),
    island: {
      day: islandState.day,
      timeOfDay: islandState.timeOfDay,
      activeWeather: islandState.weather,
      temperatureCelsius: islandState.temperature,
      soilMoisture: islandState.soilMoisture,
      cropYield: islandState.cropYield,
      waterReservoir: islandState.waterReservoir,
      sacredShrineGlow: islandState.sacredShrineGlow
    },
    villagers: villagers.map(v => ({
      id: v.id,
      name: v.name,
      personality: v.personality,
      needs: {
        food: Math.round(v.needs.food),
        water: Math.round(v.needs.water),
        warmth: Math.round(v.needs.warmth),
        safety: Math.round(v.needs.safety),
        faith: Math.round(v.needs.faith)
      },
      currentAction: v.currentAction,
      coordinates: [parseFloat(v.x.toFixed(2)), parseFloat(v.z.toFixed(2))],
      memories: v.memories
    }))
  };

  const jsonString = JSON.stringify(saveDataJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateChronicle = () => {
    const text = generateDailyChronicleLocal(islandState.day, [islandState.weather], villagers);
    setChronicleText(text);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Daily Chronicle Stone Tablet - Clean warm parchment/stone card */}
      <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-semibold text-amber-900">
              Daily Island Chronicle (Day {islandState.day})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateChronicle}
              className="px-2.5 py-1 rounded bg-white hover:bg-amber-100/70 border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Regenerate Chronicle</span>
            </button>
            <button
              onClick={onAdvanceDay}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[11px] text-white font-medium transition-colors shadow-xs"
            >
              Advance 1 In-Game Day
            </button>
          </div>
        </div>

        <p className="text-xs text-amber-950 leading-relaxed italic bg-white/90 p-3.5 rounded-lg border border-amber-200/80 font-serif shadow-xs">
          "{chronicleText}"
        </p>
      </div>

      {/* JSON Persistence Viewer */}
      <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-600" />
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 font-mono">
                Application.persistentDataPath/IslandSaveData.json
              </h4>
              <p className="text-[11px] text-neutral-500">
                Unity JSON schema matching C# IslandSaveData DTO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700 font-medium transition-all border border-neutral-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied JSON' : 'Copy JSON'}
            </button>
            <button
              onClick={onResetSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg bg-neutral-900 border border-neutral-800 p-3.5">
          <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed overflow-x-auto">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
