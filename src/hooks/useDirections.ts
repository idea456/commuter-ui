import { Coordinate, PlanDataResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";

const fetchDirections = async (
    origin?: Coordinate,
    destination?: Coordinate
) => {
    const results = await axios.post("http://localhost:4001/directions", {
        origin,
        destination,
        options: {
            walk_reluctance: 10,
            transport_modes: ["SUBWAY"],
        },
    });

    return results.data;
};

const useDirections = (origin?: Coordinate, destination?: Coordinate) => {
    const { data, ...rest } = useQuery<PlanDataResponse>({
        queryKey: ["directions", origin, destination],
        queryFn: () => fetchDirections(origin, destination),
        enabled: origin !== undefined && destination !== undefined,
    });

    const directions = useMemo(() => {
        // NOTE: Just returning the first iteneary for now, check on this later
        if (!data) return;
        return data?.itineraries;
    }, [data]);

    return {
        directions,
        ...rest,
    };
};

export default useDirections;
