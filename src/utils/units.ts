export const toDistanceUnits = (value: number) => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)} km`;
    }
    return `${value.toFixed(2)} metres`;
};

export const toTimeUnits = (value: number) => {
    if (value >= 60) {
        const minutes = +(value / 60).toFixed(1);
        return minutes < 2 ? `${minutes} minute` : `${minutes} minutes`;
    }
};
