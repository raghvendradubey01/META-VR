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
    return 'bg-emerald-600';
  };

  return (
    <div className="h-full flex flex-col gap-3.5 overflow-hidden">
      {/* Villager selection chips - Clean white buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-100">
        {villagers.map(v => {
          const isSelected = selected?.id === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelectVillager(v.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: v.color }}
              />
              <span>{v.name}</span>
              {v.heldHeight > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono">
                  Held
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {/* Villager Profile Card */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border"
                style={{ backgroundColor: `${selected.color}15`, borderColor: `${selected.color}40` }}
              >
                <User className="w-6 h-6" style={{ color: selected.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">{selected.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 capitalize">
                    {selected.personality}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200 capitalize">
                    Action: {selected.currentAction}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Position: [{selected.x.toFixed(2)}, {selected.z.toFixed(2)}] &bull; Status: {selected.heldHeight > 0 ? 'Held by Hand' : 'On Ground'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPinchLift(selected.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  selected.heldHeight > 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs'
                }`}
              >
                <span>🖐️</span>
                <span>{selected.heldHeight > 0 ? 'Place on Island' : 'Pinch & Lift'}</span>
              </button>

              <button
                onClick={() => onBlessVillager(selected.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bless (+15 Faith)</span>
              </button>
            </div>
          </div>

          {/* 5 Core Needs Gauges */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
            <h4 className="text-xs font-semibold text-neutral-800 mb-3 flex items-center gap-1.5">
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
                  <div key={need.label} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="font-medium">{need.label}</span>
                      </div>
                      <span className="font-mono font-bold text-neutral-800">
                        {Math.round(need.value)}{need.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
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
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-neutral-600" />
                Current Utterance (Local Fallback Dialogue Bank)
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                100% Offline Safe
              </span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 italic leading-relaxed">
              "{selected.recentDialogue}"
            </div>
          </div>

          {/* Memory Log */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-600" />
                Villager Memory Ledger (Persisted in JSON)
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {selected.memories.length} Recorded Memories
              </span>
            </div>
            <div className="space-y-2">
              {selected.memories.map((mem, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-start justify-between text-xs gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-neutral-700 border border-neutral-200 mt-0.5 font-medium">
                      Day {mem.day}
                    </span>
                    <span className="text-neutral-800">{mem.description}</span>
                  </div>
                  <span
                    className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${
                      mem.sentiment === 'positive'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : mem.sentiment === 'negative'
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : 'text-neutral-600 bg-neutral-100 border-neutral-200'
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
