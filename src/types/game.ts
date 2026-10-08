export type WeatherType = 'calm' | 'sunny' | 'rainy' | 'windy';

export type GestureType = 
  | 'rub_palms'    // Sun / warm weather
  | 'flick_down'   // Rain
  | 'sweep_flat'   // Wind
  | 'palm_down'    // Calm / stop weather
  | 'pinch_lift';  // Inspect / pick up villager

export type VillagerAction = 
  | 'idle' 
  | 'farming' 
  | 'drinking' 
  | 'warming' 
  | 'sheltering' 
  | 'praying' 
  | 'celebrating' 
  | 'panicking';

export interface VillagerNeeds {
  food: number;    // 0 - 100
  water: number;   // 0 - 100
  warmth: number;  // 0 - 100
  safety: number;  // 0 - 100
  faith: number;   // 0 - 100
}

export interface MemoryEvent {
  day: number;
  type: 'blessing' | 'storm' | 'drought' | 'miracle' | 'lifted' | 'prayer_answered';
  description: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Villager {
  id: string;
  name: string;
  personality: 'devout' | 'skeptic' | 'hardworking' | 'timid' | 'cheerful';
  needs: VillagerNeeds;
  currentAction: VillagerAction;
  x: number; // Island coordinate -2 to 2
  z: number;
  isInspected: boolean;
  heldHeight: number;
  recentDialogue: string;
  memories: MemoryEvent[];
  color: string;
}

export interface IslandState {
  day: number;
  timeOfDay: number; // 0 to 1 (0 = dawn, 0.5 = midday, 1 = midnight)
  weather: WeatherType;
  temperature: number; // Celsius, e.g. 12 to 32
  soilMoisture: number; // 0 - 100%
  cropYield: number; // 0 - 100
  waterReservoir: number; // 0 - 100
  sacredShrineGlow: number; // 0 - 100
  activeGesture: GestureType | null;
  gestureIntensity: number;
}

export interface ProjectCheckItem {
  id: string;
  category: 'unity' | 'packages' | 'openxr' | 'interaction_sdk' | 'meta_simulator' | 'build_settings';
  title: string;
  description: string;
  requiredValue: string;
  docReference?: string;
  checked: boolean;
  severity: 'critical' | 'recommended';
  codeSnippet?: string;
}
