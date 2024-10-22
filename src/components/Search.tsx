import { useDevice } from "@/hooks/useDevice";
import SearchForm from "./SearchForm";

type FormContainerProps = {
    onSubmit: () => void;
};

const FormContainer = ({ onSubmit }: FormContainerProps) => {
    const { isMobile } = useDevice();

    if (isMobile) {
        return (
            <div className="absolute top-4 left-4 right-4 pt-1 px-1 bg-white h-fit z-50 rounded-full border-none">
                <SearchForm onSubmit={onSubmit} />
            </div>
        );
    }
    return (
        <div className="sm:w-full sm:max-w-full sm:m-w-full p-5 gap-2 flex flex-col absolute sm:top-0 sm:left-0 md:top-6 md:left-6 bg-white h-fit z-50 rounded-lg md:max-w-[400px] md:min-w-[30%] border-none">
            <h1
                className="font-bold italic text-lg"
                style={{
                    fontFamily: "Chillax",
                }}
            >
                KOMMUTER
            </h1>
            <SearchForm onSubmit={onSubmit} />
        </div>
    );
};

export default FormContainer;
