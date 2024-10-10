import { Property, Coordinate } from "@/types";
import { create } from "zustand";

interface RootStore {
    destination: Coordinate | null;
    selectedProperty: Property | null;
    setDestination: (coordinates: Coordinate | null) => void;
    setSelectedProperty: (property: Property | null) => void;
}

export const useRootStore = create<RootStore>((set) => ({
    destination: null,
    setDestination: (coordinates: Coordinate | null) =>
        set((state) => ({ ...state, destination: coordinates })),
    selectedProperty: null,
    setSelectedProperty: (property: Property | null) =>
        set((state) => ({ ...state, selectedProperty: property })),
}));
