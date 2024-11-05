import { Separator } from "../ui/separator";
import { Timeline } from "./Timeline";
import { Button } from "../ui/button";
import {
    Building2,
    Clock,
    Footprints,
    Hotel,
    House,
    RailSymbol,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "../ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRootStore } from "@/stores";
import { Itineary } from "@/types";
import { useDevice } from "@/hooks/useDevice";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { toDistanceUnits, toTimeUnits } from "@/utils/units";
import { Badge } from "../ui/badge";

type ItinearyProps = {
    directions: Itineary[] | null;
    setHoveredDirectionIndex: React.Dispatch<
        React.SetStateAction<number | null>
    >;
    setSelectedDirection: React.Dispatch<React.SetStateAction<number | null>>;
    isLoading?: boolean;
};

const propertyIcon: Record<string, JSX.Element> = {
    Condominium: <Building2 size={15} />,
    Apartment: <Building2 size={15} />,
    "Service Residence": <Hotel size={15} />,
    "Terraced House": <House size={15} />,
    Multiple: <House size={15} />,
};

export const Summary = ({
    directions,
    setHoveredDirectionIndex,
    setSelectedDirection,
    isLoading,
}: ItinearyProps) => {
    const selectedProperty = useRootStore((state) => state.selectedProperty);
    const { isMobile, isDesktop } = useDevice();

    if (isLoading) {
        return (
            <Card
                className={cn("absolute z-10 border-none", {
                    "lg:min-w-[380px] top-6 right-6": isDesktop,
                    "min-w-full bottom-0 left-0 rounded-lg": isMobile,
                })}
            >
                <CardHeader>
                    <div className="w-full flex flex-col gap-2">
                        <CardTitle>
                            <Skeleton className="h-6 w-3/5" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-6 w-4/5" />
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex gap-3 flex-col">
                    <div className="grid grid-cols-3 gap-3 w-full">
                        <Skeleton className="h-6" />
                        <Skeleton className="h-6" />
                        <Skeleton className="h-6" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!selectedProperty || !directions) return null;
    const { property } = selectedProperty;

    return (
        <Card
            className={cn("absolute z-10 border-none", {
                "lg:max-w-[380px] max-h-[92vh] top-6 right-6": isDesktop,
                "min-w-full max-h-[45vh] bottom-0 left-0 rounded-lg": isMobile,
            })}
        >
            <CardHeader className="relative flex flex-row justify-between items-start pb-4">
                <div>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription>{property.address}</CardDescription>
                    <Badge variant="outline" className="gap-2 px-3 mt-3">
                        {propertyIcon[property.type]} {property.type}
                    </Badge>
                </div>
                {isMobile && (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button className="w-fit" variant="outline">
                                <SearchIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="min-w-[300px]"
                            align="end"
                        >
                            <DropdownMenuItem
                                className="w-full"
                                onClick={() =>
                                    window.open(
                                        `https://www.propertyguru.com.my/property-for-rent?market=residential&maxprice=1700&freetext=${property.name.replace(
                                            " ",
                                            "+",
                                        )}`,
                                    )
                                }
                            >
                                PropertyGuru
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    window.open(
                                        `https://www.iproperty.com.my/rent/kuala-lumpur/all-residential/?place=Kuala+Lumpur&maxPrice=${2300}&q=${
                                            property.name.split(" ")[0]
                                        }`,
                                    )
                                }
                            >
                                iProperty
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    window.open(
                                        `https://speedhome.com/rent/${property.name
                                            .split(" ")
                                            .map((name) => name.toLowerCase())
                                            .join(
                                                "-",
                                            )}?q=${property.name.replace(
                                            " ",
                                            "+",
                                        )}&min=${0}&max=${2300}`,
                                    )
                                }
                            >
                                SpeedHome
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardContent className="flex gap-3 flex-col">
                <div className="flex items-center gap-3 mb-4 w-full">
                    <div className="flex items-center space-x-2">
                        <Footprints className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">
                            {toDistanceUnits(directions[0].walkDistance)}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">
                            {toTimeUnits(directions?.[0].duration)}
                        </span>
                    </div>
                    {directions[0].transfers && (
                        <div className="flex items-center space-x-2">
                            <RailSymbol className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">
                                {directions[0].transfers} transfers
                            </span>
                        </div>
                    )}
                </div>
                {isDesktop && (
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
                                        `https://www.propertyguru.com.my/property-for-rent?market=residential&maxprice=1700&freetext=${property.name.replace(
                                            " ",
                                            "+",
                                        )}`,
                                    )
                                }
                            >
                                PropertyGuru
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    window.open(
                                        `https://www.iproperty.com.my/rent/kuala-lumpur/all-residential/?place=Kuala+Lumpur&maxPrice=${2300}&q=${
                                            property.name.split(" ")[0]
                                        }`,
                                    )
                                }
                            >
                                iProperty
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    window.open(
                                        `https://speedhome.com/rent/${property.name
                                            .split(" ")
                                            .map((name) => name.toLowerCase())
                                            .join(
                                                "-",
                                            )}?q=${property.name.replace(
                                            " ",
                                            "+",
                                        )}&min=${0}&max=${2300}`,
                                    )
                                }
                            >
                                SpeedHome
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {directions?.length && (
                    <>
                        <Separator />
                        <Timeline
                            directions={directions[0]}
                            setHoveredDirectionIndex={setHoveredDirectionIndex}
                            setSelectedDirection={setSelectedDirection}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
};
