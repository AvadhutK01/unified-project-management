import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    SheetTrigger,
} from "@/components/ui/sheet";
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
    workItemFormSchema,
    type WorkItemFormValues,
} from "../schema/workitem.schema";
import { convertFormToPayload } from "../utils/workitem.utils";
import { useCreateWorkItemMutation } from "../hooks/useWorkItems";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { WorkItem, AddWorkItemModalProps } from "../types/workitem.types";
import {
    WORK_ITEM_STATUS_OPTIONS,
    WORK_ITEM_TYPE_OPTIONS,
} from "../constants/workitem.constants";
import {
    useProjectByIdQuery,
    useProjectMembersQuery,
} from "../../projects/hooks/useProjects";

const AddWorkItemModal = ({ onAddWorkItem, canAdd }: AddWorkItemModalProps) => {
    const [open, setOpen] = useState(false);
    const { id: projectId, sprintId } = useParams<{
        id: string;
        sprintId: string;
    }>();
    const { mutate: createWorkItem, isPending: isSubmitting } =
        useCreateWorkItemMutation();

    const { data: projectData } = useProjectByIdQuery(projectId);
    const { data: projectMembersData } = useProjectMembersQuery(projectId);

    const projectMembers = useMemo(() => {
        if (!projectData?.data?.members || !projectMembersData?.data?.data)
            return [];
        return projectMembersData.data.data
            .map((m: any) => {
                const pm = projectData.data.members.find(
                    (pMember: any) =>
                        pMember.organizationMemberId === m.memberId,
                );
                return {
                    id: pm?.id || "",
                    name: m.name,
                    email: m.email,
                };
            })
            .filter((m: any) => m.id);
    }, [projectData, projectMembersData]);

    const form = useForm<WorkItemFormValues>({
        resolver: zodResolver(workItemFormSchema),
        defaultValues: {
            title: "",
            description: "",
            acceptanceCriteria: "",
            status: "new",
            type: "task",
            estimatedTime: 0,
            remainingTime: 0,
            completionTime: 0,
            assignedTo: "none",
        },
    });

    const selectedType = form.watch("type");
    const statusOptions = useMemo(
        () =>
            selectedType === "task"
                ? WORK_ITEM_STATUS_OPTIONS.filter((o) => o.value !== "resolved")
                : WORK_ITEM_STATUS_OPTIONS,
        [selectedType],
    );

    const onSubmit = (data: WorkItemFormValues) => {
        if (!sprintId) return;
        const payload = convertFormToPayload(data, sprintId);
        createWorkItem(payload, {
            onSuccess: (res) => {
                onAddWorkItem(res as WorkItem);
                toast.success("Work item created successfully!");
                setOpen(false);
                form.reset();
            },
            onError: (error: any) => {
                toast.error(
                    error?.response?.data?.message ||
                        "Failed to create work item. Please try again.",
                );
            },
        });
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(val) => {
                setOpen(val);
                if (!val) {
                    form.reset();
                }
            }}
        >
            <SheetTrigger asChild>
                {canAdd && (
                    <Button>
                        <Plus className="size-4" />
                        Add Work Item
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent showCloseButton={false} className="w-150! max-w-150!">
                <SheetHeader>
                    <SheetTitle>Add Work Item</SheetTitle>
                    <SheetDescription>
                        Add a new work item to track tasks and bugs.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
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
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter work item title"
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
                                                    onValueChange={(val) => {
                                                        if (val === "") return;
                                                        field.onChange(val);
                                                        if (
                                                            val === "task" &&
                                                            form.getValues(
                                                                "status",
                                                            ) === "resolved"
                                                        ) {
                                                            form.setValue(
                                                                "status",
                                                                "new",
                                                            );
                                                        }
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {WORK_ITEM_TYPE_OPTIONS.map(
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
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(val) => {
                                                        if (val === "") return;
                                                        field.onChange(val);
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {statusOptions.map(
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

                            <div className="flex items-center gap-2 w-full">
                                <FormField
                                    control={form.control}
                                    name="estimatedTime"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>
                                                Estimated Time (hrs)
                                            </FormLabel>
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
                                                        const numVal =
                                                            val === ""
                                                                ? 0
                                                                : Number(val);
                                                        field.onChange(numVal);
                                                        form.setValue(
                                                            "remainingTime",
                                                            numVal,
                                                        );
                                                        form.setValue(
                                                            "completionTime",
                                                            0,
                                                        );
                                                    }}
                                                    placeholder="0"
                                                    className="ring-0!"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="remainingTime"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>
                                                Remaining Time (hrs)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    name={field.name}
                                                    value={field.value}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    readOnly
                                                    placeholder="0"
                                                    className="ring-0! bg-secondary/50 cursor-not-allowed"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="completionTime"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>
                                                Completed Time (hrs)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    name={field.name}
                                                    value={field.value}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    readOnly
                                                    placeholder="0"
                                                    className="ring-0! bg-secondary/50 cursor-not-allowed"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="assignedTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned To</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Unassigned" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Unassigned
                                                </SelectItem>
                                                {projectMembers.map(
                                                    (member: any) => (
                                                        <SelectItem
                                                            key={member.id}
                                                            value={member.id}
                                                        >
                                                            {member.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                placeholder="Enter work item description"
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

                            <SheetFooter className="flex flex-row justify-end gap-2 px-0 mt-6">
                                <SheetClose asChild>
                                    <Button variant="outline">Close</Button>
                                </SheetClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Work Item"
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

export default AddWorkItemModal;
