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

export type NearestPropertiesOption = {
    origin: Coordinate;
    walkDistance: number;
    minTransfers: number;
    maxTransfers: number;
    mode?: "walking" | "transit";
};

const fetchNearestProperties = async (options: NearestPropertiesOption) => {
    const { origin, walkDistance, minTransfers, maxTransfers } = options;
    console.log(options);

    try {
        const results = await api.get(
            `/properties/nearest/transit?latitude=${origin.latitude}&longitude=${origin.longitude}&walk_distance=${walkDistance}&min_transfer=${minTransfers}&max_transfer=${maxTransfers}`,
        );

        console.log(results);
        return results.data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        }
    }
};

const useNearestProperties = (
    isSubmitting: boolean,
    options?: NearestPropertiesOption,
) => {
    const { data, ...rest } = useQuery<GetTransitablePropertiesResponse, Error>(
        {
            queryKey: [
                "properties",
                "nearest",
                "transit",
                options?.origin?.latitude,
                options?.origin?.longitude,
            ],
            queryFn: () => {
                if (options) return fetchNearestProperties(options);
            },
            enabled: isSubmitting && options?.mode === "transit",
        },
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
            }),
        );
        return transitableProperties;
    }, [data]);

    return {
        properties,
        ...rest,
    };
};

export default useNearestProperties;
