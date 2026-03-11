import axios from "axios";
import { openMeteoGeocodingSchema } from "./schemas";
import { formatLocationName } from "./utils";

export interface PersistedLocationRecord {
    id?: number;
    name: string;
}

export interface ResolvedPersistedLocation extends PersistedLocationRecord {
    latitude: number;
    longitude: number;
}

const fetchLocationMatches = async (name: string) => {
    const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en&format=json`
    );

    return openMeteoGeocodingSchema.parse(response.data).results || [];
};

const sanitizePersistedLocationRecord = (value: unknown): PersistedLocationRecord | null => {
    if (!value || typeof value !== "object") return null;

    const maybeRecord = value as { id?: unknown; name?: unknown };
    if (typeof maybeRecord.name !== "string" || !maybeRecord.name.trim()) return null;

    return {
        id: typeof maybeRecord.id === "number" ? maybeRecord.id : undefined,
        name: maybeRecord.name.trim(),
    };
};

export const parsePersistedLocation = (stored: string | null): PersistedLocationRecord | null => {
    if (!stored) return null;

    try {
        return sanitizePersistedLocationRecord(JSON.parse(stored));
    } catch {
        return null;
    }
};

export const parsePersistedLocations = (stored: string | null): PersistedLocationRecord[] => {
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((entry) => sanitizePersistedLocationRecord(entry))
            .filter((entry): entry is PersistedLocationRecord => entry !== null);
    } catch {
        return [];
    }
};

export const serializePersistedLocation = (location: PersistedLocationRecord): string =>
    JSON.stringify({
        id: location.id,
        name: location.name,
    });

export const serializePersistedLocations = (locations: PersistedLocationRecord[]): string =>
    JSON.stringify(
        locations.map((location) => ({
            id: location.id,
            name: location.name,
        }))
    );

export const resolvePersistedLocation = async (
    storedLocation: PersistedLocationRecord
): Promise<ResolvedPersistedLocation | null> => {
    const matches = await fetchLocationMatches(storedLocation.name);
    if (matches.length === 0) return null;

    const normalizedStoredName = storedLocation.name.toLowerCase();
    const match =
        matches.find((candidate) => storedLocation.id !== undefined && candidate.id === storedLocation.id) ||
        matches.find((candidate) => formatLocationName(candidate).toLowerCase() === normalizedStoredName) ||
        matches[0];

    return {
        id: match.id,
        latitude: match.latitude,
        longitude: match.longitude,
        name: formatLocationName(match) || storedLocation.name,
    };
};

export const resolvePersistedLocations = async (
    storedLocations: PersistedLocationRecord[]
): Promise<ResolvedPersistedLocation[]> => {
    const resolved = await Promise.all(
        storedLocations.map((storedLocation) => resolvePersistedLocation(storedLocation))
    );

    const uniqueLocations = new Map<string, ResolvedPersistedLocation>();

    resolved.forEach((location) => {
        if (!location) return;

        const key = location.id !== undefined ? `id:${location.id}` : `name:${location.name.toLowerCase()}`;
        if (!uniqueLocations.has(key)) {
            uniqueLocations.set(key, location);
        }
    });

    return [...uniqueLocations.values()];
};
