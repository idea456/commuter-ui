import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { AutoComplete, AutoCompleteItem } from "../ui/autocomplete";
import { useEffect, useState } from "react";
import useSearch from "@/hooks/useSearch";
import { useDebounce } from "@uidotdev/usehooks";
import { useRootStore } from "@/stores";
import { Slider } from "../ui/slider";
import { Spinner } from "../ui/spinner";
import useNearestProperties from "@/hooks/useNearestProperties";
import useWalkableProperties from "@/hooks/useWalkableProperties";
import { cn } from "@/lib/utils";

const coordinateSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
});

const formSchema = z.object({
    origin: coordinateSchema,
    walkDistance: z.number().optional().default(1000),
    minTransfers: z.number().optional().default(2),
    maxTransfers: z.number().optional().default(5),
    mode: z
        .union([z.literal("walking"), z.literal("transit")])
        .default("walking")
        .optional(),
});

type SearchAutocompleteProps = {
    onSelected: (value: AutoCompleteItem) => void;
    errorMessage?: string;
};

export type SearchValues = z.infer<typeof formSchema>;

const SearchAutocomplete = ({
    onSelected,
    errorMessage,
}: SearchAutocompleteProps) => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    const { items, isFetching } = useSearch(debouncedQuery);

    const options: AutoCompleteItem[] = items.map((item) => ({
        value: item.name,
        label: item.name,
        ...item,
    }));

    return (
        <AutoComplete
            options={options}
            onInputChange={setQuery}
            onValueChange={onSelected}
            isLoading={isFetching}
            value={query}
            placeholder="Where are you commuting to?"
            emptyMessage="No results found"
            errorMessage={errorMessage}
        />
    );
};

const SearchWidget = () => {
    const setOrigin = useRootStore((state) => state.setOrigin);
    const setProperties = useRootStore((state) => state.setProperties);
    const setWalkDistance = useRootStore((state) => state.setWalkDistance);
    const setMode = useRootStore((state) => state.setMode);

    const form = useForm<SearchValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mode: "walking",
            minTransfers: 2,
            maxTransfers: 3,
            walkDistance: 1000,
        },
    });
    const values = form.watch();
    const errors = form.formState.errors;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { properties, isLoading, isError } = useNearestProperties(
        isSubmitting,
        values,
    );

    const {
        properties: walkableProperties,
        isLoading: isWalkablePropertiesLoading,
    } = useWalkableProperties(values, isSubmitting);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setOrigin(values.origin);
        setIsSubmitting(true);
        setMode(values.mode);
    };

    useEffect(() => {
        if (properties?.length && values.mode === "transit") {
            setProperties(properties);
        }
        if (walkableProperties?.length && values.mode === "walking") {
            setProperties(walkableProperties);
        }
        if (isError || properties?.length) {
            setIsSubmitting(false);
        }
    }, [properties, walkableProperties, isError]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <fieldset className="w-full rounded-lg border py-4 px-5">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        Search
                    </legend>
                    <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="flex items-start flex-col">
                                        <SearchAutocomplete
                                            onSelected={({
                                                latitude,
                                                longitude,
                                            }) => {
                                                setOrigin({
                                                    latitude,
                                                    longitude,
                                                });
                                                field.onChange({
                                                    latitude,
                                                    longitude,
                                                });
                                            }}
                                            errorMessage={
                                                errors.origin?.message
                                            }
                                        />
                                        {errors.origin && (
                                            <span className="text-sm text-red-500">
                                                This field is required
                                            </span>
                                        )}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                            <div className="my-3">
                                <h1 className="mb-2">
                                    What is your preferred commuting method?
                                </h1>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        className={cn(
                                            "border border-neutral rounded-lg py-2 px-4 flex flex-col items-center justify-center hover:bg-neutral-100 cursor-pointer",
                                            {
                                                "border-2 border-black":
                                                    field.value === "walking",
                                            },
                                        )}
                                        onClick={() =>
                                            field.onChange("walking")
                                        }
                                    >
                                        <span className="text-2xl">🚶‍♂️</span>
                                        <h1>By walking</h1>
                                    </div>
                                    <div
                                        className={cn(
                                            "border border-neutral rounded-lg py-2 px-4 flex flex-col items-center justify-center hover:bg-neutral-100 cursor-pointer",
                                            {
                                                "border-2 border-black":
                                                    field.value === "transit",
                                            },
                                        )}
                                        onClick={() =>
                                            field.onChange("transit")
                                        }
                                    >
                                        <span className="text-2xl">🚇</span>
                                        <h1>By transit</h1>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-4"></div>
                            </div>
                        )}
                    />
                    {values.mode === "walking" && (
                        <FormField
                            control={form.control}
                            name="walkDistance"
                            render={({ field }) => (
                                <div className="my-4">
                                    <h1>How far do you wanna walk?</h1>
                                    <Slider
                                        defaultValue={[field.value]}
                                        min={500}
                                        max={2000}
                                        step={250}
                                        className="w-full max-w-md mt-4"
                                        onValueChange={(values) => {
                                            setWalkDistance(values[0]);
                                            field.onChange(values[0]);
                                        }}
                                    >
                                        <div className="bg-gray-300 dark:bg-gray-700">
                                            <div className="bg-primary" />
                                        </div>
                                        <div className="bg-white shadow-md dark:bg-gray-950" />
                                    </Slider>
                                    <div className="flex justify-between w-full max-w-md text-sm text-gray-500 dark:text-gray-400 mt-3">
                                        <span>500m</span>
                                        <span>750m</span>
                                        <span>1km</span>
                                        <span>1.25km</span>
                                        <span>1.5km</span>
                                        <span>1.75km</span>
                                        <span>2km</span>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                    {values.mode === "transit" && (
                        <FormField
                            control={form.control}
                            name="maxTransfers"
                            render={({ field }) => (
                                <div className="my-4">
                                    <h1 className="mb-2">
                                        How many station transfers are you
                                        comfortable with?
                                    </h1>
                                    <Slider
                                        defaultValue={[field.value]}
                                        min={2}
                                        max={8}
                                        step={1}
                                        className="w-full max-w-md"
                                        onValueChange={(values) =>
                                            field.onChange(values[0])
                                        }
                                    >
                                        <div className="bg-gray-300 dark:bg-gray-700">
                                            <div className="bg-primary" />
                                        </div>
                                        <div className="bg-white shadow-md dark:bg-gray-950" />
                                    </Slider>
                                    <div className="flex justify-between w-full max-w-md text-sm text-gray-500 dark:text-gray-400 mt-3">
                                        <span>2</span>
                                        <span>3</span>
                                        <span>4</span>
                                        <span>5</span>
                                        <span>6</span>
                                        <span>7</span>
                                        <span>8</span>
                                    </div>
                                </div>
                            )}
                        />
                    )}

                    <div>
                        <Button
                            size="lg"
                            className="mt-2"
                            disabled={isLoading || isWalkablePropertiesLoading}
                        >
                            {(isWalkablePropertiesLoading || isLoading) && (
                                <Spinner className="mr-4" />
                            )}
                            <span>Submit</span>
                        </Button>
                    </div>
                </fieldset>
            </form>
        </Form>
    );
};

export default SearchWidget;
