import React, { useState } from 'react';
import { DIRECTORY_STRUCTURE_TREE } from '../data/projectSetupData';
import { FolderTree, FileCode, CheckCircle, Copy, Check, Info, Box } from 'lucide-react';

interface ScriptDetail {
  name: string;
  folder: string;
  gameObjectTarget: string;
  interfacesAndInheritance: string;
  responsibility: string;
  previewCode: string;
}

const SAMPLE_SCRIPTS: Record<string, ScriptDetail> = {
  'GameManager.cs': {
    name: 'GameManager.cs',
    folder: 'Assets/Scripts/Core/',
    gameObjectTarget: 'Empty GameObject named "[GameManager]" (DontDestroyOnLoad)',
    interfacesAndInheritance: 'MonoBehaviour',
    responsibility: 'Coordinates day progression, initializes session state, triggers auto-saves, manages 5-8 min session flow.',
    previewCode: `using UnityEngine;

namespace TabletopWeatherGod.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Session Timing (5-8 min in-game day)")]
        [SerializeField] private float sessionDurationSeconds = 360f; // 6 minutes
        private float _sessionElapsed;

        public int CurrentDay { get; private set; } = 1;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Update()
        {
            _sessionElapsed += Time.deltaTime;
            if (_sessionElapsed >= sessionDurationSeconds)
            {
                EndDaySession();
            }
        }

        public void EndDaySession()
        {
            _sessionElapsed = 0f;
            CurrentDay++;
            // Trigger Save & Daily Chronicle
        }
    }
}`
  },
  'WeatherManager.cs': {
    name: 'WeatherManager.cs',
    folder: 'Assets/Scripts/Weather/',
    gameObjectTarget: 'GameObject named "[WeatherSystem]" under Tabletop Environment',
    interfacesAndInheritance: 'MonoBehaviour, IWeatherService',
    responsibility: 'FSM for Calm, Sun, Rain, Wind. Dispatches weather change events to island crops, well, and villager AI.',
    previewCode: `using UnityEngine;
using System;

namespace TabletopWeatherGod.Weather
{
    public enum WeatherType { Calm, Sunny, Rainy, Windy }

    public class WeatherManager : MonoBehaviour
    {
        [SerializeField] private WeatherType currentWeather = WeatherType.Calm;
        public static event Action<WeatherType> OnWeatherChanged;

        public WeatherType CurrentWeather => currentWeather;

        public void SetWeather(WeatherType newWeather)
        {
            if (currentWeather == newWeather) return;
            currentWeather = newWeather;
            OnWeatherChanged?.Invoke(newWeather);
        }
    }
}`
  },
  'GodHandGestureManager.cs': {
    name: 'GodHandGestureManager.cs',
    folder: 'Assets/Scripts/Interaction/',
    gameObjectTarget: 'Attached to OVRCameraRig > TrackingSpace > Hands root',
    interfacesAndInheritance: 'MonoBehaviour',
    responsibility: 'Listens to Meta XR Interaction SDK pose and velocity events to recognize the 5 hands-only god powers.',
    previewCode: `using UnityEngine;
using Oculus.Interaction;
using TabletopWeatherGod.Weather;

namespace TabletopWeatherGod.Interaction
{
    public class GodHandGestureManager : MonoBehaviour
    {
        [Header("Detectors")]
        [SerializeField] private ActiveStateSelector rubPalmsDetector;
        [SerializeField] private ActiveStateSelector flickDownDetector;
        [SerializeField] private ActiveStateSelector sweepWindDetector;
        [SerializeField] private ActiveStateSelector calmPalmDetector;

        private void Start()
        {
            // Subscribe to Meta XR Interaction SDK pose active states
        }

        public void OnRubPalmsRecognized() => WeatherManager.Instance.SetWeather(WeatherType.Sunny);
        public void OnFlickDownRecognized() => WeatherManager.Instance.SetWeather(WeatherType.Rainy);
        public void OnSweepWindRecognized() => WeatherManager.Instance.SetWeather(WeatherType.Windy);
        public void OnCalmPalmRecognized() => WeatherManager.Instance.SetWeather(WeatherType.Calm);
    }
}`
  },
  'UtilityBrain.cs': {
    name: 'UtilityBrain.cs',
    folder: 'Assets/Scripts/AI/',
    gameObjectTarget: 'Attached to each Villager Prefab alongside Villager.cs',
    interfacesAndInheritance: 'MonoBehaviour',
    responsibility: 'Scores available actions (Drink, Farm, WarmUp, Pray, Panic) based on needs curves and environmental state.',
    previewCode: `using UnityEngine;
using System.Collections.Generic;

namespace TabletopWeatherGod.AI
{
    public class UtilityBrain : MonoBehaviour
    {
        private List<IUtilityAction> _availableActions = new();
        private IUtilityAction _currentBestAction;

        public void EvaluateBestAction()
        {
            float highestScore = -1f;
            IUtilityAction chosen = null;

            foreach (var action in _availableActions)
            {
                float score = action.CalculateScore();
                if (score > highestScore)
                {
                    highestScore = score;
                    chosen = action;
                }
            }

            if (chosen != null && chosen != _currentBestAction)
            {
                _currentBestAction?.OnCancel();
                _currentBestAction = chosen;
                _currentBestAction.OnExecute();
            }
        }
    }
}`
  },
  'SaveManager.cs': {
    name: 'SaveManager.cs',
    folder: 'Assets/Scripts/Save/',
    gameObjectTarget: 'GameObject named "[SaveManager]" under Core Systems',
    interfacesAndInheritance: 'MonoBehaviour',
    responsibility: 'Encodes and decodes IslandSaveData.json to Application.persistentDataPath with backup safety.',
    previewCode: `using UnityEngine;
using System.IO;

namespace TabletopWeatherGod.Save
{
    public class SaveManager : MonoBehaviour
    {
        private string SaveFilePath => 
            Path.Combine(Application.persistentDataPath, "IslandSaveData.json");

        public void SaveIsland(IslandSaveData data)
        {
            string json = JsonUtility.ToJson(data, true);
            File.WriteAllText(SaveFilePath, json);
        }

        public IslandSaveData LoadIsland()
        {
            if (!File.Exists(SaveFilePath)) return IslandSaveData.CreateDefault();
            string json = File.ReadAllText(SaveFilePath);
            return JsonUtility.FromJson<IslandSaveData>(json);
        }
    }
}`
  }
};

