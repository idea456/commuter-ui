import { SearchValues } from "@/components/SearchForm";
import { Coordinate, Property } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

const fetchNearestProperties = async (
    origin?: Coordinate,
    filter?: SearchValues
) => {
    console.log("the filters", filter);
    const results = await axios.post(
        "http://localhost:4001/properties/nearest/transit",
        {
            origin,
            min_price: filter?.minPrice,
            max_price: filter?.maxPrice,
            radius: 3,
        }
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
        queryFn: async () => await fetchNearestProperties(origin, filter),
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
