import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import RichTextEditor from "@/components/common/RichTextEditor";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    phaseFormSchema,
    PHASE_STATUS_OPTIONS,
    PHASE_TYPES,
    type PhaseFormValues,
} from "../schema/phases.schema";
import { convertFormToUpdatePayload } from "../utils/phase.utils";
import { useUpdatePhaseMutation } from "../hooks/usePhases";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Phase {
    id: number;
    name: string;
    type: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface EditPhaseModalProps {
    phase: Phase | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EditPhaseModal = ({ phase, open, onOpenChange }: EditPhaseModalProps) => {
    const [isLoading] = useState(false);
    const { mutate: updatePhase, isPending: isSubmitting } =
        useUpdatePhaseMutation();

    const form = useForm<PhaseFormValues>({
        resolver: zodResolver(phaseFormSchema),
        defaultValues: {
            name: "",
            type: "New Development",
            customType: "",
            description: "",
            startDate: new Date(),
            endDate: new Date(),
            status: "notstarted",
        },
    });

    useEffect(() => {
        if (phase) {
            const isCustom = !PHASE_TYPES.includes(
                phase.type as (typeof PHASE_TYPES)[number],
            );
            form.reset({
                name: phase.name ?? "",
                type: isCustom
                    ? "Custom"
                    : (phase.type as (typeof PHASE_TYPES)[number]),
                customType: isCustom ? phase.type : "",
                description: phase.description ?? "",
                startDate: phase.startDate
                    ? new Date(phase.startDate)
                    : new Date(),
                endDate: phase.endDate ? new Date(phase.endDate) : new Date(),
                status:
                    (phase.status as PhaseFormValues["status"]) ?? "notstarted",
            });
        }
    }, [phase, form]);

    const watchType = form.watch("type");
    const startDate = form.watch("startDate");
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    const onSubmit = (data: PhaseFormValues) => {
        if (!phase?.id) return;
        const payload = convertFormToUpdatePayload(data);
        updatePhase(
            { id: phase.id, payload },
            {
                onSuccess: () => {
                    toast.success("Phase updated successfully!");
                    onOpenChange(false);
                    form.reset();
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to update phase. Please try again.",
                    );
                },
            },
        );
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(val) => {
                onOpenChange(val);
                if (!val) {
                    form.reset();
                }
            }}
        >
            <SheetContent
                showCloseButton={false}
                className="max-sm:w-full! sm:w-150! sm:max-w-150!"
            >
                <SheetHeader>
                    <SheetTitle>Edit Phase</SheetTitle>
                    <SheetDescription>Update phase details.</SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 min-h-0 auto-rows-min gap-6 px-4 sm:px-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phase Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter phase name"
                                                    className="ring-0!"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center gap-2 w-full">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Type</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {PHASE_TYPES.map(
                                                                (option) => (
                                                                    <SelectItem
                                                                        key={
                                                                            option
                                                                        }
                                                                        value={
                                                                            option
                                                                        }
                                                                    >
                                                                        {option}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Status</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {PHASE_STATUS_OPTIONS.map(
                                                                (option) => (
                                                                    <SelectItem
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {watchType === "Custom" && (
                                    <FormField
                                        control={form.control}
                                        name="customType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Custom Type
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Enter custom type"
                                                        className="ring-0!"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <RichTextEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    placeholder="Enter phase description"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center gap-2 w-full">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col flex-1">
                                                <FormLabel>
                                                    Start Date
                                                </FormLabel>
                                                <Popover
                                                    open={startDateOpen}
                                                    onOpenChange={
                                                        setStartDateOpen
                                                    }
                                                >
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                                                                    !field.value &&
                                                                        "text-muted-foreground",
                                                                )}
                                                            >
                                                                {field.value
                                                                    ? format(
                                                                          field.value,
                                                                          "PPP",
                                                                      )
                                                                    : "Pick start date"}
                                                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                                            </button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={(
                                                                date,
                                                            ) => {
                                                                field.onChange(
                                                                    date,
                                                                );
                                                                setStartDateOpen(
                                                                    false,
                                                                );
                                                            }}
                                                            disabled={{
                                                                before: new Date(),
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col flex-1">
                                                <FormLabel>End Date</FormLabel>
                                                <Popover
                                                    open={endDateOpen}
                                                    onOpenChange={
                                                        setEndDateOpen
                                                    }
                                                >
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                                                                    !field.value &&
                                                                        "text-muted-foreground",
                                                                )}
                                                            >
                                                                {field.value
                                                                    ? format(
                                                                          field.value,
                                                                          "PPP",
                                                                      )
                                                                    : "Pick end date"}
                                                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                                            </button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={(
                                                                date,
                                                            ) => {
                                                                field.onChange(
                                                                    date,
                                                                );
                                                                setEndDateOpen(
                                                                    false,
                                                                );
                                                            }}
                                                            disabled={{
                                                                before: startDate,
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <SheetFooter className="flex flex-col-reverse gap-2 px-0 mt-6 sm:flex-row sm:justify-end">
                                    <SheetClose asChild>
                                        <Button
                                            variant="outline"
                                            className="flex-1 sm:flex-none"
                                        >
                                            Close
                                        </Button>
                                    </SheetClose>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save changes"
                                        )}
                                    </Button>
                                </SheetFooter>
                            </form>
                        </Form>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default EditPhaseModal;
