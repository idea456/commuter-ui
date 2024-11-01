import { Itineary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useDevice } from "@/hooks/useDevice";
import { cn } from "@/lib/utils";

type TimelineProps = {
    directions: Itineary;
    setHoveredDirectionIndex: (i: number) => void;
    setSelectedDirection: (i: number) => void;
};

export const Timeline = ({
    directions,
    setHoveredDirectionIndex,
    setSelectedDirection,
}: TimelineProps) => {
    const { isMobile, isDesktop } = useDevice();
    return (
        <div
            className={cn("w-full overflow-scroll flex flex-col", {
                "max-h-[67vh]": isDesktop,
                "max-h-[27vh]": isMobile,
            })}
        >
            {directions.legs.map((leg, i) => (
                <div
                    key={leg.from.name}
                    className="border-neutral-200 flex gap-3 p-2 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    onMouseEnter={() => setHoveredDirectionIndex(i)}
                    onMouseLeave={() => setHoveredDirectionIndex(-1)}
                    onClick={() => setSelectedDirection(i)}
                >
                    <div className="flex flex-col items-center">
                        {leg.mode === "WALK" && (
                            <span className="text-lg">🚶‍♂️</span>
                        )}
                        {leg.mode === "TRAM" && (
                            <span className="text-lg">🚃</span>
                        )}
                        {leg.mode === "SUBWAY" && (
                            <span className="text-lg">🚇</span>
                        )}
                        {leg.mode === "BUS" && (
                            <span className="text-lg">🚌</span>
                        )}
                        {i < directions.legs.length - 1 && (
                            <div className="border h-full w-[1px] mt-2 border-neutral-200 rounded-lg" />
                        )}
                    </div>
                    <div>
                        {leg.mode === "WALK" && (
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span className="font-bold">
                                        {leg.mode}
                                    </span>
                                    <Badge variant="outline">
                                        {Math.round(leg.duration / 60)} minutes
                                    </Badge>
                                </div>
                                <p>
                                    Walk for about for{" "}
                                    {leg.distance >= 1000
                                        ? (leg.distance / 1000).toFixed(2)
                                        : Math.floor(leg.distance)}{" "}
                                    {leg.distance < 1000 ? "metres" : "km"} to{" "}
                                    {leg.to.name}
                                </p>
                            </div>
                        )}
                        {(leg.mode === "SUBWAY" || leg.mode === "TRAM") && (
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Rapid_KL_Logo.svg/320px-Rapid_KL_Logo.svg.png"
                                        className="w-[60px] h-fit"
                                    />
                                    <Badge variant="outline">
                                        {Math.round(leg.duration / 60)} minutes
                                    </Badge>
                                </div>
                                <p>
                                    From {leg.from.name} station, take the{" "}
                                    <b
                                        style={{
                                            color: `#${leg.route.color}`,
                                            fontStyle: "bold",
                                        }}
                                    >
                                        {leg.route.longName}
                                    </b>{" "}
                                    to {leg.to.name} station
                                </p>
                            </div>
                        )}
                        {leg.mode === "BUS" && (
                            <p>
                                From {leg.from.name} stop, take the{" "}
                                {leg.route.longName}
                                to {leg.to.name} stop
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
