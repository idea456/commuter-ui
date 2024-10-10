"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Property } from "@/types";
import PropertyCard from "../PropertyCard";
import { useRootStore } from "@/hooks/stores";

export interface AnimatedListProps {
    className?: string;
    properties: Property[];
    delay?: number;
    onClickProperty: (clickedProperty: Property) => void;
}

export const AnimatedList = ({
    className,
    properties,
    onClickProperty,
    delay = 1000,
}: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const selectedProperty = useRootStore((state) => state.selectedProperty);

    useEffect(() => {
        const interval = setInterval(() => {
            if (index === properties.length - 1) {
                clearInterval(interval);
            } else {
                setIndex((prevIndex) => (prevIndex + 1) % properties.length);
            }
        }, delay);

        // return () => clearInterval(interval);
    }, [properties]);

    const itemsToShow = useMemo(
        () => properties.slice(0, index + 1).reverse(),
        [index, properties]
    );

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {properties.map((item) => (
                <PropertyCard
                    className={
                        selectedProperty?.id === item.id
                            ? "border-black border-2"
                            : ""
                    }
                    onClick={onClickProperty}
                    property={item}
                />
            ))}
        </div>
    );
};

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
    const animations = {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, originY: 0 },
        exit: { scale: 0, opacity: 0 },
        transition: { type: "spring", stiffness: 350, damping: 40 },
    };

    return (
        <motion.div {...animations} layout className="mx-auto w-full">
            {children}
        </motion.div>
    );
}
