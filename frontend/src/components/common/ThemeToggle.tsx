import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";

const OPTIONS = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const Icon = resolvedTheme === "dark" ? Moon : Sun;

    return (
        <DropdownMenu>
            <SimpleTooltip label="Theme">
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Change theme"
                    >
                        <Icon className="size-[18px]" />
                    </Button>
                </DropdownMenuTrigger>
            </SimpleTooltip>
            <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={theme ?? "system"}
                    onValueChange={setTheme}
                >
                    {OPTIONS.map(({ value, label, icon: OptIcon }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                            <OptIcon className="text-muted-foreground" />
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Radio group for embedding inside another menu (profile dropdown). */
export function ThemeRadioItems() {
    const { theme, setTheme } = useTheme();
    return (
        <DropdownMenuRadioGroup
            value={theme ?? "system"}
            onValueChange={setTheme}
        >
            {OPTIONS.map(({ value, label, icon: OptIcon }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                    <OptIcon className="text-muted-foreground" />
                    {label}
                </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
    );
}