export const ArchitectureViewer: React.FC = () => {
  const [selectedScriptKey, setSelectedScriptKey] = useState<string>('GameManager.cs');
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedScript = SAMPLE_SCRIPTS[selectedScriptKey];

  const handleCopy = () => {
    if (!selectedScript) return;
    navigator.clipboard.writeText(selectedScript.previewCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Left Column: Directory Structure Explorer */}
      <div className="w-full lg:w-80 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            Assets/Scripts/ Architecture
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {DIRECTORY_STRUCTURE_TREE.map(folder => (
            <div key={folder.path} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                <span>📁</span>
                <span>{folder.path}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                {folder.purpose}
              </p>

              <div className="space-y-1 pl-2 border-l border-slate-800">
                {folder.scripts.map(s => {
                  const isInteractive = Boolean(SAMPLE_SCRIPTS[s]);
                  const isSelected = selectedScriptKey === s;
                  return (
                    <button
                      key={s}
                      disabled={!isInteractive}
                      onClick={() => setSelectedScriptKey(s)}
                      className={`w-full text-left px-2 py-1 rounded text-xs font-mono flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold'
                          : isInteractive
                          ? 'text-cyan-300 hover:bg-slate-800/80'
                          : 'text-slate-500 cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{s}</span>
                      </div>
                      {isInteractive && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950/80 text-indigo-300">
                          Inspect
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Script Details & Placement Target */}
      <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden p-4">
        {selectedScript ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white font-mono">{selectedScript.name}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-amber-300">
                    {selectedScript.folder}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target GameObject: </span>
                  <b className="text-slate-200">{selectedScript.gameObjectTarget}</b>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied to Clipboard' : 'Copy C# Code'}
              </button>
            </div>

            <div className="mb-3 p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Responsibility: </span>
              <span className="text-slate-300">{selectedScript.responsibility}</span>
            </div>

            <div className="flex-1 overflow-y-auto rounded-lg bg-slate-950 border border-slate-800 p-3">
              <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                {selectedScript.previewCode}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Select a script from the explorer to view placement and code.
          </div>
        )}
      </div>
    </div>
  );
};
