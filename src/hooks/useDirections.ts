import { Coordinate, PlanDataResponse } from "@/types";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const fetchDirections = async (
    origin: Coordinate | null,
    destination: Coordinate | null
) => {
    const results = await api.post("/directions", {
        origin,
        destination,
        options: {
            walk_reluctance: 10,
            transport_modes: ["SUBWAY", "TRAM"],
        },
    });

    return results.data;
};

const useDirections = (
    origin: Coordinate | null,
    destination: Coordinate | null
) => {
    const { data, ...rest } = useQuery<PlanDataResponse>({
        queryKey: ["directions", origin, destination],
        queryFn: () => fetchDirections(origin, destination),
        enabled: !!origin && !!destination,
    });

    const directions = useMemo(() => {
        // NOTE: Just returning the first iteneary for now, check on this later
        if (!data) return null;
        return data?.itineraries;
    }, [data]);

    return {
        directions,
        ...rest,
    };
};

export default useDirections;
