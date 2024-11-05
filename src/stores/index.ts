import { Property, Coordinate, Itineary, NearestProperty } from "@/types";
import { create } from "zustand";

interface RootStore {
    origin: Coordinate | null;
    destination: Coordinate | null;
    properties: NearestProperty[] | null;
    directions: Itineary[] | null;
    mode: "walking" | "transit";
    walkDistance: number | null;
    selectedProperty: NearestProperty | null;
    setDestination: (coordinates: Coordinate | null) => void;
    setProperties: (properties: NearestProperty[]) => void;
    setWalkDistance: (walkDistance: number) => void;
    setOrigin: (coordinates: Coordinate | null) => void;
    setSelectedProperty: (property: NearestProperty | null) => void;
    setMode: (mode: "walking" | "transit") => void;
}

export const useRootStore = create<RootStore>((set) => ({
    origin: null,
    destination: null,
    properties: null,
    mode: "walking",
    directions: null,
    walkDistance: null,
    selectedProperty: null,
    setDestination: (coordinates: Coordinate | null) =>
        set((state) => ({ ...state, destination: coordinates })),
    setOrigin: (coordinates: Coordinate | null) =>
        set((state) => ({ ...state, origin: coordinates })),
    setProperties: (properties: NearestProperty[]) =>
        set((state) => ({ ...state, properties })),
    setWalkDistance: (walkDistance: number) =>
        set((state) => ({ ...state, walkDistance })),
    setMode: (mode: "walking" | "transit") =>
        set((state) => ({ ...state, mode })),
    setDirections: (directions: Itineary[]) =>
        set((state) => ({ ...state, directions })),
    setSelectedProperty: (property: NearestProperty | null) =>
        set((state) => ({ ...state, selectedProperty: property })),
}));
