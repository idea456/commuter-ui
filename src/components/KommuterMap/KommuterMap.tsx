import { useState } from "react";
import { NearestProperty, Property, Stop } from "@/types";
import {
    Map as MapboxMap,
    Layer,
    Marker,
    NavigationControl,
    MapRef,
} from "react-map-gl";
import {
    TooltipProvider,
    TooltipTrigger,
    Tooltip,
    TooltipContent,
} from "../ui/tooltip";
import { useEffect, useMemo, useRef } from "react";
import polyline from "@mapbox/polyline";
import mapboxgl from "mapbox-gl";
import { useRootStore } from "@/stores";
import { cn } from "@/lib/utils";
import { Summary } from "./Summary";
import { MapPin } from "lucide-react";
import useNearestProperties from "@/hooks/useNearestProperties";
import useDirections from "@/hooks/useDirections";
import { StopSummary } from "./StopSummary";
import { StopPin } from "./StopPin";
import { DirectionsGeometry } from "./DirectionsGeometry";
import { bbox, lineString } from "@turf/turf";

const OriginPin = () => {
    return <MapPin fill="red" width={40} height={40} strokeWidth={1.5} />;
};

type PropertyPinProps = {
    isSelected?: boolean;
    property: Property;
    score: number;
    onClick: () => void;
};

const PropertyPin = ({
    isSelected,
    property,
    onClick,
    score,
}: PropertyPinProps) => {
    if (isSelected) {
        return (
            <div
                className="bg-yellow-400 p-2 rounded-3xl font-semibold border-black border-2 text-ellipsis overflow-hidden"
                onClick={onClick}
            >
                {property.name}
            </div>
        );
    }
    const customScore = (score / 9999) * 100;

    return (
        <div
            className={cn(
                " p-2 hover:bg-yellow-400 rounded-3xl font-semibold border-black border-2 hover:opacity-100",
                {
                    "bg-lime-500": customScore <= 20,
                    "bg-orange-400": customScore > 20,
                    "bg-red-500": customScore >= 30,
                }
            )}
            onClick={onClick}
        ></div>
    );
};

type TransitableStop = {
    stop: Stop;
    propertiesNearStop: NearestProperty[];
};

