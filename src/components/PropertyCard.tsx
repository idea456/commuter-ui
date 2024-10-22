import { Property } from "@/types";
import { cn } from "@/lib/utils";
import { Dot, Star } from "lucide-react";

type PropertyCardProps = {
    onClick: (clickedProperty: Property) => void;
    property: Property;
    className?: string;
};

const PropertyCard = ({ onClick, property, className }: PropertyCardProps) => {
    return (
        <div
            onClick={() => onClick(property)}
            className={cn(
                "relative border rounded-lg mb-2 p-4 hover:bg-neutral-100 cursor-pointer gap-2 flex flex-col",
                className
            )}
        >
            <div>
                <h2 className="text-lg font-semibold">{property.name}</h2>
                <div className="text-neutral-500 flex text-sm items-center">
                    <div className="flex gap-1 items-center font-light">
                        <p className="text-black">{4.4}</p>
                        <Star fill="black" size={15} />
                        (69 ratings)
                    </div>
                    <Dot size={20} />
                    <h3 className="text-neutral-500 font-light">
                        {property.type.split("\n")[0]}
                    </h3>
                </div>
            </div>
            <div
                className="grid grid-flow-row grid-cols-2 mt-5"
                style={
                    {
                        // columnGap: "1%",
                    }
                }
            >
                {/* <div className="flex flex-col gap-2">
                    <h3 className="text-sm text-muted-foreground">
                        Rental range
                    </h3>
                    <h3 className="text-xl font-medium">
                        {toRinggit(property.rentalRange.fromPrice)} ~{" "}
                        {toRinggit(property.rentalRange.toPrice)}
                    </h3>
                </div> */}

                <div className="flex flex-col gap-2">
                    <h3 className="text-sm text-muted-foreground">
                        Commute distance
                    </h3>
                    <h3 className="text-xl font-medium">1.4 kilometres</h3>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="text-sm text-muted-foreground">
                        Commute time
                    </h3>
                    <h3 className="text-xl font-medium">20 minutes ~ 1 hour</h3>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
