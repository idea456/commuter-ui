import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { AutoComplete, AutoCompleteItem } from "../ui/autocomplete";
import { useState } from "react";
import useSearch from "@/hooks/useSearch";
import { useDebounce } from "@uidotdev/usehooks";
import { useRootStore } from "@/stores";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useDevice } from "@/hooks/useDevice";
import { Slider } from "../ui/slider";
import { Coordinate } from "@/types";

const formSchema = z.object({
    destination: z.string().min(0),
    minPrice: z.number(),
    maxPrice: z.number(),
});

type SearchAutocompleteProps = {
    onSelected: (value: AutoCompleteItem) => void;
};

export type SearchValues = z.infer<typeof formSchema>;

const SearchAutocomplete = ({ onSelected }: SearchAutocompleteProps) => {
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
        />
    );
};

const SearchForm = () => {
    const { isMobile } = useDevice();
    const [selectedOrigin, setSelectedOrigin] = useState<Coordinate | null>();
    const setOrigin = useRootStore((state) => state.setOrigin);
    const form = useForm<SearchValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destination: "",
            minPrice: 0,
            maxPrice: 0,
        },
    });

    const onSubmit = () => {
        if (selectedOrigin) setOrigin(selectedOrigin);
    };

    const onSelected = (value: AutoCompleteItem) => {
        setSelectedOrigin({
            latitude: value.latitude,
            longitude: value.longitude,
        });
    };

    if (isMobile) {
        return <SearchAutocomplete onSelected={onSelected} />;
    }

    return (
        <Dialog>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter</DialogTitle>
                    <DialogDescription>
                        You can make changes to how we should find properties
                        for you
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <div>
                        <h1>How do you want to commute?</h1>
                        <div className="flex gap-2">
                            <Select>
                                <SelectTrigger className="flex-3">
                                    <SelectValue placeholder="I want to commute by..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="apple">
                                            Commute by walking
                                        </SelectItem>
                                        <SelectItem value="banana">
                                            Commute by train
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="flex-2">
                                    <SelectValue placeholder="By distance..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="apple">
                                            within 500 metres
                                        </SelectItem>
                                        <SelectItem value="banana">
                                            within 1 kilometre
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* <div>
                        <h1>How many station transfers do you wish to take?</h1>
                        <div className="flex gap-2">
                            <Select>
                                <SelectTrigger className="flex-3">
                                    <SelectValue placeholder="I want to commute by..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="apple">
                                            Commute by walking
                                        </SelectItem>
                                        <SelectItem value="banana">
                                            Commute by train
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="flex-2">
                                    <SelectValue placeholder="By distance..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="apple">
                                            within 500 metres
                                        </SelectItem>
                                        <SelectItem value="banana">
                                            within 1 kilometre
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div> */}
                    <Button>Submit</Button>
                </div>
            </DialogContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {/* <Button>MRT View</Button> */}
                    <fieldset className="w-full rounded-lg border py-4 px-5">
                        <legend className="-ml-1 px-1 text-sm font-medium">
                            Search
                        </legend>
                        <FormField
                            control={form.control}
                            name="destination"
                            render={() => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <SearchAutocomplete
                                                onSelected={onSelected}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div>
                            <div className="my-4">
                                <h1 className="mb-2">
                                    What is your preferred commuting method?
                                </h1>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-neutral rounded-lg py-2 px-4 flex flex-col items-center justify-center hover:bg-neutral-100 cursor-pointer">
                                        <span className="text-2xl">🚶‍♂️</span>
                                        <h1>By walking</h1>
                                    </div>
                                    <div className="border border-neutral rounded-lg py-2 px-4 flex flex-col items-center justify-center hover:bg-neutral-100 cursor-pointer border-black border-2">
                                        <span className="text-2xl">🚇</span>
                                        <h1>By transit</h1>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-4"></div>
                            </div>

                            {/* <div className="my-4">
                                <h1 className="mb-2">
                                    How many station transfers are you
                                    comfortable with?
                                </h1>
                                <Slider
                                    defaultValue={[3]}
                                    min={2}
                                    max={8}
                                    step={1}
                                    className="w-full max-w-md"
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
                            </div> */}

                            <Button size="lg" className="mt-2">
                                Submit
                            </Button>
                        </div>
                    </fieldset>
                </form>
            </Form>
        </Dialog>
    );
};

export default SearchForm;
