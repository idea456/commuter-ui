import type { LayerProps } from "react-map-gl";

export const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "properties",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            3,
            "#f1f075",
            10,
            "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 750, 40],
        "circle-opacity": 0.7,
    },
};

export const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "properties",
    filter: ["has", "point_count"],
    layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
    },
};

export const unclusteredPointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "properties",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": "#11b4da",
        "circle-radius": 10,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
    },
};