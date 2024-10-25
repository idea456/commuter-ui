import CommuterMap from "./components/CommuterMap";
import ResultsContainer from "./components/ResultsContainer";
import FormContainer from "./components/FormContainer";
import { Separator } from "./components/ui/separator";
import useNearestProperties from "./hooks/useNearestProperties";
import { Coordinate, Itineary, Property } from "./types";
import PropertiesList from "./components/PropertiesList";
import { useState } from "react";
import SearchForm, { SearchValues } from "./components/SearchForm";
import useDirections from "./hooks/useDirections";
import { useRootStore } from "./hooks/stores";
import { Label } from "./components/ui/label";
import { CircleDollarSign, LandPlot } from "lucide-react";
import Search from "./components/Search";

const klcc: Coordinate = {
    latitude: 3.15833674645895,
    longitude: 101.71211230655106,
};

const trx: Coordinate = {
    latitude: 3.1424231613443445,
    longitude: 101.71681201464675,
};

function App() {
    const [filter, setFilter] = useState<SearchValues>(null);
    const origin = useRootStore((state) => state.origin);

    const destination = useRootStore((state) => state.destination);

    const { properties } = useNearestProperties(origin, filter);
    const { directions } = useDirections(origin, destination);

    return (
        <div className="relative w-screen h-screen">
            <Search />

            <CommuterMap
                origin={origin}
                properties={properties}
                directions={directions}
            />
        </div>
    );
}

export default App;
