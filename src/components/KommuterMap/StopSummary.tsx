import { Building2, Hotel, House } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useRootStore } from "@/stores";
import { NearestProperty, Stop } from "@/types";
import { useDevice } from "@/hooks/useDevice";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

type StopSummaryprops = {
    stop?: Stop;
    propertiesNearStop?: NearestProperty[];
};

const propertyIcon: Record<string, JSX.Element> = {
    Condominium: <Building2 size={15} />,
    Apartment: <Building2 size={15} />,
    "Service Residence": <Hotel size={15} />,
    "Terraced House": <House size={15} />,
    Multiple: <House size={15} />,
};

const NearestPropertyCard = ({
    nearestProperty,
}: {
    nearestProperty: NearestProperty;
}) => {
    const { property } = nearestProperty;

    const propertyType = property.type.split("\n")[0];
    const setDestination = useRootStore((state) => state.setDestination);
    const setSelectedProperty = useRootStore(
        (state) => state.setSelectedProperty
    );

    const onClickProperty = () => {
        setDestination(nearestProperty.property.coordinates);
        setSelectedProperty(nearestProperty);
    };

    const walkTimeLabel =
        nearestProperty.walkTimeNearestStop > 60
            ? `${(nearestProperty.walkTimeNearestStop / 60).toFixed(1)} minutes`
            : `${nearestProperty.walkTimeNearestStop} seconds`;

    return (
        <div
            className={cn(
                "relative border rounded-lg mb-2 p-4 hover:bg-neutral-100 cursor-pointer flex flex-col"
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
                    <div>
                        <h3 className="text-black text-sm flex gap-1 items-center mt-3">
                            {propertyIcon[propertyType]}
                            {propertyType}
                        </h3>
                    </div>
                </div>
            </div>
            <div className="grid grid-flow-row grid-cols-2 mt-3 gap-3">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm text-muted-foreground">Distance</h3>

                    <h3 className="text-sm font-medium">
                        {nearestProperty.walkDistanceNearestStop} metres
                    </h3>
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="text-sm text-muted-foreground">Time</h3>
                    <h3 className="text-sm font-medium">{walkTimeLabel}</h3>
                </div>
            </div>
        </div>
    );
};

export const StopSummary = ({ stop, propertiesNearStop }: StopSummaryprops) => {
    const { isMobile, isDesktop } = useDevice();
    if (!stop) return;

    return (
        <Card
            className={cn("absolute z-10 border-none", {
                "lg:max-w-[380px] max-h-[92vh] top-6 right-6 w-1/4": isDesktop,
                "min-w-full max-h-[45vh] bottom-0 left-0 rounded-lg": isMobile,
            })}
        >
            <CardHeader className="relative flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{stop.name}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex gap-3 flex-col">
                <Label className="text-md">Nearest properties</Label>
                <div
                    className={cn("w-full overflow-scroll flex flex-col", {
                        "max-h-[67vh]": isDesktop,
                        "max-h-[27vh]": isMobile,
                    })}
                >
                    {propertiesNearStop?.map((propertyNearStop) => (
                        <NearestPropertyCard
                            nearestProperty={propertyNearStop}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
