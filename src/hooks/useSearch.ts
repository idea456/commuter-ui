import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { SearchItem } from "@/types";

type SearchItemResponse = {
    lat: string;
    lon: string;
    name: string;
    display_name: string;
    boundingbox: string[];
};

const fetchSearch = async (query: string): Promise<SearchItemResponse[]> => {
    const results = await axios.get<SearchItemResponse[]>(
        `https://nominatim.openstreetmap.org/search.php?q=${query}&countrycodes=my&format=json`
    );

    return results.data;
};

const useSearch = (query: string) => {
    const { data, ...rest } = useQuery<SearchItemResponse[]>({
        queryKey: ["search", query],
        queryFn: () => fetchSearch(query),
        enabled: !!query.length,
        placeholderData: keepPreviousData,
    });

    const items: SearchItem[] = useMemo(() => {
        // NOTE: Just returning the first iteneary for now, check on this later
        if (!data) return [];
        return data?.map((item) => {
            return {
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                name: item.name,
                address: item.display_name,
                boundingBox:
                    item.boundingbox?.map((bb) => parseFloat(bb)) || [],
            };
        });
    }, [data]);

    return {
        items,
        ...rest,
    };
};

export default useSearch;
