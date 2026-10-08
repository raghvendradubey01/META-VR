import { Villager, WeatherType } from '../types/game';

export const FALLBACK_DIALOGUES = {
  high_faith: [
    "The Sky Father watches over our hearth! I feel the warm grace upon our soil.",
    "Look! The clouds part just as the elder prophesied!",
    "Praise the unseen hands! The island hums with divine favor.",
    "I shall place our freshest harvest at the sacred stone altar."
  ],
  low_faith: [
    "Are the rumors true? Has the Sky Guardian forgotten our quiet shores?",
    "The shrine stones are cold today... perhaps we are truly alone.",
    "If there is a god above, why does the chill linger so long?",
    "We must rely only on our own two hands; the heavens remain silent."
  ],
  thirsty: [
    "The freshwater spring has dwindled to a trickle... we need rain soon.",
    "My throat is parched and the well is dusty.",
    "If the rainclouds do not visit us, our crops will wither."
  ],
  hungry: [
    "Our bellies ache... the wheat fields need sun and gentle showers to grow.",
    "The storage cellar is down to its last turnip basket.",
    "We must tend the farm plots before the harvest festival."
  ],
  cold: [
    "Brrr! The sea winds pierce to the bone! If only the sun would warm our bones.",
    "My hands are stiff from the frost. Let us gather around the central bonfire.",
    "A ray of warm sunshine would be a true blessing right now."
  ],
  storm_frightened: [
    "The howling winds are fierce! Batten down the thatch roofs!",
    "Take shelter in the longhouse until the tempest passes!",
    "The palms are bending to snapping point! Please, calm the sky!"
  ],
  picked_up: [
    "Whoa! The giant hands have lifted me into the sky! Be gentle, O Great One!",
    "I can see the entire reef from up here! Truly a miraculous vantage!",
    "P-please do not drop me into the deep waters, kind Deity!",
    "I am in the presence of the Hand! Forgive our humble shortcomings!"
  ],
  happy: [
    "The sweet water flows, the hearth is warm, and our bellies are full!",
    "What a wondrous day to dwell on this blessed island!",
    "The children are dancing by the shoreline; life is good under your sky."
  ]
};

export function getFallbackDialogue(villager: Villager, weather: WeatherType): string {
  if (villager.isInspected || villager.heldHeight > 0.1) {
    const arr = FALLBACK_DIALOGUES.picked_up;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (weather === 'windy' && villager.needs.safety < 50) {
    const arr = FALLBACK_DIALOGUES.storm_frightened;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (villager.needs.water < 35) {
    const arr = FALLBACK_DIALOGUES.thirsty;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (villager.needs.food < 35) {
    const arr = FALLBACK_DIALOGUES.hungry;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (villager.needs.warmth < 35) {
    const arr = FALLBACK_DIALOGUES.cold;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (villager.needs.faith > 70) {
    const arr = FALLBACK_DIALOGUES.high_faith;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (villager.needs.faith < 30) {
    const arr = FALLBACK_DIALOGUES.low_faith;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const arr = FALLBACK_DIALOGUES.happy;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateDailyChronicleLocal(
  day: number,
  weatherHistory: WeatherType[],
  villagers: Villager[]
): string {
  const avgFaith = Math.round(villagers.reduce((acc, v) => acc + v.needs.faith, 0) / villagers.length);
  const avgFood = Math.round(villagers.reduce((acc, v) => acc + v.needs.food, 0) / villagers.length);
  const dominantWeather = weatherHistory.length > 0 ? weatherHistory[weatherHistory.length - 1] : 'calm';

  const weatherDescriptions: Record<WeatherType, string> = {
    sunny: "basked under radiant golden sunlight that warmed the stone cottages",
    rainy: "soaked in replenishing sweet rains that filled the highland cisterns",
    windy: "endured whistling offshore gales that set the prayer banners fluttering",
    calm: "rested in tranquil, glassy stillness where the tide kissed the shore"
  };

  let mood = "The villagers held evening vigil around the hearth with quiet reverence.";
  if (avgFaith > 75) {
    mood = "The tribe sang resonant hymns to the Sky God, leaving floral garlands at the central shrine.";
  } else if (avgFaith < 40) {
    mood = "A quiet skepticism lingered by the campfire, with elders questioning the signs above.";
  }

  let foodState = "granaries held steady provisions.";
  if (avgFood > 80) foodState = "orchards and plots yielded an abundant harvest feast!";
  else if (avgFood < 40) foodState = "foragers scoured the rocky shores searching for spare kelp and shellfish.";

  return `Chronicle of Day ${day}: The isle ${weatherDescriptions[dominantWeather]}. Village provisions stood at ${avgFood}%, and faith measured ${avgFaith}%. ${foodState} ${mood}`;
}
