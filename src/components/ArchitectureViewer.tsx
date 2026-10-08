import React, { useState } from 'react';
import { DIRECTORY_STRUCTURE_TREE } from '../data/projectSetupData';
import { FolderTree, FileCode, Copy, Check, Box } from 'lucide-react';

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
    interfacesAndInheritance: 'MonoBehaviour',
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
    gameObjectTarget: 'Attached to [GestureManager] under [Core]',
    interfacesAndInheritance: 'MonoBehaviour',
    responsibility: 'Listens to Meta XR OVRHand velocity and spatial vectors to recognize Sun, Rain, Wind, and Calm.',
    previewCode: `using UnityEngine;
using TabletopWeatherGod.Weather;

namespace TabletopWeatherGod.Interaction
{
    public class GodHandGestureManager : MonoBehaviour
    {
        [Header("Tracked Hand References")]
        [SerializeField] private OVRHand leftHand;
        [SerializeField] private OVRHand rightHand;

        public void OnRubPalmsRecognized() => WeatherManager.Instance.TryChangeWeather(WeatherType.Sunny);
        public void OnFlickDownRecognized() => WeatherManager.Instance.TryChangeWeather(WeatherType.Rainy);
        public void OnSweepWindRecognized() => WeatherManager.Instance.TryChangeWeather(WeatherType.Windy);
        public void OnCalmPalmRecognized() => WeatherManager.Instance.TryChangeWeather(WeatherType.Calm);
    }
}`
  },
  'UtilityBrain.cs': {
    name: 'UtilityBrain.cs',
    folder: 'Assets/Scripts/AI/',
    gameObjectTarget: 'Attached to each Villager Prefab alongside Villager.cs',
    interfacesAndInheritance: 'MonoBehaviour',
    responsibility: 'Scores available actions (Drink, Farm, WarmUp, Pray, Wander) based on needs curves and environmental state.',
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
                float score = action.CalculateScore(_villager);
                if (score > highestScore)
                {
                    highestScore = score;
                    chosen = action;
                }
            }

            if (chosen != null && chosen != _currentBestAction)
            {
                _currentBestAction?.OnExit(_villager, _motor);
                _currentBestAction = chosen;
                _currentBestAction.OnEnter(_villager, _motor);
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
    responsibility: 'Encodes and decodes IslandSaveData.json to Application.persistentDataPath with atomic backup safety.',
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
      <div className="w-full lg:w-80 flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-neutral-600" />
          <h3 className="text-xs font-semibold text-neutral-800">
            Assets/Scripts/ Architecture
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {DIRECTORY_STRUCTURE_TREE.map(folder => (
            <div key={folder.path} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
              <div className="text-xs font-mono font-bold text-neutral-800 flex items-center gap-1.5 mb-1">
                <span>📁</span>
                <span>{folder.path}</span>
              </div>
              <p className="text-[11px] text-neutral-600 mb-2 leading-relaxed">
                {folder.purpose}
              </p>

              <div className="space-y-1 pl-2 border-l border-neutral-300">
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
                          ? 'bg-neutral-900 text-white font-bold'
                          : isInteractive
                          ? 'text-neutral-700 hover:bg-neutral-200/80'
                          : 'text-neutral-400 cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{s}</span>
                      </div>
                      {isInteractive && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-200 text-neutral-700">
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
      <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden p-4 shadow-xs">
        {selectedScript ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-neutral-200 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-neutral-900 font-mono">{selectedScript.name}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {selectedScript.folder}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 mt-1 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Target GameObject: </span>
                  <b className="text-neutral-800">{selectedScript.gameObjectTarget}</b>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-all shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied' : 'Copy C# Code'}
              </button>
            </div>

            <div className="mb-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
              <span className="text-neutral-500 font-medium">Responsibility: </span>
              <span className="text-neutral-800">{selectedScript.responsibility}</span>
            </div>

            <div className="flex-1 overflow-y-auto rounded-lg bg-neutral-900 border border-neutral-800 p-3.5">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto">
                {selectedScript.previewCode}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400 text-xs">
            Select a script from the explorer to view placement and code.
          </div>
        )}
      </div>
    </div>
  );
};
