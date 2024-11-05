import { Coordinate } from "@/types";
import { mapboxApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { FeatureCollection } from "geojson";

type GetIsochroneOptions = {
    origin: Coordinate | null;
    walkDistance: number | null;
};

const fetchIsochrone = async (options: GetIsochroneOptions) => {
    const { origin, walkDistance } = options;
    if (!origin) return;

    const res = await mapboxApi.get<FeatureCollection>(
        `/isochrone/v1/mapbox/walking/${origin.longitude},${
            origin.latitude
        }?contours_meters=${walkDistance}&polygons=true&access_token=${"pk.eyJ1IjoiaWRlYTQ1NiIsImEiOiJja2ZiYmZ4b2UwMWF2MnhxMjRwNmV2aTc0In0.FRWTXiH1jcNSTdOSrIlXLQ"}`,
    );

    return res.data;
};

export const useIsochrone = (options: GetIsochroneOptions) => {
    const query = useQuery({
        queryKey: ["isochrone", options],
        queryFn: () => fetchIsochrone(options),
        enabled: !!options && !!options.origin && !!options.walkDistance,
    });

    return query;
};
