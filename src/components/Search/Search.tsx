import { useDevice } from "@/hooks/useDevice";
import SearchWidget from "./SearchWidget";
import { SearchDrawer } from "./SearchDrawer";

const FormContainer = () => {
    const { isMobile } = useDevice();

    if (isMobile) {
        return <SearchDrawer />;
    }
    return (
        <div className="sm:w-full sm:m-w-full p-5 gap-2 flex flex-col absolute sm:top-0 sm:left-0 md:top-6 md:left-6 bg-white h-fit z-50 rounded-xl max-w-[400px] border-none">
            <h1
                className="font-bold italic text-lg"
                style={{
                    fontFamily: "Chillax",
                }}
            >
                KOMMUTER
            </h1>
            <SearchWidget />
        </div>
    );
};

export default FormContainer;
