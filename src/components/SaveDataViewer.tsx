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
      {/* Daily Chronicle Stone Tablet */}
      <div className="p-4 rounded-xl border border-amber-800/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/20 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-amber-200">
              Daily Island Chronicle (Day {islandState.day})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateChronicle}
              className="px-2.5 py-1 rounded bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/50 text-[11px] text-amber-200 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Regenerate Chronicle</span>
            </button>
            <button
              onClick={onAdvanceDay}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] text-white font-medium transition-colors"
            >
              Advance 1 In-Game Day
            </button>
          </div>
        </div>

        <p className="text-xs text-amber-100/90 leading-relaxed italic bg-slate-950/60 p-3 rounded-lg border border-amber-900/40 font-serif">
          "{chronicleText}"
        </p>
      </div>

      {/* JSON Persistence Viewer */}
      <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <div>
              <h4 className="text-xs font-semibold text-slate-200 font-mono">
                Application.persistentDataPath/IslandSaveData.json
              </h4>
              <p className="text-[11px] text-slate-400">
                Unity JSON schema matching C# IslandSaveData DTO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied JSON' : 'Copy JSON'}
            </button>
            <button
              onClick={onResetSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 text-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg bg-slate-950 border border-slate-800/90 p-3">
          <pre className="text-[11px] font-mono text-cyan-300/90 leading-relaxed overflow-x-auto">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
