import { SearchValues } from "@/components/SearchForm";
import { Coordinate, Property } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

const fetchNearestProperties = async (
    origin?: Coordinate,
    walkDistance: number = 2000,
    minStops: number = 2
) => {
    const results = await axios.get(
        `http://localhost:4001/properties/nearest/transit?latitude=${origin?.latitude}&longitude=${origin?.longitude}&walk_distance=${walkDistance}&min_stops=${minStops}`
    );

    return results.data;
};

const useNearestProperties = (origin?: Coordinate, filter?: SearchValues) => {
    const { data, ...rest } = useQuery<Property[]>({
        queryKey: [
            "properties",
            "nearest",
            origin,
            filter?.minPrice,
            filter?.maxPrice,
        ],
        queryFn: async () => await fetchNearestProperties(origin, 2000, 5),
        enabled: origin !== undefined,
    });

    const properties = useMemo(() => {
        if (!data?.length) return [];

        return data;
    }, [data]);

    return {
        properties,
        ...rest,
    };
};

export default useNearestProperties;
