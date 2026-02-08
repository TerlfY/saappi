import clearIconDay from "./assets/icons/large/10000_clear_large@2x.png";
import clearIconNight from "./assets/icons/large/10001_clear_large@2x.png";
import cloudyIcon from "./assets/icons/large/10010_cloudy_large@2x.png";
import PartlyCloudyIconDay from "./assets/icons/large/11010_partly_cloudy_large@2x.png";
import PartlyCloudyIconNight from "./assets/icons/large/11011_partly_cloudy_large@2x.png";

// Fog
import FogIcon from "./assets/icons/large/20000_fog_large@2x.png";

// Drizzle
// import DrizzleIcon from "./assets/icons/large/40000_drizzle_large@2x.png"; 

import RainIcon from "./assets/icons/large/40010_rain_large@2x.png";
import LightRainIcon from "./assets/icons/large/42000_rain_light_large@2x.png";
import HeavyRainIcon from "./assets/icons/large/42010_rain_heavy_large@2x.png";

import SnowIcon from "./assets/icons/large/50000_snow_large@2x.png";
import FlurriesIcon from "./assets/icons/large/50010_flurries_large@2x.png";
import LightSnowIcon from "./assets/icons/large/51000_snow_light_large@2x.png";
import HeavySnowIcon from "./assets/icons/large/51010_snow_heavy_large@2x.png";

import FreezingDrizzleIcon from "./assets/icons/large/60000_freezing_rain_drizzle_large@2x.png";
import FreezingRainIcon from "./assets/icons/large/60010_freezing_rain_large@2x.png";
import FreezingLightRainIcon from "./assets/icons/large/62000_freezing_rain_light_large@2x.png";
import FreezingHeavyRainIcon from "./assets/icons/large/62010_freezing_rain_heavy_large@2x.png";

import ThunderstormIcon from "./assets/icons/large/80000_tstorm_large@2x.png";

interface IconEntry {
    day: string;
    night: string;
}

const weatherIcons: Record<number, IconEntry> = {
    0: { day: clearIconDay, night: clearIconNight }, // Clear sky
    1: { day: clearIconDay, night: clearIconNight }, // Mainly clear
    2: { day: PartlyCloudyIconDay, night: PartlyCloudyIconNight }, // Partly cloudy
    3: { day: cloudyIcon, night: cloudyIcon }, // Overcast
    45: { day: FogIcon, night: FogIcon }, // Fog
    48: { day: FogIcon, night: FogIcon }, // Depositing rime fog
    51: { day: LightRainIcon, night: LightRainIcon }, // Light drizzle
    53: { day: RainIcon, night: RainIcon }, // Moderate drizzle
    55: { day: HeavyRainIcon, night: HeavyRainIcon }, // Dense drizzle
    56: { day: FreezingDrizzleIcon, night: FreezingDrizzleIcon }, // Light freezing drizzle
    57: { day: FreezingRainIcon, night: FreezingRainIcon }, // Dense freezing drizzle
    61: { day: LightRainIcon, night: LightRainIcon }, // Slight rain
    60: { day: LightRainIcon, night: LightRainIcon }, // Slight rain showers - Added missing code 60 if needed, or just rely on 80
    63: { day: RainIcon, night: RainIcon }, // Moderate rain
    65: { day: HeavyRainIcon, night: HeavyRainIcon }, // Heavy rain
    66: { day: FreezingLightRainIcon, night: FreezingLightRainIcon }, // Light freezing rain
    67: { day: FreezingHeavyRainIcon, night: FreezingHeavyRainIcon }, // Heavy freezing rain
    71: { day: LightSnowIcon, night: LightSnowIcon }, // Slight snow fall
    73: { day: SnowIcon, night: SnowIcon }, // Moderate snow fall
    75: { day: HeavySnowIcon, night: HeavySnowIcon }, // Heavy snow fall
    77: { day: FlurriesIcon, night: FlurriesIcon }, // Snow grains
    80: { day: LightRainIcon, night: LightRainIcon }, // Slight rain showers
    81: { day: RainIcon, night: RainIcon }, // Moderate rain showers
    82: { day: HeavyRainIcon, night: HeavyRainIcon }, // Violent rain showers
    85: { day: LightSnowIcon, night: LightSnowIcon }, // Slight snow showers
    86: { day: HeavySnowIcon, night: HeavySnowIcon }, // Heavy snow showers
    95: { day: ThunderstormIcon, night: ThunderstormIcon }, // Thunderstorm
    96: { day: ThunderstormIcon, night: ThunderstormIcon }, // Thunderstorm with slight hail
    99: { day: ThunderstormIcon, night: ThunderstormIcon }, // Thunderstorm with heavy hail
};

export function getIcon(weatherCode: number, isDay: boolean | number = true, _cloudCover: number | null = null): string {
    const iconEntry = weatherIcons[weatherCode];
    if (!iconEntry) return cloudyIcon; // Default fallback

    // If selectedIcon is an object with day/night, resolve it
    if (iconEntry && typeof iconEntry === 'object' && iconEntry.day && iconEntry.night) {
        // isDay can be number (0/1) or boolean
        return isDay ? iconEntry.day : iconEntry.night;
    }

    return iconEntry as unknown as string;
}
