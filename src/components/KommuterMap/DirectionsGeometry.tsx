import { Itineary } from "@/types";
import polyline from "@mapbox/polyline";
import { Source, Layer } from "react-map-gl";

export const DirectionsGeometry = ({
    direction,
    hoveredDirectionIndex,
}: {
    direction: Itineary;
    hoveredDirectionIndex: number | null;
}) => {
    return direction.legs.map((leg, i) => {
        const geojson = polyline.toGeoJSON(leg.legGeometry.points);
        return (
            <Source type="geojson" data={geojson}>
                <Layer
                    type="line"
                    paint={{
                        "line-width": 10,
                        "line-color":
                            hoveredDirectionIndex === i
                                ? "yellow"
                                : leg.mode === "WALK"
                                ? "#B7B7B7"
                                : `#${leg?.route.color}`,
                        "line-border-color": "black",
                        "line-border-width": 2,
                    }}
                    layout={{
                        "line-cap":
                            i === 0 || i === direction.legs.length - 1
                                ? "round"
                                : "round",
                        "line-join":
                            i === 0 || i === direction.legs.length - 1
                                ? "round"
                                : "round",
                    }}
                />
            </Source>
        );
    });
};
