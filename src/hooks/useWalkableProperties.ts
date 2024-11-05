import { Coordinate, Property, Stop, TransitableProperty } from "@/types";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type WalkablePropertyResponse = {
    property: Property;
    score: number;
    walk_distance_nearest_stop: number;
    walk_time_nearest_stop: number;
    nearest_stop: Stop;
};

type GetWalkablePropertyResponse = WalkablePropertyResponse[];

type WalkablePropertyOption = {
    origin?: Coordinate | null;
    walkDistance?: number | null;
    mode?: "walking" | "transit";
};

const fetchWalkableProperties = async (options: WalkablePropertyOption) => {
    const { origin, walkDistance } = options;
    if (!origin) return [];
    try {
        const results = await api.get(
            `/properties/nearest/walkable?latitude=${origin?.latitude}&longitude=${origin?.longitude}&walk_distance=${walkDistance}`,
        );

        return results.data;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        }
    }
};

const useWalkableProperties = (
    options: WalkablePropertyOption,
    isSubmitting: boolean,
) => {
    const { data, ...rest } = useQuery<GetWalkablePropertyResponse, Error>({
        queryKey: ["properties", "nearest", "walkable", options],
        queryFn: () => fetchWalkableProperties(options),
        enabled: isSubmitting,
    });

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

export default useWalkableProperties;
