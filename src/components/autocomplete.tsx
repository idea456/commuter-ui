import {
    CommandGroup,
    CommandItem,
    CommandList,
    CommandInput,
} from "./ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";

import { Skeleton } from "./ui/skeleton";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { SearchItem } from "@/types";
import { useDevice } from "@/hooks/useDevice";

export type Option = Record<"value" | "label", string> &
    Record<string, string> &
    SearchItem;

type AutoCompleteProps = {
    options: (Option & SearchItem)[];
    emptyMessage: string;
    value?: Option & SearchItem;
    onValueChange?: (value: Option) => void;
    onInputChange: (value: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
};

export const AutoComplete = ({
    options,
    placeholder,
    emptyMessage,
    value,
    onValueChange,
    onInputChange,
    disabled,
    isLoading = false,
}: AutoCompleteProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { isMobile } = useDevice();
    const [isOpen, setOpen] = useState(false);
    const [selected, setSelected] = useState<Option>(value as Option);
    const [inputValue, setInputValue] = useState<string>(value?.label || "");

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current;
            if (!input) {
                return;
            }

            // Keep the options displayed when the user is typing
            if (!isOpen && options.length) {
                setOpen(true);
            }

            // This is not a default behaviour of the <input /> field
            if (event.key === "Enter" && input.value !== "") {
                const optionToSelect = options.find(
                    (option) => option.label === input.value
                );
                if (optionToSelect) {
                    setSelected(optionToSelect);
                    onValueChange?.(optionToSelect);
                }
            }

            if (event.key === "Escape") {
                input.blur();
            }
        },
        [isOpen, options, onValueChange]
    );

    const handleBlur = useCallback(() => {
        setOpen(false);
        setInputValue(selected?.label);
    }, [selected]);

    const handleSelectOption = useCallback(
        (selectedOption: Option) => {
            setInputValue(selectedOption.label);

            setSelected(selectedOption);
            onValueChange?.(selectedOption);

            // This is a hack to prevent the input from being focused after the user selects an option
            // We can call this hack: "The next tick"
            setTimeout(() => {
                inputRef?.current?.blur();
            }, 0);
        },
        [onValueChange]
    );

    return (
        <CommandPrimitive onKeyDown={handleKeyDown} className="w-full">
            <div>
                <CommandInput
                    ref={inputRef}
                    value={inputValue}
                    onValueChange={isLoading ? undefined : setInputValue}
                    onInput={(e) => onInputChange(e.target?.value || "")}
                    onBlur={handleBlur}
                    onFocus={() => {
                        if (inputValue.length) setOpen(true);
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn("text-base", {
                        "border-none": isMobile,
                    })}
                />
            </div>
            <div className="relative mt-1">
                <div
                    className={cn(
                        "animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-white outline-none",
                        isOpen ? "block" : "hidden"
                    )}
                >
                    <CommandList className="rounded-lg ring-1 ring-slate-200">
                        {isLoading ? (
                            <CommandPrimitive.Loading>
                                <div className="p-1">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </CommandPrimitive.Loading>
                        ) : null}
                        {options.length > 0 && !isLoading ? (
                            <CommandGroup>
                                {options.map((option, i) => {
                                    const isSelected =
                                        selected?.value === option.value;
                                    return (
                                        <CommandItem
                                            key={`${option.value}-${i}`}
                                            value={`${option.value}-${i}`}
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                            }}
                                            onSelect={() =>
                                                handleSelectOption(option)
                                            }
                                            className={cn(
                                                "flex w-full items-center overflow-hidden text-ellipsis",
                                                !isSelected ? "pl-4" : null
                                            )}
                                        >
                                            {isSelected ? (
                                                <Check className="w-4" />
                                            ) : null}
                                            <div className="flex flex-col gap-1 w-full py-2">
                                                <Label className="font-bold">
                                                    {option.name}
                                                </Label>
                                                <span className="text-ellipsis">
                                                    {option.address}
                                                    ...
                                                </span>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        ) : null}
                        {!isLoading ? (
                            <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                                {emptyMessage}
                            </CommandPrimitive.Empty>
                        ) : null}
                    </CommandList>
                </div>
            </div>
        </CommandPrimitive>
    );
};
