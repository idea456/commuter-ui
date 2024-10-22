import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { AutoComplete, Option } from "./autocomplete";
import { useMemo, useState } from "react";
import useSearch from "@/hooks/useSearch";
import { useDebounce } from "@uidotdev/usehooks";
import { useRootStore } from "@/hooks/stores";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { useDevice } from "@/hooks/useDevice";

const formSchema = z.object({
    destination: z.string().min(0),
    minPrice: z.number(),
    maxPrice: z.number(),
});

type SearchFormProps = {
    onSubmit: (values: z.infer<typeof formSchema>) => void;
};

export type SearchValues = z.infer<typeof formSchema>;

const SearchAutocomplete = () => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
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
            placeholder="Where are you commuting to?"
        />
    );
};

const SearchForm = ({ onSubmit }: SearchFormProps) => {
    const { isMobile } = useDevice();
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

    if (isMobile) {
        return <SearchAutocomplete />;
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
                    <div>
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
                    </div>
                    <Button>Submit</Button>
                </div>
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
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <SearchAutocomplete />
                                            <DialogTrigger asChild>
                                                <Button variant="outline">
                                                    <Filter className=" left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div
                            className="grid mt-2 w-full"
                            style={{
                                gridTemplateColumns: "70% 30%",
                            }}
                        ></div>
                    </fieldset>
                </form>
            </Form>
        </Dialog>
    );
};

export default SearchForm;
