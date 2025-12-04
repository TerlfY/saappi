import { z } from "zod";

// --- Weather API Schemas ---

const weatherValueSchema = z.object({
    temperature: z.number().optional(),
    temperatureApparent: z.number().optional(),
    weatherCode: z.number().optional(),
    humidity: z.number().optional(),
    windSpeed: z.number().optional(),
    windGusts: z.number().optional(),
    windDirection: z.number().optional(),
    precipitationProbability: z.number().optional(),
    rainAccumulation: z.number().optional(),
    snowAccumulation: z.number().optional(),
    uvIndex: z.number().optional(),
    visibility: z.number().optional(),
    cloudCover: z.number().optional(),
    pressureSurfaceLevel: z.number().optional(),
    sunriseTime: z.string().optional(),
    sunsetTime: z.string().optional(),
    temperatureMin: z.number().optional(),
    temperatureMax: z.number().optional(),
    weatherCodeMin: z.number().optional(),
    weatherCodeMax: z.number().optional(),
}).passthrough();

const hourlyIntervalSchema = z.object({
    time: z.string().optional(),
    startTime: z.string().optional(), // Keep both just in case
    values: weatherValueSchema,
}).passthrough();

const dailyIntervalSchema = z.object({
    time: z.string().optional(),
    startTime: z.string().optional(), // Keep both just in case
    values: weatherValueSchema,
}).passthrough();

export const openMeteoSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    generationtime_ms: z.number(),
    utc_offset_seconds: z.number(),
    timezone: z.string(),
    timezone_abbreviation: z.string(),
    elevation: z.number(),
    hourly_units: z.object({}).passthrough().optional(),
    hourly: z.object({
        time: z.array(z.string()),
        temperature_2m: z.array(z.number().nullable()),
        relativehumidity_2m: z.array(z.number().nullable()),
        apparent_temperature: z.array(z.number().nullable()),
        weathercode: z.array(z.number().nullable()),
        windspeed_10m: z.array(z.number().nullable()),
        windgusts_10m: z.array(z.number().nullable()).optional(),
        winddirection_10m: z.array(z.number().nullable()).optional(),
        uv_index: z.array(z.number().nullable()),
        cloudcover: z.array(z.number().nullable()),
        snow_depth: z.array(z.number().nullable()).optional(),
        snowfall: z.array(z.number().nullable()).optional(),
        precipitation_probability: z.array(z.number().nullable()).optional(),
    }).passthrough(),
    daily_units: z.object({}).passthrough().optional(),
    daily: z.object({
        time: z.array(z.string()),
        weathercode: z.array(z.number().nullable()),
        temperature_2m_max: z.array(z.number().nullable()),
        temperature_2m_min: z.array(z.number().nullable()),
        sunrise: z.array(z.string()),
        sunset: z.array(z.string()),
        precipitation_probability_max: z.array(z.number().nullable()).optional(),
        snowfall_sum: z.array(z.number().nullable()).optional(),
    }).passthrough(),
}).passthrough();

// --- Geocoding API Schemas ---

export const reverseGeocodeSchema = z.object({
    locality: z.string().optional(),
    city: z.string().optional(),
    principalSubdivision: z.string().optional(),
    countryName: z.string().optional(),
});

export const openMeteoGeocodingSchema = z.object({
    results: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
            latitude: z.number(),
            longitude: z.number(),
            elevation: z.number().optional(),
            feature_code: z.string().optional(),
            country_code: z.string().optional(),
            timezone: z.string().optional(),
            population: z.number().optional(),
            country: z.string().optional(),
            admin1: z.string().optional(),
            admin2: z.string().optional(),
            admin3: z.string().optional(),
            admin4: z.string().optional(),
        }).passthrough()
    ).optional(),
}).passthrough();
