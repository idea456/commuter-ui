import { Separator } from "@radix-ui/react-separator";
import { Timeline } from "./Timeline";
import { Button } from "./ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "./ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRootStore } from "@/hooks/stores";
import { Itineary } from "@/types";
import { useDevice } from "@/hooks/useDevice";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";

type ItinearyProps = {
    directions?: Itineary[];
    setHoveredDirectionIndex: React.Dispatch<
        React.SetStateAction<number | null>
    >;
    setSelectedDirection: React.Dispatch<React.SetStateAction<number | null>>;
};

export const Summary = ({
    directions,
    setHoveredDirectionIndex,
    setSelectedDirection,
}: ItinearyProps) => {
    const selectedProperty = useRootStore((state) => state.selectedProperty);
    const { isMobile, isDesktop } = useDevice();

    if (!selectedProperty) return null;

    return (
        <Card
            className={cn("absolute z-10 border-none", {
                "max-w-[350px] max-h-[92vh] top-6 right-6": isDesktop,
                "min-w-full max-h-[45vh] bottom-0 left-0 rounded-lg": isMobile,
            })}
        >
            <CardHeader className="relative flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="text-lg">
                        {selectedProperty.name}
                    </CardTitle>
                    <CardDescription>
                        {selectedProperty.address}
                    </CardDescription>
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
                                            selectedProperty.name.split(" ")[0]
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
                                            .map((name) => name.toLowerCase())
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
                )}
            </CardHeader>
            <CardContent className="flex gap-3 flex-col">
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
                                            selectedProperty.name.split(" ")[0]
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
                                            .map((name) => name.toLowerCase())
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
                )}

                <Separator />
                {directions?.length && (
                    <Timeline
                        directions={directions[0]}
                        setHoveredDirectionIndex={setHoveredDirectionIndex}
                        setSelectedDirection={setSelectedDirection}
                    />
                )}
            </CardContent>
        </Card>
    );
};
