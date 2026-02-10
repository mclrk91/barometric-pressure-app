export interface WeatherInfo {
  icon: string;
  description: string;
  isRainy: boolean;
}

export function weatherCodeToInfo(code: number): WeatherInfo {
  if (code === 0) return { icon: '\u2600\uFE0F', description: 'Clear sky', isRainy: false };
  if (code <= 3) return { icon: '\u26C5', description: 'Partly cloudy', isRainy: false };
  if (code <= 48) return { icon: '\uD83C\uDF2B\uFE0F', description: 'Foggy', isRainy: false };
  if (code <= 57) return { icon: '\uD83C\uDF27\uFE0F', description: 'Drizzle', isRainy: true };
  if (code <= 67) return { icon: '\uD83C\uDF27\uFE0F', description: 'Rain', isRainy: true };
  if (code <= 77) return { icon: '\u2744\uFE0F', description: 'Snow', isRainy: false };
  if (code <= 82) return { icon: '\uD83C\uDF27\uFE0F', description: 'Rain showers', isRainy: true };
  if (code <= 86) return { icon: '\uD83C\uDF28\uFE0F', description: 'Snow showers', isRainy: false };
  return { icon: '\u26C8\uFE0F', description: 'Thunderstorm', isRainy: true };
}
