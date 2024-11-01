import { useDevice } from "@/hooks/useDevice";
import SearchForm from "./SearchForm";

const FormContainer = () => {
    const { isMobile } = useDevice();

    if (isMobile) {
        return (
            <div className="absolute top-4 left-4 right-4 pt-1 px-1 bg-white h-fit z-50 rounded-full">
                <SearchForm />
            </div>
        );
    }
    return (
        <div className="sm:w-full sm:m-w-full p-5 gap-2 flex flex-col absolute sm:top-0 sm:left-0 md:top-6 md:left-6 bg-white h-fit z-50 rounded-lg max-w-[400px] border-none">
            <h1
                className="font-bold italic text-lg"
                style={{
                    fontFamily: "Chillax",
                }}
            >
                KOMMUTER
            </h1>
            <SearchForm />
        </div>
    );
};

export default FormContainer;
