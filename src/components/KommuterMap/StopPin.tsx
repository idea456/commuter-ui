import { cn } from "@/lib/utils";
import { Stop, NearestProperty } from "@/types";
import { Marker } from "react-map-gl";
import { useState } from "react";

type StopPinProps = {
    stop: Stop;
    propertiesNearStop: NearestProperty[];
    onClick: (stop: Stop) => void;
    isSelected?: boolean;
    zoomLevel?: number;
};

export const StopPin = ({
    stop,
    onClick,
    isSelected,
    zoomLevel,
}: StopPinProps) => {
    const stopId = stop.stop_id[0];
    const [isHovering, setIsHovering] = useState(false);

    // if zoomLevel<=12 return <></>;
    return (
        <Marker
            key={stop?.name}
            latitude={stop.coordinates.latitude}
            longitude={stop.coordinates.longitude}
            onClick={() => onClick(stop)}
        >
            <div
                onMouseOver={() => setIsHovering(true)}
                onMouseOut={() => setIsHovering(false)}
                className={cn(
                    "rounded-lg p-1 text-white hover:border hover:border-black hover:border-2 cursor-pointer z-[-1]",
                    {
                        "bg-route-ag": stopId.startsWith("AG"),
                        "bg-route-py": stopId.startsWith("PY"),
                        "bg-route-kj": stopId.startsWith("KJ"),
                        "bg-route-ph": stopId.startsWith("PH"),
                        "bg-route-kg": stopId.startsWith("KG"),
                        "bg-route-mr": stopId.startsWith("MR"),
                        "bg-route-brt": stopId.startsWith("BRT"),
                        "bg-route-sp": stopId.startsWith("SP"),
                        "border border-black border-2": isSelected,
                    }
                )}
            >
                <h1 className="font-bold">
                    {!isHovering && !isSelected ? stopId : stop.display_name}
                </h1>
            </div>
        </Marker>
    );
};
