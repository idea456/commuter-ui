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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Label } from "@radix-ui/react-label";

const formSchema = z.object({
    destination: z.string().min(0),
    minPrice: z.number(),
    maxPrice: z.number(),
});

type SearchFormProps = {
    onSubmit: (values: z.infer<typeof formSchema>) => void;
};

export type SearchValues = z.infer<typeof formSchema>;

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
                    <fieldset className="grid gap-3 rounded-lg border p-4">
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
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 flex w-full">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type="search"
                                                    placeholder="Search..."
                                                    className="w-full rounded-lg bg-background pl-8"
                                                />
                                            </div>
                                            <DialogTrigger asChild>
                                                <Button variant="outline">
                                                    <Filter className=" left-2.5 top-2.5 h-4 w-4 text-muted-foreground mr-2" />
                                                    Filter
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="my-2">
                            <FormLabel className="text-md">
                                Price Range
                            </FormLabel>
                            <div className="grid grid-cols-2 gap-x-4 mt-2">
                                <FormField
                                    control={form.control}
                                    name="minPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(event) =>
                                                        field.onChange(
                                                            Number(
                                                                event.target
                                                                    .value
                                                            )
                                                        )
                                                    }
                                                    placeholder="Min Price"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Walk</Button>
                            <Button type="submit" variant="outline">
                                Using bus
                            </Button>
                            <Button type="submit" variant="outline">
                                Using train
                            </Button>
                        </div>
                    </fieldset>
                </form>
            </Form>
        </Dialog>
    );
};

export default SearchForm;
