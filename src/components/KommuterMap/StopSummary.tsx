import {
    Building2,
    Clock,
    Footprints,
    Hotel,
    House,
    RailSymbol,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useRootStore } from "@/stores";
import { NearestProperty, Stop } from "@/types";
import { useDevice } from "@/hooks/useDevice";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { toDistanceUnits, toTimeUnits } from "@/utils/units";
import { Badge } from "../ui/badge";

type StopSummaryprops = {
    stop?: Stop;
    propertiesNearStop?: NearestProperty[];
    setSelectedStop: (selectedStop: Stop | null) => void;
};

const propertyIcon: Record<string, JSX.Element> = {
    Condominium: <Building2 size={15} />,
    Apartment: <Building2 size={15} />,
    "Service Residence": <Hotel size={15} />,
    "Terraced House": <House size={15} />,
    Multiple: <House size={15} />,
};

type NearestPropertyCardProps = {
    nearestProperty: NearestProperty;
    setSelectedStop: (selectedStop: Stop | null) => void;
};

const NearestPropertyCard = ({
    nearestProperty,
    setSelectedStop,
}: NearestPropertyCardProps) => {
    const { property } = nearestProperty;

    const propertyType = property.type.split("\n")[0];
    const setDestination = useRootStore((state) => state.setDestination);
    const setSelectedProperty = useRootStore(
        (state) => state.setSelectedProperty,
    );

    const onClickProperty = () => {
        setDestination(nearestProperty.property.coordinates);
        setSelectedProperty(nearestProperty);
        setSelectedStop(null);
    };

    const walkTimeLabel = toTimeUnits(nearestProperty.walkTimeNearestStop);
    return (
        <div
            className={cn(
                "relative border rounded-lg mb-2 p-4 hover:bg-neutral-100 cursor-pointer flex flex-col",
            )}
            onClick={onClickProperty}
        >
            <div className="flex flex-col">
                <h2 className="text-md font-semibold">{property.name}</h2>
                <div className="text-neutral-500 flex text-sm items-center">
                    <h3 className="text-neutral-500 font-light flex gap-1 items-center">
                        {property.address}
                    </h3>
                </div>
                <div className="flex gap-1 items-center">
                    <Badge variant="outline" className="gap-2 my-2">
                        {propertyIcon[propertyType]}
                        {propertyType}
                    </Badge>
                </div>
            </div>
            <div className="grid grid-flow-row grid-cols-2 mt-3 gap-3">
                <div className="flex items-center space-x-2">
                    <Footprints className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">
                        {toDistanceUnits(
                            nearestProperty.walkDistanceNearestStop,
                        )}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{walkTimeLabel}</span>
                </div>
            </div>
        </div>
    );
};

export const StopSummary = ({
    stop,
    propertiesNearStop,
    setSelectedStop,
}: StopSummaryprops) => {
    const { isMobile, isDesktop } = useDevice();
    if (!stop) return;

    return (
        <Card
            className={cn("absolute z-10 border-none", {
                "lg:max-w-[380px] max-h-[92vh] top-6 right-6 w-1/4": isDesktop,
                "min-w-full max-h-[45vh] bottom-0 left-0 rounded-lg": isMobile,
            })}
        >
            <CardHeader className="relative">
                <div className="flex flex-row justify-between items-start">
                    <CardTitle className="text-lg">
                        {stop.name} station
                    </CardTitle>
                    <Badge variant="outline" className="pt-1">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Rapid_KL_Logo.svg/320px-Rapid_KL_Logo.svg.png"
                            className="w-[60px] h-fit"
                        />
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex gap-3 flex-col">
                <Label className="text-lg">
                    {propertiesNearStop?.length} properties near this station
                </Label>
                <div
                    className={cn("w-full overflow-scroll flex flex-col", {
                        "max-h-[67vh]": isDesktop,
                        "max-h-[27vh]": isMobile,
                    })}
                >
                    {propertiesNearStop?.map((propertyNearStop) => (
                        <NearestPropertyCard
                            nearestProperty={propertyNearStop}
                            setSelectedStop={setSelectedStop}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
