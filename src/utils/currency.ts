export const toRinggit = (rawCurrency: number) => {
    return new Intl.NumberFormat("my-MY", {
        style: "currency",
        currency: "MYR",
        currencyDisplay: "narrowSymbol",
        trailingZeroDisplay: "stripIfInteger",
    }).format(rawCurrency);
};
