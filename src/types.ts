export interface WeatherData {
    time: string;
    values: {
        temperature: number;
        temperatureApparent?: number;
        humidity: number;
        windSpeed: number;
        windDirection: number;
        windGusts?: number;
        precipitationProbability: number;
        precipitation: number;
        rainAccumulation?: number;
        snowfall?: number;
        snowfallSum?: number;
        sleetAccumulation?: number;
        iceAccumulation?: number;
        weatherCode: number;
        cloudCover: number;
        uvIndex?: number;
        visibility?: number;
        pressureSurfaceLevel?: number;
        isDay?: number;
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
        temperatureAvg: number;
        temperatureMax: number;
        temperatureMin: number;
        precipitationProbabilityAvg: number;
        weatherCodeMax: number;
        sunriseTime?: string;
        sunsetTime?: string;
        moonPhase: number;
        snowfallSum?: number;
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
