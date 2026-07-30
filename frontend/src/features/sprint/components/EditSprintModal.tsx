import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
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
    sprintFormSchema,
    type SprintFormValues,
} from "../schema/sprint.schema";
import {
    type UpdateSprintPayload,
    type EditSprintModalProps,
} from "../types/sprint.types";
import { SPRINT_STATUS_OPTIONS } from "../constants/sprint.constants";
import { useUpdateSprintMutation } from "../hooks/useSprints";

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const EditSprintModal = ({
    open,
    onOpenChange,
    sprint,
    onEditSprint,
}: EditSprintModalProps) => {
    const { mutate: editSprint, isPending: isSubmitting } =
        useUpdateSprintMutation();
    const form = useForm<SprintFormValues>({
        resolver: zodResolver(sprintFormSchema),
        defaultValues: {
            title: "",
            description: "",
            acceptanceCriteria: "",
            status: "new",
            startDate: new Date(),
            endDate: new Date(),
            sequence: 0,
        },
    });

    useEffect(() => {
        if (sprint) {
            form.reset({
                title: sprint.title,
                description: sprint.description,
                acceptanceCriteria: sprint.acceptanceCriteria,
                status: sprint.status,
                startDate: sprint.startDate
                    ? new Date(sprint.startDate)
                    : new Date(),
                endDate: sprint.endDate ? new Date(sprint.endDate) : new Date(),
                sequence: sprint.sequence ?? 0,
            });
        }
    }, [sprint, form]);

    const startDate = form.watch("startDate");
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    const onSubmit = (data: SprintFormValues) => {
        if (!sprint) return;
        const payload: UpdateSprintPayload = {
            title: data.title,
            description: data.description,
            acceptanceCriteria: data.acceptanceCriteria,
            status: data.status,
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            sequence: data.sequence,
        };
        editSprint(
            { id: sprint.id, payload },
            {
                onSuccess: () => {
                    onEditSprint(sprint);
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                className="w-full! max-w-full! sm:w-150! sm:max-w-150!"
            >
                <SheetHeader>
                    <SheetTitle>Edit Sprint</SheetTitle>
                    <SheetDescription>Update sprint details.</SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 min-h-0 auto-rows-min gap-6 px-4 overflow-y-auto">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-5"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sprint Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter sprint title"
                                                className="ring-0!"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-2 w-full sm:grid-cols-2 sm:items-center">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col flex-1">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover
                                                open={startDateOpen}
                                                onOpenChange={setStartDateOpen}
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
                                                        selected={field.value}
                                                        onSelect={(date) => {
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
                                                onOpenChange={setEndDateOpen}
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
                                                        selected={field.value}
                                                        onSelect={(date) => {
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
                                                placeholder="Enter sprint description"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="acceptanceCriteria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Acceptance Criteria
                                        </FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                placeholder="Enter acceptance criteria"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-2 w-full sm:grid-cols-2 sm:items-center">
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
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {SPRINT_STATUS_OPTIONS.map(
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

                                <FormField
                                    control={form.control}
                                    name="sequence"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Sequence</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    name={field.name}
                                                    value={field.value}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value;
                                                        field.onChange(
                                                            val === ""
                                                                ? 0
                                                                : Number(val),
                                                        );
                                                    }}
                                                    placeholder="Enter sequence number"
                                                    className="ring-0!"
                                                />
                                            </FormControl>
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
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save changes"
                                    )}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default EditSprintModal;
