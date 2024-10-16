import { Itineary } from "@/types";
import { Badge } from "./ui/badge";

type TimelineProps = {
    directions: Itineary;
};

function fromOriginLabel(toStation: string) {
    return `From `;
}

export const Timeline = ({ directions }: TimelineProps) => {
    return (
        <div className="w-full">
            <div>
                {directions.legs.map((leg, i) => (
                    <div className="border-neutral-200 flex gap-3 p-2 hover:bg-neutral-100 rounded-lg cursor-pointer">
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
                                            {Math.round(leg.duration / 60)}{" "}
                                            minutes
                                        </Badge>
                                    </div>
                                    <p>
                                        Walk for about for{" "}
                                        {leg.distance >= 1000
                                            ? (leg.distance / 1000).toFixed(2)
                                            : Math.floor(leg.distance)}{" "}
                                        {leg.distance < 1000 ? "metres" : "km"}{" "}
                                        to {leg.to.name}
                                    </p>
                                </div>
                            )}
                            {(leg.mode === "SUBWAY" || leg.mode === "TRAM") && (
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between">
                                        <span className="font-bold">
                                            {leg.mode}
                                        </span>
                                        <Badge variant="outline">
                                            {Math.round(leg.duration / 60)}{" "}
                                            minutes
                                        </Badge>
                                    </div>
                                    <p>
                                        From <b>{leg.from.name} station</b>,
                                        take the {leg.route.longName} to{" "}
                                        {leg.to.name} station
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
        </div>
    );
};
