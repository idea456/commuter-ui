import { useState } from "react";
import { Coordinate, Itineary, NearestProperty, Property } from "@/types";
import Map, { Layer, Marker, Source } from "react-map-gl";
import {
    TooltipProvider,
    TooltipTrigger,
    Tooltip,
    TooltipContent,
} from "./ui/tooltip";
import { useEffect, useMemo, useRef } from "react";
import polyline from "@mapbox/polyline";
import mapboxgl from "mapbox-gl";
import { useRootStore } from "@/hooks/stores";
import { cn } from "@/lib/utils";
import { Summary } from "./Summary";

type CommuterMapProps = {
    origin: Coordinate | null;
    properties?: NearestProperty[];
    directions?: Itineary[];
};

const OriginPin = () => {
    return (
        <svg
            width="31"
            height="40"
            viewBox="0 0 31 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.2727 0C23.7076 0 30.5455 6.83783 30.5455 15.2727C30.5455 16.3023 30.4436 17.3081 30.2493 18.2806C28.9014 28.4387 15.353 40 15.353 40C15.353 40 3.8232 30.1612 0.977862 20.6615C0.345823 18.9858 0 17.1696 0 15.2727C0 6.83783 6.83783 0 15.2727 0Z"
                fill="#196CEA"
            />
            <path
                d="M21.0909 15.2727C21.0909 12.0594 18.486 9.45454 15.2727 9.45454C12.0594 9.45454 9.45454 12.0594 9.45454 15.2727C9.45454 18.486 12.0594 21.0909 15.2727 21.0909C18.486 21.0909 21.0909 18.486 21.0909 15.2727Z"
                fill="white"
            />
        </svg>
    );
};

type PropertyPinProps = {
    isSelected?: boolean;
    property: Property;
    score: number;
    onClick: () => void;
};

const DirectionsGeometry = ({
    direction,
    hoveredDirectionIndex,
}: {
    direction: Itineary;
    hoveredDirectionIndex: number;
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
        >
            {/* {property.name} */}
        </div>
    );
};

const CommuterMap = ({ properties, directions }: CommuterMapProps) => {
    const mapRef = useRef<mapboxgl.Map>();
    const selectedProperty = useRootStore((state) => state.selectedProperty);
    const setSelectedProperty = useRootStore(
        (state) => state.setSelectedProperty
    );
    const origin = useRootStore((state) => state.origin);
    const setDestination = useRootStore((state) => state.setDestination);

    const onClickPropertyPin = (clickedProperty: Property) => {
        setDestination(clickedProperty.coordinates);
        setSelectedProperty(clickedProperty);
    };

    console.log(directions);

    const [hoveredDirectionIndex, setHoveredDirectionIndex] = useState<
        number | null
    >(null);
    const [selectedDirection, setSelectedDirection] = useState<number | null>(
        null
    );

    useEffect(() => {
        if (
            origin?.latitude &&
            origin?.longitude &&
            properties?.length &&
            mapRef.current
        ) {
            const bounds = new mapboxgl.LngLatBounds(
                [origin.longitude, origin.latitude],
                [origin.longitude, origin.latitude]
            );

            for (const property of properties) {
                bounds.extend([
                    property.property.coordinates.longitude,
                    property.property.coordinates.latitude,
                ]);
            }

            mapRef.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 20,
            });
        }
    }, [origin, properties]);

    useEffect(() => {
        if (directions?.length && selectedDirection && mapRef?.current) {
            const geojson = polyline.toGeoJSON(
                directions[0]?.legs[selectedDirection].legGeometry.points
            );
            // @ts-expect-error coordinates already satisfies [number, number] type
            const bounds = new mapboxgl.LngLatBounds(geojson.coordinates);

            mapRef?.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 20,
                bearing: 40,
                pitch: 40,
                zoom: 15,
            });
        }
    }, [directions, selectedDirection]);

    const directionsGeometry = useMemo(() => {
        if (directions && directions.length > 0 && directions[0].legs?.length) {
            const geojson = polyline.toGeoJSON(
                directions[0].legs[0].legGeometry.points
            );

            geojson.coordinates = [
                [origin?.longitude, origin?.latitude],
                ...geojson.coordinates,
            ];
            const destination = selectedProperty?.coordinates;
            geojson.coordinates.push([
                destination?.longitude,
                destination?.latitude,
            ]);
            return geojson;
        }
    }, [directions]);

    useEffect(() => {
        if (
            selectedProperty &&
            origin &&
            directionsGeometry &&
            mapRef.current
        ) {
            const destinationCoordinates = directionsGeometry.coordinates;
            const bounds = new mapboxgl.LngLatBounds(
                [origin.longitude, origin.latitude],
                [origin.longitude, origin.latitude]
            );

            for (const coord of destinationCoordinates) {
                bounds.extend(coord);
            }

            bounds.extend([
                selectedProperty.coordinates.longitude,
                selectedProperty.coordinates.latitude,
            ]);

            mapRef.current.fitBounds(bounds, {
                bearing: 40,
                pitch: 40,
                maxZoom: 17,
                zoom: 15,
            });
        }
    }, [origin, selectedProperty, directionsGeometry]);

    return (
        <div className="w-screen h-screen relative">
            <Summary
                directions={directions}
                setHoveredDirectionIndex={setHoveredDirectionIndex}
                setSelectedDirection={setSelectedDirection}
            />
            <TooltipProvider>
                <Map
                    ref={mapRef}
                    mapboxAccessToken="pk.eyJ1IjoiaWRlYTQ1NiIsImEiOiJja2ZiYmZ4b2UwMWF2MnhxMjRwNmV2aTc0In0.FRWTXiH1jcNSTdOSrIlXLQ"
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
                        borderRadius: 12,
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    minZoom={12}
                    maxZoom={17}
                >
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
                    {properties?.map((property) => (
                        <Marker
                            offset={[0, -25]}
                            key={property.property.id}
                            latitude={property.property.coordinates.latitude}
                            longitude={property.property.coordinates.longitude}
                        >
                            <Tooltip>
                                <TooltipTrigger>
                                    <PropertyPin
                                        score={property.score}
                                        property={property.property}
                                        isSelected={
                                            property.property.id ===
                                            selectedProperty?.id
                                        }
                                        onClick={() =>
                                            onClickPropertyPin(
                                                property.property
                                            )
                                        }
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    {property.property.name}
                                </TooltipContent>
                            </Tooltip>
                        </Marker>
                    ))}
                    {directions?.length && (
                        <DirectionsGeometry
                            direction={directions[0]}
                            hoveredDirectionIndex={hoveredDirectionIndex}
                        />
                    )}
                </Map>
            </TooltipProvider>
        </div>
    );
};

export default CommuterMap;
