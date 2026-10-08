import { ProjectCheckItem } from '../types/game';

export const INITIAL_SETUP_CHECKS: ProjectCheckItem[] = [
  {
    id: 'unity_version',
    category: 'unity',
    title: 'Unity 6.x (6000.0.x LTS) Recommended Editor',
    description: 'Use Unity 6 LTS (6000.0.21f1+ or higher) with Android Build Support (OpenJDK + Android SDK & NDK tools installed via Unity Hub).',
    requiredValue: 'Unity 6000.0.x LTS + Android Build Support',
    docReference: 'Unity Hub > Installs > Add Modules > Android Build Support',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'openxr_plugin',
    category: 'openxr',
    title: 'OpenXR Plugin (com.unity.xr.openxr)',
    description: 'Ensure OpenXR Plugin 1.12.0+ is installed and set as the active XR loader for Android.',
    requiredValue: 'Version 1.12.0 or later enabled in Project Settings > XR Plug-in Management > Android',
    docReference: 'Package Manager > Unity Registry > OpenXR Plugin',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'meta_core_sdk',
    category: 'packages',
    title: 'Meta XR Core SDK (com.meta.xr.sdk.core)',
    description: 'Meta XR Core SDK provides OVRManager, camera rig setups, and core system interfaces. Assumed version: v68.0 to v72.0.',
    requiredValue: 'com.meta.xr.sdk.core @ 68.0.0+',
    docReference: 'Package Manager > Add package by name or Meta XR Package Manager tab',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'meta_interaction_sdk',
    category: 'interaction_sdk',
    title: 'Meta XR Interaction SDK (com.meta.xr.sdk.interaction)',
    description: 'Provides hand tracking primitives, gesture detectors, poke/grab interactors, and Synthetic Hand rigs.',
    requiredValue: 'com.meta.xr.sdk.interaction @ 68.0.0+',
    docReference: 'Meta XR Interaction SDK & Interaction SDK OVR Integration',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'meta_simulator',
    category: 'meta_simulator',
    title: 'Meta XR Simulator (com.meta.xr.simulator)',
    description: 'Allows hands-only testing directly inside the Unity Editor without putting on the physical Meta Quest headset!',
    requiredValue: 'Meta XR Simulator package enabled + Meta > XR Simulator > Activate in Editor',
    docReference: 'Unity Editor top menu: Meta > XR Simulator > Activate Meta XR Simulator',
    checked: false,
    severity: 'recommended'
  },
  {
    id: 'color_space',
    category: 'build_settings',
    title: 'Color Space: Linear',
    description: 'Meta Quest requires Linear color space for correct physical rendering and lighting calculations.',
    requiredValue: 'Linear (Edit > Project Settings > Player > Other Settings > Color Space)',
    docReference: 'Project Settings > Player > Other Settings > Color Space = Linear',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'graphics_api',
    category: 'build_settings',
    title: 'Graphics API: Vulkan (Primary)',
    description: 'Vulkan is the recommended modern graphics API for Meta Quest on Unity 6. Set Vulkan first, OpenGLES3 second.',
    requiredValue: 'Vulkan (Uncheck Auto Graphics API, put Vulkan at top)',
    docReference: 'Project Settings > Player > Android > Rendering > Graphics APIs',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'stereo_rendering',
    category: 'build_settings',
    title: 'Stereo Rendering Mode: Multiview',
    description: 'Multiview provides single-pass rendering to both eye viewports with minimum CPU driver overhead.',
    requiredValue: 'Multiview (Project Settings > XR Plug-in Management > OpenXR > Android tab)',
    docReference: 'XR Plug-in Management > OpenXR > Android > Stereo Rendering Mode: Multiview',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'hand_tracking_support',
    category: 'interaction_sdk',
    title: 'Hand Tracking Support: Hands Only (No Controllers)',
    description: 'In OVRManager / Meta Project Setup Tool: Set Hand Tracking Support to "Hands Only" or "Controllers And Hands" (Hands Only for hands-only competition track). Set Hand Tracking Frequency to "HIGH".',
    requiredValue: 'Hand Tracking Support: Hands Only, Frequency: HIGH (60Hz)',
    docReference: 'OVRCameraRig > OVRManager > Hand Tracking Support = Hands Only',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'meta_openxr_features',
    category: 'openxr',
    title: 'OpenXR Android Features: Meta Quest Feature Group',
    description: 'Enable Meta Quest Support, Hand Tracking Subsystem, and Meta XR feature group in OpenXR Android settings.',
    requiredValue: 'Check "Meta Quest Feature Group" + "Hand Tracking"',
    docReference: 'Project Settings > XR Plug-in Management > OpenXR > Android features',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'min_android_api',
    category: 'build_settings',
    title: 'Target Android Architecture & Minimum API Level',
    description: 'Target Architecture: ARM64 only (disable ARMv7). Scripting Backend: IL2CPP. Minimum API Level: Android 12L (API level 32) or Android 10 (API level 29+).',
    requiredValue: 'Scripting: IL2CPP, Target Architectures: ARM64, Min API: 32 (Quest 2/3/3S/Pro)',
    docReference: 'Project Settings > Player > Android > Identification & Configuration',
    checked: true,
    severity: 'critical'
  },
  {
    id: 'meta_project_setup_tool',
    category: 'unity',
    title: 'Run Meta Project Setup Tool (Automated Doctor)',
    description: 'The Meta XR Project Setup Tool will inspect the project and offer "Fix All" buttons for Quest compatibility.',
    requiredValue: 'Meta > Tools > Project Setup Tool > Fix All outstanding errors',
    docReference: 'Unity Menu > Meta > Tools > Project Setup Tool',
    checked: false,
    severity: 'recommended'
  }
];

