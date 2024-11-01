import CommuterMap from "./components/KommuterMap/KommuterMap";
import Search from "./components/Search/Search";

function App() {
    return (
        <div className="relative w-screen h-screen">
            <Search />
            <CommuterMap />
        </div>
    );
}

export default App;
