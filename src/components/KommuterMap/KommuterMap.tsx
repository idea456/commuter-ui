import { useState } from "react";
import { NearestProperty, Property, Stop } from "@/types";
import {
    Map as MapboxMap,
    Layer,
    Marker,
    NavigationControl,
    MapRef,
    Source,
} from "react-map-gl";
import {
    TooltipProvider,
    TooltipTrigger,
    Tooltip,
    TooltipContent,
} from "../ui/tooltip";
import { useEffect, useMemo, useRef } from "react";
import polyline from "@mapbox/polyline";
import mapboxgl, { MapEvent } from "mapbox-gl";
import { useRootStore } from "@/stores";
import { cn } from "@/lib/utils";
import { Summary } from "./Summary";
import { MapPin } from "lucide-react";
import useDirections from "@/hooks/useDirections";
import { StopSummary } from "./StopSummary";
import { StopPin } from "./StopPin";
import { DirectionsGeometry } from "./DirectionsGeometry";
import {
    bbox,
    center,
    featureCollection,
    lineString,
    point,
    points,
} from "@turf/turf";
import { Feature, GeoJsonProperties, Point, Position } from "geojson";
import { clusterLayer } from "./layers/PropertiesCluster";
import useSupercluster from "use-supercluster";
import { useIsochrone } from "@/hooks/useIsochrone";
import { getRouteColor } from "@/utils/colors";
import { useDevice } from "@/hooks/useDevice";

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
                className="bg-yellow-400 p-2 rounded-full font-semibold border-black border-2 text-ellipsis overflow-hidden"
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
                " p-2 hover:bg-yellow-400 rounded-full font-semibold border-black border-2 hover:opacity-100",
                {
                    "bg-lime-500": customScore <= 20,
                    "bg-orange-400": customScore > 20,
                    "bg-red-500": customScore >= 30,
                },
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
        null,
    );
    const { isDesktop, isMobile } = useDevice();
    const mapRef = useRef<MapRef | null>(null);

    const selectedProperty = useRootStore((state) => state.selectedProperty);
    const setSelectedProperty = useRootStore(
        (state) => state.setSelectedProperty,
    );
    const origin = useRootStore((state) => state.origin);
    const destination = useRootStore((state) => state.destination);
    const properties = useRootStore((state) => state.properties);
    const walkDistance = useRootStore((state) => state.walkDistance);
    const mode = useRootStore((state) => state.mode);
    const setDestination = useRootStore((state) => state.setDestination);

    const { directions, isLoading: isDirectionsLoading } = useDirections(
        origin,
        destination,
    );
    const { data: isochrone } = useIsochrone({
        origin,
        walkDistance,
    });
    const { data: stopIsochrone } = useIsochrone({
        origin: selectedStop?.stop?.coordinates || null,
        walkDistance: 500,
    });

    const onClickStopPin = (transitableStop: TransitableStop) => {
        setSelectedProperty(null);
        setSelectedStop(transitableStop);
    };

    const transitableStops: Map<string, TransitableStop> = useMemo(() => {
        if (!properties?.length || mode !== "transit") return new Map();

        let stops = new Map<string, TransitableStop>();
        properties.forEach((transitableProperty) => {
            const stopName = transitableProperty.nearestStop?.name;
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
        null,
    );

    useEffect(() => {
        if (directions?.length && selectedDirection && mapRef?.current) {
            const geojson = polyline.toGeoJSON(
                directions[0]?.legs[selectedDirection].legGeometry?.points,
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

    const propertiesFeatureCollection = useMemo(() => {
        if (!properties?.length) return points([]);

        const propertyPoints: Feature<Point, GeoJsonProperties>[] = [];
        properties.forEach((property) => {
            const { latitude, longitude } = property.property.coordinates;
            const propertyPoint = point([longitude, latitude]);
            propertyPoint.properties = {
                property: property.property,
                nearestStop: property.nearestStop,
                score: property.score,
            };
            propertyPoints.push(propertyPoint);
        });

        const propertiesFeatures = featureCollection(propertyPoints);
        return propertiesFeatures;
    }, [properties]);

    const mapBounds = useMemo(() => {
        if (!mapRef?.current) return null;

        return mapRef.current.getMap().getBounds()?.toArray().flat();
    }, [mapRef?.current]);

    const [viewport, setViewport] = useState({
        latitude: 52.6376,
        longitude: -1.135171,
        width: "100vw",
        height: "100vh",
        zoom: 12,
    });

    const { clusters } = useSupercluster({
        points: propertiesFeatureCollection.features,
        bounds: mapBounds,
        zoom: viewport.zoom,
        options: {
            radius: 50,
            maxZoom: 15,
        },
    });

    useEffect(() => {
        if (
            properties?.length &&
            mapRef?.current &&
            !(selectedProperty || selectedStop)
        ) {
            const positions: Position[] = [];
            points;
            properties.forEach((property) => {
                const { latitude, longitude } = property.property.coordinates;
                positions.push([longitude, latitude]);
            });

            const propertiesPoint = points(positions);
            const boundingBox = bbox(propertiesPoint);
            const bounds = new mapboxgl.LngLatBounds(boundingBox);

            mapRef.current.fitBounds(bounds, {
                zoom: 14,
                bearing: 40,
                pitch: 40,
            });
        }
    }, [properties, origin, selectedProperty, selectedStop]);

    useEffect(() => {
        if (directions?.length && mapRef?.current) {
            const lines = [];
            for (let i = 0; i < directions[0].legs.length; i++) {
                const line = polyline.toGeoJSON(
                    directions[0].legs[i].legGeometry.points,
                );
                lines.push(...line.coordinates);
            }

            console.log(lines);

            const ls = lineString(lines);
            const boundingBox = bbox(ls);

            console.log(boundingBox);

            const bounds = new mapboxgl.LngLatBounds(boundingBox);

            mapRef?.current.fitBounds(bounds, {
                zoom: 15,
                bearing: 40,
                pitch: 40,
            });
        }
    }, [directions]);

    // When user selects an origin from the autocomplete
    useEffect(() => {
        if (origin && mapRef?.current) {
            const originPoint = point([origin.longitude, origin.latitude]);
            const boundingBox = bbox(originPoint);

            const bounds = new mapboxgl.LngLatBounds(boundingBox);

            mapRef?.current.fitBounds(bounds, {
                zoom: 15,
                bearing: 40,
                pitch: 40,
                offset: [0, -200],
            });
        }
    }, [origin]);

    const propertiesMarkers = useMemo(
        () =>
            clusters?.map((cluster) => {
                if (cluster?.properties?.cluster) {
                    const { geometry, properties } = cluster;
                    return (
                        <Marker
                            key={cluster.id}
                            latitude={geometry.coordinates[1]}
                            longitude={geometry.coordinates[0]}
                        >
                            <div
                                className={cn(
                                    "bg-opacity-30 rounded-full z-99 text-black flex items-center justify-center font-bold border border-black border-2 text-opacity-100 cursor-pointer",
                                    {
                                        "w-[40px] h-[40px] bg-sky-400 border-sky-700":
                                            properties.point_count <= 5,
                                        "w-[50px] h-[50px] bg-orange-400 border-orange-700":
                                            properties.point_count >= 5,
                                        "w-[60px] h-[60px] bg-red-400 border-red-700":
                                            properties.point_count >= 10,
                                    },
                                )}
                            >
                                {cluster?.properties?.point_count_abbreviated}
                            </div>
                        </Marker>
                    );
                }

                const { properties } = cluster;
                const propertyResult = properties.property;
                const score = mode === "transit" ? properties.score : 0;

                return (
                    <Marker
                        key={propertyResult.id}
                        latitude={propertyResult.coordinates.latitude}
                        longitude={propertyResult.coordinates.longitude}
                    >
                        <Tooltip>
                            <TooltipTrigger>
                                <PropertyPin
                                    score={score}
                                    property={propertyResult}
                                    isSelected={
                                        propertyResult.id ===
                                        selectedProperty?.property.id
                                    }
                                    onClick={() =>
                                        onClickPropertyPin(properties)
                                    }
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                {propertyResult.name}
                            </TooltipContent>
                        </Tooltip>
                    </Marker>
                );
            }),
        [properties, clusters],
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
        [transitableStops],
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
                    setSelectedStop={setSelectedStop}
                    propertiesNearStop={selectedStop?.propertiesNearStop}
                />
            )}
            <TooltipProvider>
                <MapboxMap
                    ref={mapRef}
                    onZoom={(newViewport) => {
                        setViewport({
                            ...newViewport.viewState,
                            width: "100vw",
                            height: "100vh",
                        });
                    }}
                    reuseMaps
                    initialViewState={{
                        longitude: 101.7133662,
                        latitude: 3.1592469,
                        zoom: 15.5,
                        bearing: 30,
                        pitch: 40,
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={process.env.MapboxAccessToken}
                    minZoom={12}
                    maxZoom={17}
                    interactiveLayerIds={[clusterLayer.id as string]}
                >
                    {isDesktop && <NavigationControl position="bottom-left" />}
                    <Source name="iso" id="iso" type="geojson" data={isochrone}>
                        <Layer
                            type="fill"
                            source="iso"
                            paint={{
                                "fill-color": "#fca5a5",
                                "fill-opacity": 0.2,
                                "fill-outline-color": "#fca5a5",
                            }}
                        />
                        <Layer
                            type="line"
                            source="iso"
                            paint={{
                                "line-width": 3,
                                "line-color": "#b91c1c",
                            }}
                        />
                    </Source>
                    {mode === "transit" && (
                        <Source
                            name="stop_iso"
                            id="stop_iso"
                            type="geojson"
                            data={stopIsochrone}
                        >
                            <Layer
                                type="fill"
                                source="stop_iso"
                                paint={{
                                    "fill-color": getRouteColor(
                                        selectedStop?.stop?.stop_id[0] || "",
                                    ),
                                    "fill-opacity": 0.2,
                                    "fill-outline-color": getRouteColor(
                                        selectedStop?.stop?.stop_id[0] || "",
                                    ),
                                }}
                            />
                            <Layer
                                type="line"
                                source="stop_iso"
                                paint={{
                                    "line-width": 3,
                                    "line-color": getRouteColor(
                                        selectedStop?.stop?.stop_id[0] || "",
                                    ),
                                }}
                            />
                        </Source>
                    )}
                    <Layer
                        id="3d-buildings"
                        type="fill-extrusion"
                        source="composite"
                        source-layer="building"
                        filter={["==", "extrude", "true"]}
                        minzoom={14}
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
