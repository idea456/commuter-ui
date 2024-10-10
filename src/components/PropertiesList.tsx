import { Property } from "@/types";
import { ScrollArea } from "./ui/scroll-area";
import { useRootStore } from "@/hooks/stores";
import PropertyCard from "./PropertyCard";

type PropertiesListProps = {
    onClickProperty: (clickedProperty: Property) => void;
    properties: Property[];
};
const PropertiesList = ({
    onClickProperty,
    properties,
}: PropertiesListProps) => {
    const selectedProperty = useRootStore((state) => state.selectedProperty);
    return (
        <ScrollArea className="h-[60vh] no-scrollbar mt-4">
            {properties.map((item) => (
                <PropertyCard
                    className={
                        selectedProperty?.id === item.id
                            ? "border-black border-2"
                            : ""
                    }
                    onClick={onClickProperty}
                    property={item}
                />
            ))}
        </ScrollArea>
    );
};

export default PropertiesList;
