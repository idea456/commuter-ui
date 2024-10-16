import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { AutoComplete, Option } from "./autocomplete";
import { useMemo, useState } from "react";
import useSearch from "@/hooks/useSearch";
import { useDebounce } from "@uidotdev/usehooks";
import { useStore } from "zustand";
import { useRootStore } from "@/hooks/stores";

const formSchema = z.object({
    destination: z.string().min(0),
    minPrice: z.number(),
    maxPrice: z.number(),
});

type SearchFormProps = {
    onSubmit: (values: z.infer<typeof formSchema>) => void;
};

export type SearchValues = z.infer<typeof formSchema>;

const FRAMEWORKS = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
    {
        value: "wordpress",
        label: "WordPress",
    },
    {
        value: "express.js",
        label: "Express.js",
    },
    {
        value: "nest.js",
        label: "Nest.js",
    },
];

const SearchAutocomplete = () => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 1000);
    const { items, isLoading } = useSearch(debouncedQuery);

    const setOrigin = useRootStore((state) => state.setOrigin);

    const options = useMemo(
        () =>
            items.map((item) => ({
                value: item.name,
                label: item.name,
                ...item,
            })),
        [items]
    );

    const setSelectedOrigin = (value: Option) => {
        setOrigin({
            latitude: value.latitude,
            longitude: value.longitude,
        });
    };

    return (
        <AutoComplete
            options={options}
            onInputChange={setQuery}
            onValueChange={setSelectedOrigin}
            isLoading={isLoading}
            value={query}
            placeholder="Search your commuting place..."
        />
    );
};

const SearchForm = ({ onSubmit }: SearchFormProps) => {
    const form = useForm<SearchValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destination: "",
            minPrice: 0,
            maxPrice: 0,
        },
    });

    const onSubmitImpl = (values: SearchValues) => {
        onSubmit(values);
    };

    return (
        <Dialog>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter</DialogTitle>
                </DialogHeader>
            </DialogContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitImpl)}>
                    {/* <Button>MRT View</Button> */}
                    <fieldset className="w-full rounded-lg border p-4">
                        <legend className="-ml-1 px-1 text-sm font-medium">
                            Search
                        </legend>
                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-md">
                                        Where are you commuting to?
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex">
                                            {/* <div className="relative flex-1 flex w-full"> */}
                                            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type="search"
                                                    placeholder="Search..."
                                                    className="w-full rounded-lg bg-background pl-8"
                                                /> */}
                                            <SearchAutocomplete />
                                            {/* </div> */}
                                            {/* <DialogTrigger asChild>
                                                <Button variant="outline">
                                                    <Filter className=" left-2.5 top-2.5 h-4 w-4 text-muted-foreground mr-2" />
                                                    Filter
                                                </Button>
                                            </DialogTrigger> */}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/* <div className="flex gap-2">
                            <Button type="submit">Walk</Button>
                            <Button type="submit" variant="outline">
                                Using bus
                            </Button>
                            <Button type="submit" variant="outline">
                                Using train
                            </Button>
                        </div> */}
                    </fieldset>
                </form>
            </Form>
        </Dialog>
    );
};

export default SearchForm;
