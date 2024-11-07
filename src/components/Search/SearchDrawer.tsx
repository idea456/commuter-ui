import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import {
    Navigation,
    SearchCheck,
    SearchCodeIcon,
    SearchIcon,
    SearchX,
} from "lucide-react";
import { useState } from "react";
import { SearchForm } from "./SearchForm";

export const SearchDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button
                className="absolute bottom-8 right-8 z-[9] rounded-full "
                size="icon"
                onClick={() => setIsOpen(true)}
            >
                <Navigation width={18} fill="white" />
            </Button>
            <Drawer open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
                <DrawerContent>
                    <div className="p-6">
                        <SearchForm />
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
};
