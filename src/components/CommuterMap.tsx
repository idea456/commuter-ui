import { Coordinate, Itineary, Property } from "@/types";
import Map, { Layer, Marker, Popup, Source } from "react-map-gl";
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
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "./ui/card";
import { Heart } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Timeline } from "./Timeline";

type CommuterMapProps = {
    origin?: Coordinate;
    properties?: Property[];
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
};

const DirectionsGeometry = ({ direction }: { direction: Itineary }) => {
    return direction.legs.map((leg, i) => {
        const geojson = polyline.toGeoJSON(leg.legGeometry.points);
        console.log("geometry", geojson);
        return (
            <Source type="geojson" data={geojson}>
                <Marker
                    latitude={
                        geojson?.coordinates[geojson?.coordinates.length - 1][1]
                    }
                    longitude={
                        geojson?.coordinates[geojson?.coordinates.length - 1][0]
                    }
                    offset={[0, -20]}
                >
                    <OriginPin />
                </Marker>
                <Layer
                    type="line"
                    paint={{
                        "line-width": 10,
                        "line-color":
                            leg.mode === "WALK"
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

const PropertyPin = ({ isSelected, property, onClick }: PropertyPinProps) => {
    if (isSelected) {
        return (
            <div
                className="bg-yellow-400 p-2 rounded-3xl font-semibold border-black border-2 text-ellipsis overflow-hidden"
                onClick={onClick}
            >
                {/* RM 3,000 ~ RM 5,000 */}
                {property.name}
            </div>
        );
    }
    return (
        <div
            className="bg-white p-2 hover:bg-yellow-400 rounded-3xl font-semibold border-black border-2 opacity-70 hover:opacity-100"
            onClick={onClick}
        >
            {property.name}
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
                    property.coordinates.longitude,
                    property.coordinates.latitude,
                ]);
            }

            mapRef.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 20,
            });
        }
    }, [origin, properties]);

    const directionsGeometry = useMemo(() => {
        console.log("directions", directions);
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
            // let zoomFactor = 15;
            // const isInView = mapRef.current.getBounds()?.contains(origin)

            mapRef.current.fitBounds(bounds, {
                bearing: 40,
                pitch: 40,
                maxZoom: 17,
                zoom: 15,
            });
        }
    }, [origin, selectedProperty, directionsGeometry]);

    return (
        <div
            className="w-full py-4 pr-4 pl-0 relative"
            style={{
                height: "calc(100vh - 5px)",
            }}
        >
            {selectedProperty && (
                <Card className="max-w-[350px] min-w-[350px] absolute z-10 top-8 right-8 border-none">
                    <CardHeader className="relative">
                        <Heart
                            className="absolute top-8 right-8 cursor-pointer"
                            size={22}
                        />
                        <CardTitle>{selectedProperty.name}</CardTitle>
                        <CardDescription>
                            {selectedProperty.address}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-3 flex-col">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button className="w-full" variant="default">
                                    Search listings at...
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[300px]">
                                <DropdownMenuItem
                                    className="w-full"
                                    onClick={() =>
                                        window.open(
                                            `https://www.propertyguru.com.my/property-for-rent?market=residential&maxprice=1700&freetext=${selectedProperty.name.replace(
                                                " ",
                                                "+"
                                            )}`
                                        )
                                    }
                                >
                                    PropertyGuru
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        window.open(
                                            `https://www.iproperty.com.my/rent/kuala-lumpur/all-residential/?place=Kuala+Lumpur&maxPrice=${2300}&q=${
                                                selectedProperty.name.split(
                                                    " "
                                                )[0]
                                            }`
                                        )
                                    }
                                >
                                    iProperty
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        window.open(
                                            `https://speedhome.com/rent/${selectedProperty.name
                                                .split(" ")
                                                .map((name) =>
                                                    name.toLowerCase()
                                                )
                                                .join(
                                                    "-"
                                                )}?q=${selectedProperty.name.replace(
                                                " ",
                                                "+"
                                            )}&min=${0}&max=${2300}`
                                        )
                                    }
                                >
                                    SpeedHome
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Separator />
                        {directions?.length && (
                            <Timeline directions={directions[0]} />
                        )}
                    </CardContent>
                </Card>
            )}
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
                    {/* <Layer
                        id="3d-buildings"
                        source="composite"
                        source-layer="building"
                        // layerOptions={{
                        //     "source-layer": "building",
                        //     filter: ["==", "extrude", "true"],
                        //     type: "fill-extrusion",
                        //     minzoom: 15,
                        // }}
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
                    /> */}
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
                            key={property.id}
                            latitude={property.coordinates.latitude}
                            longitude={property.coordinates.longitude}
                        >
                            <Tooltip>
                                <TooltipTrigger>
                                    <PropertyPin
                                        property={property}
                                        isSelected={
                                            property.id === selectedProperty?.id
                                        }
                                        onClick={() =>
                                            onClickPropertyPin(property)
                                        }
                                    />
                                </TooltipTrigger>
                                <TooltipContent>{property.name}</TooltipContent>
                            </Tooltip>
                        </Marker>
                    ))}
                    {directions?.length && (
                        <DirectionsGeometry direction={directions[0]} />
                    )}
                </Map>
            </TooltipProvider>
        </div>
    );
};

export default CommuterMap;
