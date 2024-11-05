export const getRouteColor = (stopId: string) => {
    if (stopId.startsWith("AG")) {
        return "#e57200";
    } else if (stopId.startsWith("PY")) {
        return "#FFCD00";
    } else if (stopId.startsWith("KJ")) {
        return "#76232f";
    } else if (stopId.startsWith("PH")) {
        return "#76232f";
    } else if (stopId.startsWith("KG")) {
        return "#047940";
    } else if (stopId.startsWith("MR")) {
        return "#84bd00";
    } else if (stopId.startsWith("BRT")) {
        return "#84bd00";
    } else if (stopId.startsWith("SP")) {
        return "#7e1b14";
    } else {
        return "#fca5a5";
    }
};
