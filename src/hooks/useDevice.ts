import { useMediaQuery } from "@uidotdev/usehooks";

export const useDevice = () => {
    const isMobile = useMediaQuery("only screen and (max-width : 750px)");
    const isDesktop = useMediaQuery("only screen and (min-width: 750px)");

    return {
        isMobile,
        isDesktop,
    };
};
