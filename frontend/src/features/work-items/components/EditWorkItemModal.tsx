import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
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
import {
    type UpdateWorkItemPayload,
    type EditWorkItemModalProps,
} from "../types/workitem.types";
import {
    WORK_ITEM_STATUS_OPTIONS,
    WORK_ITEM_TYPE_OPTIONS,
} from "../constants/workitem.constants";
import { useUpdateWorkItemMutation } from "../hooks/useWorkItems";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import {
    useProjectByIdQuery,
    useProjectMembersQuery,
} from "../../projects/hooks/useProjects";
import { MemberAvatar } from "@/components/common/MemberAvatar";

const EditWorkItemModal = ({
    open,
    onOpenChange,
    workItem,
    onEditWorkItem,
}: EditWorkItemModalProps) => {
    const { id: projectId } = useParams<{ id: string }>();
    const { mutate: editWorkItem, isPending: isSubmitting } =
        useUpdateWorkItemMutation();

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
                    status: m.status,
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

    useEffect(() => {
        if (workItem) {
            form.reset({
                title: workItem.title,
                description: workItem.description,
                acceptanceCriteria: workItem.acceptanceCriteria,
                status: workItem.status,
                type: workItem.type,
                estimatedTime: workItem.originalEstimation ?? 0,
                remainingTime: workItem.remaining ?? 0,
                completionTime: workItem.completed ?? 0,
                assignedTo: workItem.assignedTo || "none",
            });
        }
    }, [workItem, form]);

    const onSubmit = (data: WorkItemFormValues) => {
        if (!workItem) return;
        const payload: UpdateWorkItemPayload = {
            title: data.title,
            description: data.description,
            acceptanceCriteria: data.acceptanceCriteria,
            status: data.status,
            type: data.type,
            originalEstimation: data.estimatedTime,
            remaining: data.remainingTime,
            completed: data.completionTime,
            assignedTo: data.assignedTo,
        };
        editWorkItem(
            { id: workItem.id, payload },
            {
                onSuccess: () => {
                    onEditWorkItem({
                        ...workItem,
                        title: data.title || "",
                        description: data.description || "",
                        acceptanceCriteria: data.acceptanceCriteria || "",
                        status: data.status,
                        type: data.type,
                        originalEstimation: data.estimatedTime,
                        remaining: data.remainingTime,
                        completed: data.completionTime,
                        assignedTo:
                            data.assignedTo && data.assignedTo !== "none"
                                ? data.assignedTo
                                : null,
                    });
                    onOpenChange(false);
                    toast.success("Work item updated successfully!");
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to update work item. Please try again.",
                    );
                },
            },
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                className="w-full max-w-full sm:w-150! sm:max-w-150!"
            >
                <SheetHeader>
                    <SheetTitle>Edit Work Item</SheetTitle>
                    <SheetDescription>
                        Update work item details.
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

                            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center">
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
                                                        const est =
                                                            form.getValues(
                                                                "estimatedTime",
                                                            ) || 0;
                                                        if (
                                                            val ===
                                                                "resolved" ||
                                                            val === "closed"
                                                        ) {
                                                            form.setValue(
                                                                "remainingTime",
                                                                0,
                                                            );
                                                            form.setValue(
                                                                "completionTime",
                                                                est,
                                                            );
                                                        } else {
                                                            const originalCompleted =
                                                                workItem?.completed ||
                                                                0;
                                                            form.setValue(
                                                                "completionTime",
                                                                originalCompleted,
                                                            );
                                                            form.setValue(
                                                                "remainingTime",
                                                                Math.max(
                                                                    0,
                                                                    est -
                                                                        originalCompleted,
                                                                ),
                                                            );
                                                        }
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

                            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center">
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
                                                        const status =
                                                            form.getValues(
                                                                "status",
                                                            );
                                                        if (
                                                            status ===
                                                                "resolved" ||
                                                            status === "closed"
                                                        ) {
                                                            form.setValue(
                                                                "remainingTime",
                                                                0,
                                                            );
                                                            form.setValue(
                                                                "completionTime",
                                                                numVal,
                                                            );
                                                        } else {
                                                            const completed =
                                                                form.getValues(
                                                                    "completionTime",
                                                                ) || 0;
                                                            form.setValue(
                                                                "remainingTime",
                                                                Math.max(
                                                                    0,
                                                                    numVal -
                                                                        completed,
                                                                ),
                                                            );
                                                        }
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
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value;
                                                        const numVal =
                                                            val === ""
                                                                ? 0
                                                                : Number(val);
                                                        field.onChange(numVal);
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
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value;
                                                        const numVal =
                                                            val === ""
                                                                ? 0
                                                                : Number(val);
                                                        field.onChange(numVal);
                                                    }}
                                                    placeholder="0"
                                                    className="ring-0!"
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
                                                            <div className="flex items-center gap-2">
                                                                <MemberAvatar
                                                                    name={
                                                                        member.name
                                                                    }
                                                                    status={
                                                                        member.status
                                                                    }
                                                                    size="sm"
                                                                    memberId={
                                                                        member.memberId
                                                                    }
                                                                />
                                                                <span>
                                                                    {
                                                                        member.name
                                                                    }
                                                                </span>
                                                            </div>
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

export default EditWorkItemModal;