const CommuterMap = () => {
    const [selectedStop, setSelectedStop] = useState<TransitableStop | null>(
        null
    );
    const mapRef = useRef<MapRef | null>(null);

    const selectedProperty = useRootStore((state) => state.selectedProperty);
    const setSelectedProperty = useRootStore(
        (state) => state.setSelectedProperty
    );
    const origin = useRootStore((state) => state.origin);
    const destination = useRootStore((state) => state.destination);
    const setDestination = useRootStore((state) => state.setDestination);

    const { properties } = useNearestProperties(origin);
    const { directions, isLoading: isDirectionsLoading } = useDirections(
        origin,
        destination
    );

    const onClickStopPin = (transitableStop: TransitableStop) => {
        setSelectedProperty(null);
        setSelectedStop(transitableStop);
    };

    console.log(directions);

    const transitableStops: Map<string, TransitableStop> = useMemo(() => {
        if (!properties?.length) return new Map();

        let stops = new Map<string, TransitableStop>();
        properties.forEach((transitableProperty) => {
            const stopName = transitableProperty.nearestStop.name;
            const transitableStop = stops.get(stopName);
            if (transitableStop) {
                stops.set(stopName, {
                    ...transitableStop,
                    propertiesNearStop: [
                        ...transitableStop.propertiesNearStop,
                        transitableProperty,
                    ],
                });
            } else {
                stops.set(stopName, {
                    stop: transitableProperty.nearestStop,
                    propertiesNearStop: [transitableProperty],
                });
            }
        });

        return stops;
    }, [properties]);

    const onClickPropertyPin = (clickedProperty: NearestProperty) => {
        setDestination(clickedProperty.property.coordinates);
        setSelectedProperty(clickedProperty);
        setSelectedStop(null);
    };

    const [hoveredDirectionIndex, setHoveredDirectionIndex] = useState<
        number | null
    >(null);
    const [selectedDirection, setSelectedDirection] = useState<number | null>(
        null
    );

    useEffect(() => {
        if (directions?.length && selectedDirection && mapRef?.current) {
            const geojson = polyline.toGeoJSON(
                directions[0]?.legs[selectedDirection].legGeometry?.points
            );

            const boundingBox = bbox(geojson);
            // @ts-expect-error coordinates already satisfies [number, number] type
            const bounds = new mapboxgl.LngLatBounds(boundingBox);

            mapRef?.current.fitBounds(bounds, {
                bearing: 40,
                pitch: 40,
                zoom: 15,
            });
        }
    }, [directions, selectedDirection]);

    useEffect(() => {
        if (selectedStop && mapRef?.current) {
            const { stop, propertiesNearStop } = selectedStop;
            const coordinates = stop.coordinates;
            try {
                const bounds = new mapboxgl.LngLatBounds([
                    [coordinates.longitude, coordinates.latitude],
                    [coordinates.longitude, coordinates.latitude],
                ]);

                for (const transitableProperty of propertiesNearStop) {
                    bounds.extend([
                        transitableProperty.property.coordinates.longitude,
                        transitableProperty.property.coordinates.latitude,
                    ]);
                }

                mapRef.current.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: 20,
                    bearing: 40,
                    pitch: 40,
                    zoom: 16,
                });
            } catch (err) {
                console.error(err);
            }
        }
    }, [selectedStop]);

    useEffect(() => {
        if (directions?.length && mapRef?.current) {
            const lines = [];
            for (let i = 0; i < directions[0].legs.length; i++) {
                const line = polyline.toGeoJSON(
                    directions[0].legs[i].legGeometry.points
                );
                lines.push(...line.coordinates);
            }

            console.log(lines);

            const ls = lineString(lines);
            const boundingBox = bbox(ls);

            console.log(boundingBox);

            const bounds = new mapboxgl.LngLatBounds(boundingBox);

            mapRef?.current.fitBounds(bounds, {
                zoom: 14,
            });
        }
    }, [directions]);

    const propertiesMarkers = useMemo(
        () =>
            properties?.map((propertyResult) => (
                <Marker
                    key={propertyResult.property.id}
                    offset={[0, -25]}
                    latitude={propertyResult.property.coordinates.latitude}
                    longitude={propertyResult.property.coordinates.longitude}
                >
                    <Tooltip>
                        <TooltipTrigger>
                            <PropertyPin
                                score={propertyResult.score}
                                property={propertyResult.property}
                                isSelected={
                                    propertyResult.property.id ===
                                    selectedProperty?.property.id
                                }
                                onClick={() =>
                                    onClickPropertyPin(propertyResult)
                                }
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            {propertyResult.property.name}
                        </TooltipContent>
                    </Tooltip>
                </Marker>
            )),
        [properties]
    );

    const stopsMarkers = useMemo(
        () =>
            Array.from(transitableStops.values()).map((transitableStop) => {
                const { stop, propertiesNearStop } = transitableStop;

                return (
                    <StopPin
                        key={stop.stop_id[0]}
                        stop={stop}
                        isSelected={
                            selectedStop?.stop.stop_id[0] === stop.stop_id[0]
                        }
                        propertiesNearStop={propertiesNearStop}
                        onClick={() => onClickStopPin(transitableStop)}
                    />
                );
            }),
        [transitableStops]
    );

    return (
        <div className="w-screen h-screen relative">
            {!selectedStop && (
                <Summary
                    isLoading={isDirectionsLoading}
                    directions={directions}
                    setHoveredDirectionIndex={setHoveredDirectionIndex}
                    setSelectedDirection={setSelectedDirection}
                />
            )}
            {!selectedProperty && (
                <StopSummary
                    stop={selectedStop?.stop}
                    propertiesNearStop={selectedStop?.propertiesNearStop}
                />
            )}
            <TooltipProvider>
                <MapboxMap
                    ref={mapRef}
                    reuseMaps
                    initialViewState={{
                        longitude: 101.69189910816957,
                        latitude: 3.150366192226979,
                        zoom: 12,
                        bearing: 40,
                        pitch: 40,
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    minZoom={12}
                    maxZoom={17}
                >
                    <NavigationControl position="bottom-left" />
                    <Layer
                        id="3d-buildings"
                        type="fill-extrusion"
                        source="composite"
                        source-layer="building"
                        filter={["==", "extrude", "true"]}
                        minzoom={15}
                        paint={{
                            "fill-extrusion-color": "#aaa",
                            "fill-extrusion-height": {
                                type: "identity",
                                property: "height",
                            },
                            "fill-extrusion-base": {
                                type: "identity",
                                property: "min_height",
                            },
                            "fill-extrusion-opacity": 0.6,
                        }}
                    />
                    {origin && (
                        <Marker
                            latitude={origin.latitude}
                            longitude={origin.longitude}
                            offset={[0, -20]}
                        >
                            <OriginPin />
                        </Marker>
                    )}
                    {stopsMarkers}
                    {propertiesMarkers}
                    {directions?.length && (
                        <DirectionsGeometry
                            direction={directions[0]}
                            hoveredDirectionIndex={hoveredDirectionIndex}
                        />
                    )}
                </MapboxMap>
            </TooltipProvider>
        </div>
    );
};

export default CommuterMap;
