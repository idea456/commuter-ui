export type RentalRange = {
    fromPrice: number;
    toPrice: number;
};

export type Coordinate = {
    latitude: number;
    longitude: number;
};

export type TransitableProperty = {
    property: Property;
    score: number;
    walkDistanceNearestStop: number;
    walkTimeNearestStop: number;
    nearestStop: Stop;
};

// NOTE: Add more type variants for NearestProperty
export type NearestProperty = TransitableProperty;

export type Property = {
    id: string;
    cellId: string;
    district: string;
    name: string;
    address: string;
    facilities: string[];
    link: string;
    rentalRange: RentalRange;
    type: string;
    coordinates: Coordinate;
    distance: number;
};
export type PlanDataResponse = {
    itineraries: Itineary[];
};

export type PlanResponse = {
    plan: PlanDataResponse;
};

export type LegStart = {
    scheduledTime: string;
    estimated: string;
};

export type LegEnd = {
    scheduledTime: string;
    estimated: string;
};

export type LegGeometry = {
    length: number;
    points: string;
};

export type LegPoint = {
    name: string;
};

export type Route = {
    shortName: string;
    longName: string;
    color: string;
};

export type Leg = {
    start: LegStart;
    end: LegEnd;
    mode: string;
    duration: number;
    from: LegPoint;
    to: LegPoint;
    legGeometry: LegGeometry;
    distance: number;
    route: Route;
};

export type Itineary = {
    start: Date;
    end: Date;
    duration: number;
    walkDistance: number;
    walkTime: number;
    waitingTime: number;
    transfers: number;
    legs: Leg[];
};

export type SearchItem = {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    boundingBox: number[];
};

export type Stop = {
    stop_id: string[];
    name: string;
    display_name: string;
    coordinates: Coordinate;
};
