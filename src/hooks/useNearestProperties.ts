import { Coordinate, Property, Stop, TransitableProperty } from "@/types";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type TransitablePropertyResponse = {
    property: Property;
    score: number;
    walk_distance_nearest_stop: number;
    walk_time_nearest_stop: number;
    nearest_stop: Stop;
};

type GetTransitablePropertiesResponse = TransitablePropertyResponse[];

const fetchNearestProperties = async (
    origin: Coordinate | null,
    walkDistance: number = 500,
    minTransfers: number = 2,
    maxTransfers: number = 5
) => {
    if (!origin) return [];
    try {
        const results = await api.get(
            `/properties/nearest/transit?latitude=${origin?.latitude}&longitude=${origin?.longitude}&walk_distance=${walkDistance}&min_transfer=${minTransfers}&max_transfer=${maxTransfers}`
        );

        return results.data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        }
    }
};

const useNearestProperties = (origin: Coordinate | null) => {
    const { data, ...rest } = useQuery<GetTransitablePropertiesResponse, Error>(
        {
            queryKey: ["properties", "nearest", origin],
            queryFn: () => fetchNearestProperties(origin, 2000),
            enabled: origin !== undefined,
        }
    );

    const properties: TransitableProperty[] = useMemo(() => {
        if (!data?.length) return [];

        const transitableProperties: TransitableProperty[] = data?.map(
            (transitableProperty) => ({
                property: transitableProperty.property,
                score: transitableProperty.score,
                nearestStop: transitableProperty.nearest_stop,
                walkDistanceNearestStop:
                    transitableProperty.walk_distance_nearest_stop,
                walkTimeNearestStop: transitableProperty.walk_time_nearest_stop,
            })
        );
        return transitableProperties;
    }, [data]);

    return {
        properties,
        ...rest,
    };
};

export default useNearestProperties;
