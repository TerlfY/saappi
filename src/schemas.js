import { z } from "zod";

// --- Weather API Schemas ---

const weatherValueSchema = z.object({
    temperature: z.number().optional(),
    temperatureApparent: z.number().optional(),
    weatherCode: z.number().optional(),
    humidity: z.number().optional(),
    windSpeed: z.number().optional(),
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

export const weatherResponseSchema = z.object({
    data: z.object({
        values: weatherValueSchema,
    }).optional(),
    timelines: z.object({
        hourly: z.array(hourlyIntervalSchema).optional(),
        daily: z.array(dailyIntervalSchema).optional(),
    }).passthrough().optional(),
}).passthrough();

// --- Geocoding API Schemas ---

export const reverseGeocodeSchema = z.object({
    locality: z.string().optional(),
    city: z.string().optional(),
    principalSubdivision: z.string().optional(),
    countryName: z.string().optional(),
});

export const searchResultSchema = z.array(
    z.object({
        lat: z.string(),
        lon: z.string(),
        display_name: z.string(),
    })
);
