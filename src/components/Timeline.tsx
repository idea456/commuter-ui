import { Bus, ChevronDown, Footprints, Route, Train } from "lucide-react";
import { Itineary } from "@/types";

type TimelineProps = {
    directions: Itineary;
};

function fromOriginLabel(toStation: string) {
    return `From `;
}

export const Timeline = ({ directions }: TimelineProps) => {
    return (
        <div className="w-full">
            <div className="flex justify-between hover:underline underline-offset-2 cursor-pointer">
                <div className="flex items-center gap-2 pb-4">
                    <Route size={20} />
                    <h3 className="text-md font-medium">Fastest route</h3>
                </div>
                <ChevronDown size={20} />
            </div>

            <div>
                {directions.legs.map((leg) => (
                    <div className="border-neutral-200 flex gap-3 ml-2 pl-5 py-2">
                        {leg.mode === "WALK" && (
                            <Footprints
                                size={20}
                                className="flex-shrink-0 mt-[0.3rem]"
                            />
                        )}
                        {leg.mode === "SUBWAY" && (
                            <Train
                                size={20}
                                className="flex-shrink-0 mt-[0.3rem]"
                            />
                        )}
                        {leg.mode === "BUS" && (
                            <Bus
                                size={20}
                                className="flex-shrink-0 mt-[0.3rem]"
                            />
                        )}
                        <div>
                            {leg.mode === "WALK" && (
                                <p>
                                    Walk for about{" "}
                                    {Math.round(leg.duration / 60)} minutes in{" "}
                                    {(leg.distance / 1000).toFixed(2)} km to{" "}
                                    {leg.to.name}
                                </p>
                            )}
                            {leg.mode === "SUBWAY" && (
                                <p>
                                    From {leg.from.name} station, take the{" "}
                                    {leg.route.longName} to {leg.to.name}{" "}
                                    station
                                </p>
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
