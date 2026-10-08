import React from 'react';
import { Villager } from '../types/game';
import { Utensils, Droplets, Flame, Shield, Heart, Sparkles, MessageSquare, History, User } from 'lucide-react';

interface VillagerInspectorProps {
  villagers: Villager[];
  selectedVillagerId: string | null;
  onSelectVillager: (id: string | null) => void;
  onPinchLift: (id: string) => void;
  onBlessVillager: (id: string) => void;
}

export const VillagerInspector: React.FC<VillagerInspectorProps> = ({
  villagers,
  selectedVillagerId,
  onSelectVillager,
  onPinchLift,
  onBlessVillager
}) => {
  const selected = villagers.find(v => v.id === selectedVillagerId) || villagers[0];

  const getNeedColor = (val: number) => {
    if (val < 25) return 'bg-rose-500';
    if (val < 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Villager selection chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {villagers.map(v => {
          const isSelected = selected?.id === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelectVillager(v.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: v.color }}
              />
              <span>{v.name}</span>
              {v.heldHeight > 0 && <span className="text-[10px]">✨ Lifted</span>}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Villager Profile Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner"
                style={{ backgroundColor: `${selected.color}22`, border: `2px solid ${selected.color}` }}
              >
                <User className="w-6 h-6" style={{ color: selected.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selected.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {selected.personality}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 capitalize">
                    Action: {selected.currentAction}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Island Position: [{selected.x.toFixed(2)}, {selected.z.toFixed(2)}] &bull; Status: {selected.heldHeight > 0 ? 'Held by God Hand' : 'On Ground'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPinchLift(selected.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  selected.heldHeight > 0
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <span>🖐️</span>
                <span>{selected.heldHeight > 0 ? 'Release to Ground' : 'Pinch & Lift'}</span>
              </button>

              <button
                onClick={() => onBlessVillager(selected.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bless Faith (+15)</span>
              </button>
            </div>
          </div>

          {/* 5 Core Needs Gauges */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span>On-Device Utility Needs Model (Local Evaluation)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Food', value: selected.needs.food, icon: Utensils, unit: '%' },
                { label: 'Water', value: selected.needs.water, icon: Droplets, unit: '%' },
                { label: 'Warmth', value: selected.needs.warmth, icon: Flame, unit: '%' },
                { label: 'Safety', value: selected.needs.safety, icon: Shield, unit: '%' },
                { label: 'Faith', value: selected.needs.faith, icon: Heart, unit: '%' }
              ].map(need => {
                const Icon = need.icon;
                return (
                  <div key={need.label} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{need.label}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-200">
                        {Math.round(need.value)}{need.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getNeedColor(need.value)}`}
                        style={{ width: `${Math.max(0, Math.min(100, need.value))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dialogue Bubble */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Current Utterance (Local Fallback Dialogue Bank)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">100% Offline Safe</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 italic leading-relaxed">
              "{selected.recentDialogue}"
            </div>
          </div>

          {/* Memory Log */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Villager Memory Ledger (Persisted in JSON)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {selected.memories.length} Recorded Memories
              </span>
            </div>
            <div className="space-y-2">
              {selected.memories.map((mem, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start justify-between text-xs gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 mt-0.5">
                      Day {mem.day}
                    </span>
                    <span className="text-slate-300">{mem.description}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      mem.sentiment === 'positive'
                        ? 'text-emerald-300 bg-emerald-950/60'
                        : mem.sentiment === 'negative'
                        ? 'text-rose-300 bg-rose-950/60'
                        : 'text-slate-400 bg-slate-800'
                    }`}
                  >
                    {mem.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
