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
        "circle-radius": ["step", ["get", "point_count"], 20, 3, 30, 10, 40],
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

const transitableScore = {
    easy: ['<', ['get', 'score'], 500],
    normal: ['>=', ['get', 'score'], 1000],
    hard: ['>=', ['get', 'score'], 2000]
}

export const unclusteredPointLayer: LayerProps = {
    id: "unclustered-point",
    type: "circle",
    source: "properties",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": ['case', transitableScore.easy, '#00ff00', transitableScore.normal, '#00ffff', transitableScore.hard, '#ff0000', '#000000'],
        "circle-radius": 10,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
    },
};
