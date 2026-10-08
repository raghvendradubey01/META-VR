import React, { useState } from 'react';
import { INITIAL_SETUP_CHECKS, UNITY_MANIFEST_SNIPPET } from '../data/projectSetupData';
import { CheckCircle2, Circle, ShieldCheck, Copy, Check, Terminal, Wrench } from 'lucide-react';

export const ProjectSetupVerifier: React.FC = () => {
  const [checks, setChecks] = useState(INITIAL_SETUP_CHECKS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedSettings, setCopiedSettings] = useState(false);

  const toggleCheck = (id: string) => {
    setChecks(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const markAll = (status: boolean) => {
    setChecks(prev => prev.map(item => ({ ...item, checked: status })));
  };

  const filteredChecks = activeCategory === 'all'
    ? checks
    : checks.filter(c => c.category === activeCategory);

  const completedCount = checks.filter(c => c.checked).length;
  const progressPercent = Math.round((completedCount / checks.length) * 100);

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(UNITY_MANIFEST_SNIPPET);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const playerSettingsGuide = `// Key Project Settings for Tabletop Weather God (Unity 6 LTS)
1. Edit > Project Settings > Player > Other Settings:
   - Color Space: Linear
   - Auto Graphics API: OFF -> Vulkan (top priority), OpenGLES3 (fallback)
   - Multithreaded Rendering: ON
   - Static Batching: ON, Dynamic Batching: OFF
   - Texture Compression: ASTC

2. Edit > Project Settings > Player > Other Settings > Configuration:
   - Scripting Backend: IL2CPP
   - Target Architectures: ARM64 (check), ARMv7 (uncheck)
   - Minimum API Level: Android 12L (API level 32)
   - Target API Level: Automatic (highest installed)

3. Edit > Project Settings > XR Plug-in Management:
   - Android Tab: Check "OpenXR"
   - OpenXR > Features (Android Tab):
     * Enable "Meta Quest Support"
     * Enable "Hand Tracking"
     * Interaction Profiles: Add "Meta Hand Tracking Interaction Profile"
   - Stereo Rendering Mode: Multiview

4. OVRCameraRig / OVRManager (in Scene):
   - Hand Tracking Support: "Hands Only" (Targeting Meta VR Start hands competition)
   - Hand Tracking Frequency: "HIGH" (60 Hz high-fidelity palm gesture tracking)
   - Tracking Origin Type: "Floor Level" (Tabletop offset at ~0.75m)`;

  const handleCopySettings = () => {
    navigator.clipboard.writeText(playerSettingsGuide);
    setCopiedSettings(true);
    setTimeout(() => setCopiedSettings(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Header Banner - Clean human-crafted white card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                Unity 6 LTS &bull; OpenXR &bull; Meta XR SDK v68+
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Meta VR Start 2026 Ready
              </span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Meta Quest XR Project Verification
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
              Verify your Unity 6 editor environment, OpenXR manifests, and Meta XR Interaction SDK configuration before creating gameplay scripts.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between w-48 text-xs font-medium">
              <span className="text-neutral-600">Readiness Score</span>
              <span className={`font-mono font-bold ${progressPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {progressPercent}% ({completedCount}/{checks.length})
              </span>
            </div>
            <div className="w-48 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button 
                onClick={() => markAll(true)}
                className="text-neutral-700 font-medium hover:text-neutral-900 transition-colors"
              >
                Check All
              </button>
              <span className="text-neutral-300">&bull;</span>
              <button 
                onClick={() => markAll(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-neutral-200 rounded-lg shadow-xs">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'unity', label: 'Unity 6 LTS' },
          { id: 'packages', label: 'Meta Core SDK' },
          { id: 'openxr', label: 'OpenXR Pipeline' },
          { id: 'interaction_sdk', label: 'Interaction SDK' },
          { id: 'meta_simulator', label: 'XR Simulator' },
          { id: 'build_settings', label: 'Android Player Settings' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {filteredChecks.map(item => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
              item.checked
                ? 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                : 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {item.checked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-400 hover:text-amber-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-sm font-semibold tracking-tight ${item.checked ? 'text-neutral-900' : 'text-amber-900'}`}>
                  {item.title}
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                  item.severity === 'critical' ? 'bg-neutral-100 text-neutral-700 border border-neutral-200' : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
                }`}>
                  {item.severity}
                </span>
              </div>

              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="text-neutral-500 font-sans">Target Value:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800">
                  {item.requiredValue}
                </span>
                {item.docReference && (
                  <span className="text-neutral-500 italic text-[11px] font-sans">
                    📍 {item.docReference}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Package Manifest & Quick-Copy Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        {/* Manifest.json Box */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-700" />
              <span className="text-xs font-semibold text-neutral-800">
                Packages/manifest.json dependencies
              </span>
            </div>
            <button
              onClick={handleCopyManifest}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700 transition-colors border border-neutral-200"
            >
              {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedManifest ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
          <pre className="p-3 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto flex-1 leading-relaxed">
            {UNITY_MANIFEST_SNIPPET}
          </pre>
          <p className="text-[11px] text-neutral-500 mt-2">
            Paste into your Unity project's <code className="text-neutral-700 font-mono font-medium">Packages/manifest.json</code> to import OpenXR and Meta SDKs.
          </p>
        </div>

        {/* ProjectSettings Checklist Box */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-neutral-700" />
              <span className="text-xs font-semibold text-neutral-800">
                Unity 6 Player Settings Blueprint
              </span>
            </div>
            <button
              onClick={handleCopySettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700 transition-colors border border-neutral-200"
            >
              {copiedSettings ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSettings ? 'Copied' : 'Copy Guide'}
            </button>
          </div>
          <pre className="p-3 rounded bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-800 overflow-x-auto flex-1 leading-relaxed">
            {playerSettingsGuide}
          </pre>
          <p className="text-[11px] text-neutral-500 mt-2">
            Configures Linear Color Space, Vulkan, and Multiview for 90+ FPS on Meta Quest.
          </p>
        </div>
      </div>
    </div>
  );
};
