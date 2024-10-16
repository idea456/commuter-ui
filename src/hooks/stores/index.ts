import { Property, Coordinate } from "@/types";
import { create } from "zustand";

interface RootStore {
    origin: Coordinate | null;
    destination: Coordinate | null;
    selectedProperty: Property | null;
    setDestination: (coordinates: Coordinate | null) => void;
    setOrigin: (coordinates: Coordinate | null) => void;
    setSelectedProperty: (property: Property | null) => void;
}

export const useRootStore = create<RootStore>((set) => ({
    origin: null,
    destination: null,
    setDestination: (coordinates: Coordinate | null) =>
        set((state) => ({ ...state, destination: coordinates })),
    setOrigin: (coordinates: Coordinate | null) =>
        set((state) => ({ ...state, origin: coordinates })),
    selectedProperty: null,
    setSelectedProperty: (property: Property | null) =>
        set((state) => ({ ...state, selectedProperty: property })),
}));
