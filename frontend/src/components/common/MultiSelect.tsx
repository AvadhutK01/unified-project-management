import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";

type User = {
    label: string;
    value: string;
};

type Props = {
    value: string[];
    onChange: (value: string[]) => void;
    options: User[];
    placeholder?: string;
};

const MultiSelect = ({
    value = [],
    onChange,
    options,
    placeholder = "Select users",
}: Props) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const toggleUser = (val: string) => {
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    const MAX_VISIBLE = 6;
    const visibleUsers = value.slice(0, MAX_VISIBLE);
    const remaining = value.length - MAX_VISIBLE;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    ref={triggerRef}
                    type="button"
                    className="flex w-full items-start justify-between min-h-9 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto pr-1 flex-1">
                        {value.length > 0 ? (
                            <>
                                {visibleUsers.map((val) => {
                                    const user = options.find(
                                        (u) => u.value === val,
                                    );
                                    return (
                                        <Badge
                                            key={val}
                                            variant="secondary"
                                            className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md"
                                        >
                                            {user?.label}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleUser(val);
                                                }}
                                            />
                                        </Badge>
                                    );
                                })}

                                {remaining > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs px-2 py-0.5"
                                    >
                                        +{remaining} more
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground text-sm">
                                {placeholder}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {value.length > 0 && (
                            <div
                                role="button"
                                className="p-0.5 hover:bg-muted rounded-full transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onChange([]);
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <X className="h-4 w-4 opacity-50 hover:opacity-100" />
                            </div>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50 mt-1" />
                    </div>
                </button>
            </PopoverTrigger>

            <PopoverContent
                style={{
                    width: triggerRef.current?.offsetWidth,
                }}
                className="p-0"
                onWheel={(e) => e.stopPropagation()}
            >
                <Command className="max-h-[300px]">
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>

                        <CommandGroup className="overflow-y-auto">
                            {options.map((user) => (
                                <CommandItem
                                    key={user.value}
                                    onSelect={() => toggleUser(user.value)}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${
                                            value.includes(user.value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                    {user.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default MultiSelect;
