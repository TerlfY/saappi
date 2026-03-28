export interface WeatherData {
    time: string;
    values: {
        temperature: number | null;
        temperatureApparent?: number | null;
        humidity: number | null;
        windSpeed: number | null;
        windDirection: number | null;
        windGusts?: number | null;
        precipitationProbability: number | null;
        precipitation: number | null;
        rainAccumulation?: number;
        snowDepth?: number | null;
        snowfall?: number | null;
        snowfallSum?: number;
        sleetAccumulation?: number;
        iceAccumulation?: number;
        weatherCode: number | null;
        cloudCover: number | null;
        uvIndex?: number | null;
        visibility?: number;
        pressureSurfaceLevel?: number;
        isDay?: number | null;
        sunriseTime?: string;
        sunsetTime?: string;
        moonriseTime?: string;
        moonsetTime?: string;
        moonPhase?: number;
    };
}

export interface DailyForecast {
    time: string;
    values: {
        temperatureAvg: number | null;
        temperatureMax: number | null;
        temperatureMin: number | null;
        precipitationProbabilityAvg: number | null;
        weatherCodeMax: number | null;
        sunriseTime?: string;
        sunsetTime?: string;
        moonPhase: number | null;
        snowfallSum?: number | null;
    };
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface WebcamImage {
    current: {
        icon: string;
        thumbnail: string;
        preview: string;
        toenail: string;
    };
    daylight: {
        icon: string;
        thumbnail: string;
        preview: string;
        toenail: string;
    };
    sizes: {
        icon: { width: number; height: number };
        thumbnail: { width: number; height: number };
        preview: { width: number; height: number };
        toenail: { width: number; height: number };
    };
}

export interface WebcamLocation {
    city: string;
    region: string;
    country: string;
    continent: string;
    latitude: number;
    longitude: number;
}

export interface Webcam {
    webcamId: number;
    title: string;
    viewCount: number;
    status: string;
    lastUpdatedOn: string;
    images: WebcamImage;
    location: WebcamLocation;
}

export interface AirQualityData {
    current: {
        time: string;
        interval: number;
        european_aqi: number;
        us_aqi: number;
    };
}