export const UNITY_MANIFEST_SNIPPET = `{
  "dependencies": {
    "com.unity.xr.openxr": "1.12.1",
    "com.unity.xr.management": "4.4.1",
    "com.meta.xr.sdk.core": "68.0.0",
    "com.meta.xr.sdk.interaction": "68.0.0",
    "com.meta.xr.sdk.interaction.ovr": "68.0.0",
    "com.meta.xr.simulator": "68.0.0",
    "com.unity.mathematics": "1.3.2",
    "com.unity.textmeshpro": "3.0.9"
  }
}`;

export const DIRECTORY_STRUCTURE_TREE = [
  {
    path: 'Assets/Scripts/Core/',
    purpose: 'Game manager, Day/Night session cycle (5-8 min timer), Game events, Global service locator.',
    scripts: ['GameManager.cs', 'DayNightCycleManager.cs', 'GameEvents.cs']
  },
  {
    path: 'Assets/Scripts/Weather/',
    purpose: 'Weather state machine (Calm, Sun, Rain, Wind), transition blending, atmospheric lighting.',
    scripts: ['WeatherManager.cs', 'WeatherState.cs', 'WeatherVFXController.cs']
  },
  {
    path: 'Assets/Scripts/Island/',
    purpose: 'Tabletop island bounds, resource nodes (freshwater well, farmland, campfire, sacred shrine).',
    scripts: ['TabletopIsland.cs', 'ResourceWell.cs', 'FarmPlot.cs', 'SacredShrine.cs']
  },
  {
    path: 'Assets/Scripts/Villagers/',
    purpose: 'Villager data model, 5 Needs degradation, animations, memory ledger, fallback dialogue.',
    scripts: ['Villager.cs', 'VillagerNeeds.cs', 'VillagerMemory.cs', 'VillagerSpeechBubble.cs']
  },
  {
    path: 'Assets/Scripts/AI/',
    purpose: 'Local on-device Utility AI curves & action scorers (Drink, Farm, WarmUp, Pray, Panic).',
    scripts: ['UtilityBrain.cs', 'UtilityAction.cs', 'ActionScorers.cs', 'AIAgentController.cs']
  },
  {
    path: 'Assets/Scripts/Interaction/',
    purpose: 'Hand gesture detectors using Meta XR Interaction SDK (Rub, Flick, Sweep, Press, Pinch & Lift).',
    scripts: ['GodHandGestureManager.cs', 'RubPalmGestureDetector.cs', 'DownwardFlickDetector.cs', 'SweepWindGesture.cs', 'VillagerPinchLifter.cs']
  },
  {
    path: 'Assets/Scripts/Save/',
    purpose: 'Local JSON save/load serializer, session persistence, offline state recovery.',
    scripts: ['SaveManager.cs', 'IslandSaveData.cs', 'JsonDataSerializer.cs']
  },
  {
    path: 'Assets/Scripts/UI/',
    purpose: 'Diegetic floating tabletop inspect UI, needs meters, daily chronicle tablet.',
    scripts: ['VillagerInspectorUI.cs', 'DailyChronicleBoard.cs', 'HandGuidanceHintUI.cs']
  }
];
